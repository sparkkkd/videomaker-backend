import { Injectable, UnauthorizedException } from '@nestjs/common'

import { ConfigService } from '@nestjs/config'

import { JwtService, JwtSignOptions } from '@nestjs/jwt'

import * as bcrypt from 'bcrypt'

import { PrismaService } from 'src/database/prisma.service'

import { LoginDto } from './dto/login.dto'

import { TokenResponseDto } from './dto/token-response.dto'

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto): Promise<TokenResponseDto> {
    const admin = await this.validateUser(loginDto.email, loginDto.password)

    if (!admin) {
      throw new UnauthorizedException('Неверный email или пароль')
    }

    const tokens = await this.generateTokens(admin.userId, admin.email)

    await this.storeRefreshToken(admin.userId, tokens.refreshToken)

    return tokens
  }

  async refresh(refreshToken: string): Promise<TokenResponseDto> {
    const payload = await this.jwtService.verifyAsync(refreshToken, {
      secret: this.configService.getOrThrow('app.jwt.refreshSecret'),
    })

    const sessions = await this.prisma.refreshToken.findMany({
      where: {
        userId: payload.sub,
      },
    })

    let validSession: {
      id: string
    } | null = null

    for (const session of sessions) {
      const isValid = await bcrypt.compare(refreshToken, session.hashedToken)

      if (isValid) {
        validSession = {
          id: session.id,
        }

        break
      }
    }

    if (!validSession) {
      throw new UnauthorizedException('Invalid refresh token')
    }

    const admin = await this.prisma.adminUser.findUnique({
      where: {
        id: payload.sub,
      },

      select: {
        id: true,
        email: true,
      },
    })

    if (!admin) {
      throw new UnauthorizedException('Admin not found')
    }

    await this.prisma.refreshToken
      .delete({
        where: { id: validSession.id },
      })
      .catch((error) => {
        if (error?.code !== 'P2025') {
          throw error
        }
      })

    const tokens = await this.generateTokens(admin.id, admin.email)
    await this.storeRefreshToken(admin.id, tokens.refreshToken)

    return tokens
  }

  async logout(refreshToken: string): Promise<void> {
    const sessions = await this.prisma.refreshToken.findMany()

    for (const session of sessions) {
      const isValid = await bcrypt.compare(refreshToken, session.hashedToken)

      if (isValid) {
        await this.prisma.refreshToken.delete({
          where: {
            id: session.id,
          },
        })

        return
      }
    }
  }

  private async validateUser(email: string, password: string) {
    const admin = await this.prisma.adminUser.findUnique({
      where: {
        email,
      },

      select: {
        id: true,
        email: true,
        password: true,
      },
    })

    if (!admin) {
      return null
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password)

    if (!isPasswordValid) {
      return null
    }

    return {
      userId: admin.id,
      email: admin.email,
    }
  }

  private async generateTokens(
    userId: string,
    email: string,
  ): Promise<TokenResponseDto> {
    const refreshSecret = this.configService.getOrThrow<string>(
      'app.jwt.refreshSecret',
    )

    const refreshExpiresIn = this.configService.getOrThrow<string>(
      'app.jwt.refreshExpiresIn',
    )

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync({
        sub: userId,
        email,
      }),

      this.jwtService.signAsync(
        {
          sub: userId,
        },
        {
          secret: refreshSecret,
          expiresIn: refreshExpiresIn,
        } as JwtSignOptions,
      ),
    ])

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: 60 * 15,
    }
  }

  private async storeRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    const hashedToken = await bcrypt.hash(refreshToken, 10)

    const expiresAt = new Date()

    expiresAt.setDate(expiresAt.getDate() + 30)

    await this.prisma.refreshToken.create({
      data: {
        hashedToken,
        userId,
        expiresAt,
      },
    })
  }
}

import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService, JwtSignOptions } from '@nestjs/jwt'
import { PrismaService } from 'src/database/prisma.service'
import { v4 as uuidv4 } from 'uuid'
import * as bcrypt from 'bcrypt'
import { LoginDto } from './dto/login.dto'
import { TokenResponseDto } from './dto/token-response.dto'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<{
    userId: string
    email: string
  } | null> {
    const user = await this.prisma.adminUser.findUnique({
      where: { email },
      select: { id: true, email: true, password: true },
    })

    if (!user) return null

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) return null

    return { userId: user.id, email: user.email }
  }

  async login(loginDto: LoginDto): Promise<TokenResponseDto> {
    const user = await this.validateUser(loginDto.email, loginDto.password)

    if (!user) throw new UnauthorizedException('Неверный email или пароль')

    const tokens = await this.generateTokens(user.userId, user.email)
    await this.storeRefreshToken(user.userId, tokens.refreshToken)

    return tokens
  }

  async refresh(refreshToken: string): Promise<TokenResponseDto> {
    const tokenRecord = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    })

    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      await this.prisma.refreshToken
        .deleteMany({
          where: { token: refreshToken },
        })
        .catch(() => {})
      throw new UnauthorizedException('Неверный токен')
    }

    const tokens = await this.generateTokens(
      tokenRecord.userId,
      tokenRecord.user.email,
    )

    await this.prisma.refreshToken.delete({ where: { token: refreshToken } })
    await this.storeRefreshToken(tokenRecord.userId, tokens.refreshToken)

    return tokens
  }

  async logout(refreshToken: string): Promise<void> {
    await this.prisma.refreshToken
      .delete({ where: { token: refreshToken } })
      .catch(() => {})
  }

  private async generateTokens(
    userId: string,
    email: string,
  ): Promise<TokenResponseDto> {
    const refreshSecret = this.configService.get<string>(
      'app.jwt.refreshSecret',
    )
    const refreshExpiresIn = this.configService.get<string>(
      'app.jwt.refreshExpiresIn',
    )

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync({ sub: userId, email }),
      this.jwtService.signAsync({ sub: userId }, {
        secret: refreshSecret,
        expiresIn: refreshExpiresIn,
      } as JwtSignOptions),
    ])

    return { accessToken, refreshToken, tokenType: 'Bearer', expiresIn: 604800 }
  }

  private async storeRefreshToken(
    userId: string,
    token: string,
  ): Promise<void> {
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)

    await this.prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    })
  }
}

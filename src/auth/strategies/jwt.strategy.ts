import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { PrismaService } from 'src/database/prisma.service'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('app.jwt.secret')!,
    })
  }

  async validate(payload: { sub: string; email: string }) {
    const user = await this.prisma.adminUser.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true },
    })

    if (!user) throw new UnauthorizedException('Пользователь не найден')

    return { userId: user.id, email: user.email }
  }
}

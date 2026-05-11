import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common'

import type { Request, Response } from 'express'

import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

import { AuthService } from './auth.service'

import { LoginDto } from './dto/login.dto'

import { TokenResponseDto } from './dto/token-response.dto'

import {
  clearRefreshTokenCookie,
  setRefreshTokenCookie,
} from './utils/cookie.utils'

import { REFRESH_TOKEN_COOKIE } from './constants/cookie.constants'

@ApiTags('Аутентификация')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Вход в админ панель',
  })
  @ApiResponse({
    status: 200,
    type: TokenResponseDto,
  })
  async login(
    @Body() loginDto: LoginDto,

    @Res({ passthrough: true })
    response: Response,
  ): Promise<TokenResponseDto> {
    const tokens = await this.authService.login(loginDto)

    setRefreshTokenCookie(response, tokens.refreshToken)

    return {
      ...tokens,

      refreshToken: undefined!,
    }
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() request: Request,

    @Res({ passthrough: true })
    response: Response,
  ): Promise<TokenResponseDto> {
    const refreshToken = request.cookies?.[REFRESH_TOKEN_COOKIE]

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing')
    }

    const tokens = await this.authService.refresh(refreshToken)

    setRefreshTokenCookie(response, tokens.refreshToken)

    return {
      ...tokens,

      refreshToken: undefined!,
    }
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() request: Request,

    @Res({ passthrough: true })
    response: Response,
  ): Promise<void> {
    const refreshToken = request.cookies?.[REFRESH_TOKEN_COOKIE]

    if (refreshToken) {
      await this.authService.logout(refreshToken)
    }

    clearRefreshTokenCookie(response)
  }
}

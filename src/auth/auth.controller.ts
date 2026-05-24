import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UnauthorizedException,
} from '@nestjs/common'

import type { Request, Response } from 'express'

import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

import { AuthService } from './auth.service'

import { LoginDto } from './dto/login.dto'

import { TokenResponseDto } from './dto/token-response.dto'

@ApiTags('Аутентификация')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Вход в админ панель' })
  @ApiResponse({ status: 200, type: TokenResponseDto })
  async login(@Body() loginDto: LoginDto): Promise<TokenResponseDto> {
    return this.authService.login(loginDto)
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Обновление токенов' })
  async refresh(
    @Body() body: { refreshToken: string },
  ): Promise<TokenResponseDto> {
    if (!body.refreshToken) {
      throw new UnauthorizedException('Refresh token missing')
    }
    return this.authService.refresh(body.refreshToken)
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Body() body: { refreshToken: string }): Promise<void> {
    if (body.refreshToken) {
      await this.authService.logout(body.refreshToken)
    }
  }
}

import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  UnauthorizedException,
} from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { AuthService } from './auth.service'
import { LoginDto } from './dto/login.dto'
import { TokenResponseDto } from './dto/token-response.dto'

@ApiTags('Аутентификация')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Вход в админ панель' })
  @ApiResponse({ status: 200, type: TokenResponseDto })
  async login(@Body() loginDto: LoginDto): Promise<TokenResponseDto> {
    return this.authService.login(loginDto)
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Обновление токена' })
  @ApiResponse({ status: 200, type: TokenResponseDto })
  async refresh(
    @Headers('authorization') authHeader: string,
  ): Promise<TokenResponseDto> {
    const refreshToken = authHeader.replace('Bearer ', '')
    if (!refreshToken) throw new UnauthorizedException('Неверный токен')
    return this.authService.refresh(refreshToken)
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Выход из админ панели' })
  async logout(@Headers('authorization') authHeader: string): Promise<void> {
    const refreshToken = authHeader.replace('Bearer ', '')
    if (refreshToken) await this.authService.logout(refreshToken)
  }
}

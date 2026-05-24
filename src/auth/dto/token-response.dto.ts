import { ApiProperty } from '@nestjs/swagger'

export class TokenResponseDto {
  @ApiProperty({ description: 'Access token' })
  accessToken!: string

  @ApiProperty({ description: 'Refresh token' })
  refreshToken!: string

  // @ApiProperty({ description: 'Тип токена' })
  // tokenType!: string

  // @ApiProperty({ description: 'Время жизни токена' })
  // expiresIn!: number
}

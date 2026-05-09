import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator'

export class LoginDto {
  @ApiProperty({
    example: 'admin@example.com',
    description: 'Email администратора',
  })
  @IsEmail({}, { message: 'Невалидный email' })
  @IsNotEmpty({ message: 'Email обязателен' })
  readonly email!: string

  @ApiProperty({
    example: 'password123',
    description: 'Пароль (мин. 6 символов)',
  })
  @IsString()
  @IsNotEmpty({ message: 'Пароль обязателен' })
  @MinLength(6, { message: 'Минимум 6 символов' })
  readonly password!: string
}

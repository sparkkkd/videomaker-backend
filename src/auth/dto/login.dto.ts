import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator'

export class LoginDto {
  @ApiProperty({
    example: 'admin@exmaple.com',
    description: 'Email администратора',
  })
  @IsEmail({}, { message: 'Некорректный email' })
  @IsNotEmpty({ message: 'Email не может быть пустым' })
  readonly email!: string

  @ApiProperty({
    example: '123456',
    description: 'Пароль администратора',
  })
  @IsString()
  @IsNotEmpty({ message: 'Пароль не может быть пустым' })
  @MinLength(6, { message: 'Пароль должен быть не менее 6 символов' })
  readonly password!: string
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator'

export class CreateTabDto {
  @ApiProperty({ example: 'Моушн-дизайн', description: 'Название таба' })
  @IsString()
  @MaxLength(100)
  readonly label!: string

  @ApiProperty({
    example: 'motion-design',
    description: 'URL-friendly слаг таба',
  })
  @IsString()
  @MaxLength(100)
  @Matches(/^[a-z0-9-]+$/, { message: 'Только латиница, цифры и дефис' })
  readonly slug!: string

  @ApiPropertyOptional({ description: 'Описание' })
  @IsString()
  @MaxLength(500)
  readonly description!: string

  @ApiPropertyOptional({ example: 0, description: 'Порядок сортировки' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  readonly order?: number
}

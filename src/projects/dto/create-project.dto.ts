import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsString,
  IsOptional,
  IsNumber,
  IsUrl,
  Min,
  MaxLength,
  Matches,
} from 'class-validator'

export class CreateProjectDto {
  @ApiProperty({
    example: 'Промо-ролик для бренда',
    description: 'Название проекта',
  })
  @IsString()
  @MaxLength(200)
  readonly label!: string

  @ApiProperty({
    example: 'promo-rollik-brenda',
    description: 'URL-friendly slug',
  })
  @IsString()
  @MaxLength(200)
  @Matches(/^[a-z0-9-]+$/, { message: 'Только латиница, цифры и дефис' })
  readonly slug!: string

  @ApiPropertyOptional({ description: 'Описание проекта' })
  @IsString()
  @MaxLength(1000)
  readonly description!: string

  @ApiProperty({
    example: '/uploads/projects/image.jpg',
    description: 'Путь к изображению',
  })
  @IsString()
  @MaxLength(500)
  readonly src!: string

  @ApiPropertyOptional({
    example: 'https://vimeo.com/...',
    description: 'Ссылка на проект',
  })
  @IsOptional()
  @IsUrl({}, { message: 'Невалидный URL' })
  @MaxLength(500)
  readonly href?: string

  @ApiPropertyOptional({ description: 'Порядок сортировки' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  readonly order?: number

  @ApiProperty({ description: 'ID таба' })
  @IsString()
  readonly tabId!: string
}

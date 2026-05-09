import { ApiProperty } from '@nestjs/swagger'

export class UploadResultDto {
  @ApiProperty({ description: 'Публичный путь к файлу' })
  path!: string

  @ApiProperty({ description: 'Уникальное имя файла на сервере' })
  filename!: string

  @ApiProperty({ description: 'Исходное имя файла' })
  originalName!: string

  @ApiProperty({ description: 'Размер в байтах' })
  size!: number

  @ApiProperty({ description: 'MIME тип' })
  mimetype!: string
}

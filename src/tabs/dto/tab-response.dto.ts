import { ApiProperty } from '@nestjs/swagger'

export class TabResponseDto {
  @ApiProperty()
  id!: string

  @ApiProperty()
  label!: string

  @ApiProperty()
  slug!: string

  @ApiProperty()
  description!: string

  @ApiProperty()
  order!: number

  @ApiProperty()
  isActive!: boolean

  @ApiProperty()
  createdAt!: Date

  @ApiProperty()
  updatedAt!: Date
}

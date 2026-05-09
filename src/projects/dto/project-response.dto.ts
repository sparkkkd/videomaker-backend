import { ApiProperty } from '@nestjs/swagger'

export class ProjectResponseDto {
  @ApiProperty()
  id!: string

  @ApiProperty()
  label!: string

  @ApiProperty()
  slug!: string

  @ApiProperty()
  description!: string

  @ApiProperty()
  src!: string

  @ApiProperty({ required: false })
  href?: string | null

  @ApiProperty()
  order!: number

  @ApiProperty()
  createdAt!: Date

  @ApiProperty()
  updatedAt!: Date
}

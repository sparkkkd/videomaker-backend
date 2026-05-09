import { ApiProperty } from '@nestjs/swagger'

export class TabBriefDto {
  @ApiProperty()
  id!: string

  @ApiProperty()
  label!: string

  @ApiProperty()
  slug!: string
}

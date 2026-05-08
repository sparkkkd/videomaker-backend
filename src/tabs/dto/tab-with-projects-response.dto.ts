import { ApiProperty } from '@nestjs/swagger'
import { TabResponseDto } from './tab-response.dto'
import { ProjectResponseDto } from 'src/projects/dto/project-response.dto'

export class TabWithProjectsResponseDto extends TabResponseDto {
  @ApiProperty({ type: [ProjectResponseDto] })
  projects!: ProjectResponseDto[]
}

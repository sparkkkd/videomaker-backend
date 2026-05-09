import { ApiProperty } from '@nestjs/swagger'
import { ProjectResponseDto } from './project-response.dto'
import { TabBriefDto } from 'src/tabs/dto/tab-brief.dto'

export class ProjectWithTabResponseDto extends ProjectResponseDto {
  @ApiProperty({ type: TabBriefDto })
  tab!: TabBriefDto
}

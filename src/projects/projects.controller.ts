import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common'
import { ProjectsService } from './projects.service'
import { CreateProjectDto } from './dto/create-project.dto'
import { UpdateProjectDto } from './dto/update-project.dto'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'
import { ProjectResponseDto } from './dto/project-response.dto'
import { ProjectWithTabResponseDto } from './dto/project-with-tab-response.dto'

@ApiTags('Проекты')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Создать проект' })
  @ApiResponse({ status: 201, type: ProjectResponseDto })
  create(@Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.create(createProjectDto)
  }

  @Get()
  @ApiOperation({ summary: 'Получить все проекты' })
  @ApiResponse({ status: 200, type: [ProjectResponseDto] })
  findAll() {
    return this.projectsService.findAll()
  }

  @Get('tab/:tabId')
  @ApiOperation({ summary: 'Получить проекты конкретного таба' })
  @ApiResponse({ status: 200, type: [ProjectResponseDto] })
  findByTabId(@Param('tabId') tabId: string) {
    return this.projectsService.findAllByTabId(tabId)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить проект по ID' })
  @ApiResponse({ status: 200, type: ProjectWithTabResponseDto })
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id)
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Обновить проект' })
  @ApiResponse({ status: 200, type: ProjectResponseDto })
  update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectsService.update(id, updateProjectDto)
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Удалить проект' })
  @ApiResponse({ status: 200 })
  remove(@Param('id') id: string) {
    return this.projectsService.remove(id)
  }

  @Post('reorder')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Изменить порядок проектов' })
  @ApiResponse({ status: 200 })
  reorder(@Body() projectIds: string[], @Query('tabId') tabId: string) {
    return this.projectsService.reorder(projectIds, tabId)
  }
}

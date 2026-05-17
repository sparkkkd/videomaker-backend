import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common'
import { TabsService } from './tabs.service'
import { CreateTabDto } from './dto/create-tab.dto'
import { UpdateTabDto } from './dto/update-tab.dto'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'
import { TabResponseDto } from './dto/tab-response.dto'
import { TabWithProjectsResponseDto } from './dto/tab-with-projects-response.dto'

@ApiTags('Табы')
@Controller('tabs')
export class TabsController {
  constructor(private readonly tabsService: TabsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Создать таб' })
  @ApiResponse({ status: 201, type: TabResponseDto })
  create(@Body() createTabDto: CreateTabDto) {
    return this.tabsService.create(createTabDto)
  }

  @Get()
  @ApiOperation({ summary: 'Получить список табов' })
  @ApiResponse({ status: 200, type: [TabResponseDto] })
  findAll() {
    return this.tabsService.findAll()
  }

  @Get('with-projects')
  @ApiOperation({ summary: 'Получить список табов с проектами' })
  @ApiResponse({ status: 200, type: [TabWithProjectsResponseDto] })
  findAllWithProjects() {
    return this.tabsService.findAllWithProjects()
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Получить таб по slug (с проектами)' })
  @ApiResponse({ status: 200, type: TabWithProjectsResponseDto })
  findBySlug(@Param('slug') slug: string) {
    return this.tabsService.findOneBySlug(slug)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить таб по ID (с проектами)' })
  @ApiResponse({ status: 200, type: TabWithProjectsResponseDto })
  findOne(@Param('id') id: string) {
    return this.tabsService.findOneWithProjects(id)
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Обновить таб' })
  @ApiResponse({ status: 200, type: TabResponseDto })
  update(@Param('id') id: string, @Body() updateTabDto: UpdateTabDto) {
    return this.tabsService.update(id, updateTabDto)
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Удалить таб' })
  @ApiResponse({ status: 200 })
  remove(@Param('id') id: string) {
    return this.tabsService.remove(id)
  }

  @Post('reorder')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Изменить порядок табов' })
  @ApiResponse({ status: 200 })
  reorder(@Body() tabIds: string[]) {
    return this.tabsService.reorder(tabIds)
  }
}

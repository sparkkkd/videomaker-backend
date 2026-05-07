import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TabsService } from './tabs.service';
import { CreateTabDto } from './dto/create-tab.dto';
import { UpdateTabDto } from './dto/update-tab.dto';

@Controller('tabs')
export class TabsController {
  constructor(private readonly tabsService: TabsService) {}

  @Post()
  create(@Body() createTabDto: CreateTabDto) {
    return this.tabsService.create(createTabDto);
  }

  @Get()
  findAll() {
    return this.tabsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tabsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTabDto: UpdateTabDto) {
    return this.tabsService.update(+id, updateTabDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tabsService.remove(+id);
  }
}

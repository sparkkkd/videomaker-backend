import { Controller, Get, ServiceUnavailableException } from '@nestjs/common'
import { PrismaService } from 'src/database/prisma.service'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Тест здоровья API' })
  @ApiResponse({ status: 200, description: 'API работает исправно ✅' })
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    }
  }

  @Get('db')
  @ApiOperation({ summary: 'Проверка подключения к БД' })
  @ApiResponse({ status: 200, description: 'База данных работает исправно ✅' })
  @ApiResponse({ status: 503, description: 'База данных недоступна ❌' })
  async checkDb() {
    try {
      await this.prisma.$queryRaw`SELECT 1`
      return {
        status: 200,
        database: 'connected',
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      throw new ServiceUnavailableException('Ошибка подключения к БД')
    }
  }
}

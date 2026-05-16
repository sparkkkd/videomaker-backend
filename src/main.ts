import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ConfigService } from '@nestjs/config'
import { ValidationPipe } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import cookieParser from 'cookie-parser'
import { join } from 'path'
import { NestExpressApplication } from '@nestjs/platform-express'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)

  app.use(cookieParser())

  const configService = app.get(ConfigService)

  app.enableCors({
    origin: configService.get<string[]>('app.cors.origin'),
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })

  // ✅ process.cwd() всегда = корень проекта (C:\Code\videomaker-backend)
  const uploadsPath = join(process.cwd(), 'uploads')

  console.log('📁 Serving static files from:', uploadsPath)
  console.log('🔍 process.cwd():', process.cwd())

  // Вариант 1: useStaticAssets (может быть капризным)
  app.useStaticAssets(uploadsPath, { prefix: '/uploads/' })

  const apiPrefix = configService.get<string>('app.apiPrefix') || 'api'
  app.setGlobalPrefix(apiPrefix)

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )

  const config = new DocumentBuilder()
    .setTitle('Videomaker CMS')
    .setDescription('Админ панель Videomaker')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Аутентификация', 'Endpoints для входа и управления сессиями')
    .addTag('Табы', 'CRUD операции для табов')
    .addTag('Проекты', 'CRUD операции для проектов')
    .addTag('Загрузка файлов', 'Загрузка изображений')
    .addTag('Health', 'Проверка работоспособности API')
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api/docs', app, document)

  const port = configService.get<number>('app.port') || 3000

  await app.listen(port)
}

bootstrap()

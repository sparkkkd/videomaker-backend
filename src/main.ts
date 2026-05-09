import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ConfigService } from '@nestjs/config'
import { ValidationPipe } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  const configService = app.get(ConfigService)

  app.enableCors({
    origin: configService.get<string[]>('app.cors.origin'),
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })

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

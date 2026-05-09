import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import * as path from 'path'
import * as fs from 'fs'
import { v4 as uuidv4 } from 'uuid'
import { diskStorage } from 'multer'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from 'src/database/prisma.service'
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface'
import { UploadResultDto } from './dto/upload-result.dto'
import { getErrorMessage } from 'src/common/utils/error-handler'

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name)

  private readonly uploadDir!: string
  private readonly maxFileSize!: number
  private readonly allowedMimeTypes!: string[]

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.uploadDir =
      this.configService.get<string>('app.upload.dir') || './uploads'
    this.maxFileSize =
      this.configService.get<number>('app.upload.maxFileSize') ||
      5 * 1024 * 1024
    this.allowedMimeTypes = this.configService.get<string[]>(
      'app.upload.allowedMimeTypes',
    ) || ['image/jpeg', 'image/png', 'image/webp']

    this.ensureUploadDirectory()
  }

  private ensureUploadDirectory() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true })
    }
  }

  getMulterOptions(folder: string = 'projects'): MulterOptions {
    return {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const dest = path.join(this.uploadDir, folder)
          if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true })
          cb(null, dest)
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = `${Date.now()} - ${uuidv4()}`
          const ext = path.extname(file.originalname).toLowerCase()
          cb(null, `${uniqueSuffix}${ext}`)
        },
      }),
      limits: { fileSize: this.maxFileSize },
      fileFilter: (req, file, cb) => {
        if (this.allowedMimeTypes.includes(file.mimetype)) {
          cb(null, true)
        } else {
          cb(
            new BadRequestException(
              `Недопустимый тип файла. Разрешены: ${this.allowedMimeTypes.join(', ')}`,
            ),
            false,
          )
        }
      },
    }
  }

  getPublicPath(filename: string, folder: string = 'projects'): string {
    return `/uploads/${folder}/${filename}`
  }

  async saveFileRecord(
    file: Express.Multer.File,
    publicPath: string,
  ): Promise<UploadResultDto> {
    await this.prisma.fileUpload.create({
      data: {
        path: publicPath,
        filename: file.filename,
        size: file.size,
        mimeType: file.mimetype,
        linked: false,
      },
    })

    return {
      path: publicPath,
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    }
  }

  async linkFile(src: string): Promise<void> {
    if (!src.startsWith('/uploads')) return

    await this.prisma.fileUpload
      .update({
        where: { path: src },
        data: { linked: true },
      })
      .catch((err) => {
        this.logger.debug(
          `Привязка файла ${src} пропущена. Причина: ${err.message}`,
        )
      })
  }

  async unlinkFile(src: string): Promise<void> {
    if (!src.startsWith('/uploads')) return

    await this.prisma.fileUpload
      .update({
        where: { path: src },
        data: { linked: false },
      })
      .catch((err) => {
        this.logger.debug(
          `File unlink update skipped for ${src}: ${err.message}`,
        )
      })
  }

  async deleteFile(filePath: string): Promise<boolean> {
    try {
      const relativePath = filePath.replace(/^\/uploads\//, '')
      const fullPath = path.join(this.uploadDir, relativePath)

      if (fs.existsSync(fullPath)) {
        await fs.promises.unlink(fullPath)
        return true
      }
      return false
    } catch (error) {
      this.logger.error(
        `Не удалось удалить файл ${filePath}: ${getErrorMessage(error)}`,
      )
      return false
    }
  }
}

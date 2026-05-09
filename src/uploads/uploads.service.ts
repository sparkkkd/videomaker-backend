import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import * as path from 'path'
import * as fs from 'fs'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from 'src/database/prisma.service'
import { UploadResultDto } from './dto/upload-result.dto'
import { getErrorMessage } from 'src/common/utils/error-handler'

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name)
  private readonly uploadDir!: string

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.uploadDir =
      this.configService.get<string>('app.upload.dir') || './uploads'

    this.ensureUploadDirectory()
  }

  private ensureUploadDirectory() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true })
    }
  }

  getPublicPath(filename: string, folder: string = 'projects'): string {
    return `/uploads/${folder}/${filename}`
  }

  async saveFileRecord(
    file: Express.Multer.File,
    publicPath: string,
  ): Promise<UploadResultDto> {
    const filename =
      file.filename || file.originalname || path.basename(publicPath)

    if (!filename || !file.size || !file.mimetype) {
      throw new BadRequestException('Некорректные данные файла')
    }

    await this.prisma.fileUpload.create({
      data: {
        path: publicPath,
        filename,
        size: file.size,
        mimeType: file.mimetype,
        linked: false,
      },
    })

    return {
      path: publicPath,
      filename,
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

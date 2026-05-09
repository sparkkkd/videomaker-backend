import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from 'src/database/prisma.service'
import { UploadsService } from './uploads.service'
import { Cron, CronExpression } from '@nestjs/schedule'
import { getErrorMessage } from 'src/common/utils/error-handler'

@Injectable()
export class FileCleanupService {
  private readonly logger = new Logger(FileCleanupService.name)

  constructor(
    private prisma: PrismaService,
    private uploadsService: UploadsService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async cleanupOrphans() {
    this.logger.log('🧹 Старт удаления "сиротских" файлов...')

    const cutoffDate = new Date()
    cutoffDate.setHours(cutoffDate.getHours() - 24)

    const orphans = await this.prisma.fileUpload.findMany({
      where: {
        linked: false,
        createdAt: { lte: cutoffDate },
      },
      select: { id: true, path: true },
    })

    if (orphans.length === 0) {
      this.logger.log('✅ Нет "сиротских" файлов.')
      return
    }

    let deletedCount = 0
    for (const orphan of orphans) {
      try {
        const isDeleted = await this.uploadsService.deleteFile(orphan.path)

        if (isDeleted) {
          await this.prisma.fileUpload
            .delete({ where: { id: orphan.id } })
            .catch(() => {})
          deletedCount++
        }
      } catch (error) {
        this.logger.error(
          `Ошибка удаления "сиротского" файла ${orphan.path}: ${getErrorMessage(error)}`,
        )
      }
    }

    this.logger.log(
      `🗑️ Удаления "сиротских" файлов завершено. Удалено ${deletedCount} файлов.`,
    )
  }
}

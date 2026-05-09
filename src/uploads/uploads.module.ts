import { Module } from '@nestjs/common'
import { UploadsService } from './uploads.service'
import { UploadsController } from './uploads.controller'
import { ScheduleModule } from '@nestjs/schedule'
import { FileCleanupService } from './file-cleanup.service'

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [UploadsController],
  providers: [UploadsService, FileCleanupService],
  exports: [UploadsService],
})
export class UploadsModule {}

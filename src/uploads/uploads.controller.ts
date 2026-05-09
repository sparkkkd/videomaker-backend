import {
  Controller,
  Post,
  Param,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { UploadsService } from './uploads.service'
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { UploadResultDto } from './dto/upload-result.dto'
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'
import { FileInterceptor } from '@nestjs/platform-express'
import { uploadMulterOptions } from 'src/config/multer.config'
@ApiTags('Загрузка файлов')
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post(':folder')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Загрузить файл' })
  @ApiResponse({ status: 201, type: UploadResultDto })
  @UseInterceptors(FileInterceptor('file', uploadMulterOptions))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Param('folder') folder: string,
  ): Promise<UploadResultDto> {
    if (!file) throw new Error('Файл не найден')

    const filename = file.filename || file.originalname

    const publicPath = this.uploadsService.getPublicPath(filename, folder)

    const result = await this.uploadsService.saveFileRecord(file, publicPath)

    return result
  }
}

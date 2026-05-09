import { diskStorage } from 'multer'
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface'
import { BadRequestException } from '@nestjs/common'
import { v4 as uuidv4 } from 'uuid'
import type { Request } from 'express'
import * as path from 'path'
import * as fs from 'fs'

export const uploadMulterOptions: MulterOptions = {
  storage: diskStorage({
    destination: (
      req: Request,
      _file: Express.Multer.File,
      cb: (error: Error | null, destination: string) => void,
    ) => {
      const folder = (req.params['folder'] as string) || 'projects'
      const dest = path.join(process.cwd(), 'uploads', folder)

      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true })
      }

      cb(null, dest)
    },

    filename: (
      _req: Request,
      file: Express.Multer.File,
      cb: (error: Error | null, filename: string) => void,
    ) => {
      const uniqueSuffix = `${Date.now()}-${uuidv4()}`
      const ext = path.extname(file.originalname).toLowerCase()
      cb(null, `${uniqueSuffix}${ext}`)
    },
  }),

  limits: {
    fileSize: 50 * 1024 * 1024,
  },

  fileFilter: (
    _req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp']

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(
        new BadRequestException(
          `Недопустимый тип файла. Разрешены только: ${allowedMimes.join(', ')}`,
        ),
        false,
      )
    }
  },
} as const

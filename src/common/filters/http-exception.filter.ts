import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common'
import { Request, Response } from 'express'

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR

    const exceptionResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: 'Internal Server Error (Внутренняя ошибка сервера)' }

    console.error('Exception:', exception)

    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      return response.status(status).json({
        ...(exceptionResponse as Record<string, unknown>),
        timestamp: new Date().toISOString(),
        path: request.url,
      })
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: String(exceptionResponse),
    })
  }
}

import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const statusCode = exception.getStatusCode();
    const message =
      typeof exception.getResponse() === 'string'
        ? exception.getResponse()
        : (exception.getResponse() as { message?: string }).message ??
          exception.message;

    response.status(statusCode).json({ statusCode, message });
  }
}

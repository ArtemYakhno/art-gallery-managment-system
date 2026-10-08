import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '../../generated/prisma/client.js';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      const body =
        typeof exceptionResponse === 'string'
          ? { message: exceptionResponse }
          : (exceptionResponse as Record<string, unknown>);

      const responseBody: Record<string, unknown> = {
        statusCode: status,
        message:
          typeof body.message === 'string' ? body.message : 'Request failed',
      };

      if (body.errors && typeof body.errors === 'object') {
        responseBody.errors = body.errors;
      }

      // Terminus puts the per-indicator report on a 503; keep it visible.
      if (body.status && body.details) {
        responseBody.details = body.details;
      }

      response.status(status).json(responseBody);
      return;
    }

    // The Prisma code names the constraint that failed; a stack trace does not.
    const prismaCode =
      exception instanceof Prisma.PrismaClientKnownRequestError
        ? ` [prisma ${exception.code}]`
        : '';

    this.logger.error(
      `Unexpected error on ${request.method} ${request.url}${prismaCode}`,
      exception instanceof Error ? exception.stack : String(exception),
    );

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    });
  }
}

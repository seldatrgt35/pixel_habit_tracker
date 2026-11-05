import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import type { Request, Response } from 'express';

@Catch()
export class SafeErrors implements ExceptionFilter {
  catch(error: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const request = host.switchToHttp().getRequest<Request>();
    const parserStatus =
      typeof error === 'object' && error !== null && 'status' in error ? Number(error.status) : 500;
    const status =
      error instanceof HttpException
        ? error.getStatus()
        : [400, 413].includes(parserStatus)
          ? parserStatus
          : 500;
    const messages: Record<number, string> = {
      400: 'Please check your request.',
      401: 'Please sign in again.',
      403: 'That action is unavailable.',
      404: 'We could not find that resource.',
      413: 'That request is too large.',
      429: 'Take a little breath and try again shortly.',
      503: 'The garden is warming up. Try again shortly.',
    };
    const codes: Record<number, string> = {
      400: 'INVALID_REQUEST',
      401: 'UNAUTHENTICATED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      413: 'BODY_TOO_LARGE',
      429: 'RATE_LIMITED',
      503: 'NOT_READY',
    };
    response.status(status).json({
      error: {
        code: codes[status] ?? 'INTERNAL_ERROR',
        message: messages[status] ?? 'Something went wrong. Please try again.',
        requestId: request.res?.getHeader('X-Request-Id'),
      },
    });
  }
}

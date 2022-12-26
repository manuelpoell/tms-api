import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { LogService } from '../services/log.service';

@Injectable()
export class LogInterceptor implements NestInterceptor {
  constructor(private logService: LogService) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const startTime = new Date();
    return next.handle().pipe(
      tap({
        next: (result) => this.logEntry(context, startTime, result),
        error: (error) => this.logEntry(context, startTime, error),
      }),
    );
  }

  private logEntry(
    context: ExecutionContext,
    startTime: Date,
    data: any,
  ): void {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    // TODO log redaction for passwords

    this.logService.log({
      startTime: startTime.toISOString(),
      endTime: new Date().toISOString(),
      clientIp: request.ip,
      method: request.method,
      url: request.url,
      statusCode: request.res?.statusCode,
      requestHeaders: request.headers,
      requestBody: request.body,
      responseHeaders: response.getHeaders(),
      responseBody: data,
    });
  }
}

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { WinstonLogger } from 'nest-winston';

@Injectable()
export class ServiceLoggerInterceptor implements NestInterceptor {
  constructor(private readonly logger: WinstonLogger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    console.log('ServiceLoggerInterceptor is running');
    const controller = context.getClass().name;
    const method = context.getHandler().name;
    const contextName = `${controller}.${method}`;
    const start = Date.now();

    return next.handle().pipe(
      tap((data) => {
        this.logSuccess(contextName, start, data);
      }),
      catchError((error) => {
        this.logError(contextName, start, error);
        throw error;
      }),
    );
  }

  private logSuccess(context: string, start: number, data: any) {
    const duration = Date.now() - start;
    this.logger.log({
      level: 'info',
      message: 'Service method completed',
      context,
      status: 'success',
      duration,
      data: this.sanitizeData(data),
    });
  }

  private logError(context: string, start: number, error: Error) {
    const duration = Date.now() - start;
    this.logger.log({
      level: 'error',
      message: 'Service method failed',
      context,
      status: 'failed',
      duration,
      error: {
        message: error.message,
        stack: error.stack,
      },
    });
  }

  private sanitizeData(data: any): any {
    if (data?.password) {
      data.password = '***REDACTED***';
    }
    if (data?.confirmPassword) {
      data.confirmPassword = '***REDACTED***';
    }
    return data;
  }
}

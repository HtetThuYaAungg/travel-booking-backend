import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface StandardResponse<T> {
  statusCode: number;
  message: string;
  data: T | PaginatedResponse<T>;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  items: T[]; 
  total: number; 
  page: number; 
  limit: number;
}


@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, StandardResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<StandardResponse<T>> {
    const now = new Date().toISOString();
    return next.handle().pipe(
      map((data) => {
        return {
          statusCode: context.switchToHttp().getResponse().statusCode,
          message: data.message || 'Operation successfully!',
          data: data.result || data,
          timestamp: now,
        };
      }),
    );
  }
}
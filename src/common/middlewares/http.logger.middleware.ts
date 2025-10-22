import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { WinstonLogger } from 'nest-winston';

@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
  constructor(private readonly logger: WinstonLogger) {}

  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    const { method, originalUrl, ip, params, query, body } = req;

    res.on('finish', () => {
      const duration = Date.now() - start;
      const { statusCode } = res;
      const contentLength = res.get('content-length');
      const message = `${method} ${originalUrl} ${statusCode} ${contentLength || 0}b ${duration}ms`;

      this.logger.log({
        level: 'http',
        message,
        context: 'HTTP',
        method,
        url: originalUrl,
        statusCode,
        clientIp: ip,
        duration,
        params,
        query,
        requestBody: body,
        responseBody: (res as any)._body
      });
    });

    next();
  }
}
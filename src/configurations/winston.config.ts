import { WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format((info: any) => {
    if (info.requestBody?.password) {
      info.requestBody.password = '***REDACTED***';
    }
    if (info.requestBody?.confirmPassword) {
      info.requestBody.confirmPassword = '***REDACTED***';
    }
    return info;
  })(),
  winston.format.json(),
);

const httpFilter = winston.format((info) => {
  if (
    (typeof info.context === 'object' &&
      info.context !== null &&
      'context' in info.context &&
      typeof (info.context as any).context === 'string' &&
      (info.context as any).context.startsWith('HTTP')) ||
    (typeof info.context === 'string' && info.context.startsWith('HTTP'))
  ) {
    return info;
  }
  return false;
});

export const winstonConfig: WinstonModuleOptions = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
    verbose: 5,
  },
  transports: [
    new DailyRotateFile({
      filename: 'logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
      format: logFormat,
      level: 'info',
    }),
    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '60d',
      format: logFormat,
      level: 'error',
    }),
    new DailyRotateFile({
      filename: 'logs/http-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '60d',
      format: winston.format.combine(httpFilter(), logFormat),
      level: 'http',
    }),

    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(
          ({ timestamp, level, message, context, duration }) => {
            return (
              `${timestamp} [${context}] ${level}: ${message}` +
              (duration ? ` - ${duration}ms` : '')
            );
          },
        ),
      ),
    }),
  ],
};

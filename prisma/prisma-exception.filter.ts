import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

type PrismaErrorMeta = {
  target?: string[];
  cause?: string;
  [key: string]: unknown;
};

type ErrorHandlerResponse = {
  statusCode: number;
  message: string;
};

@Catch(Prisma.PrismaClientKnownRequestError, Prisma.PrismaClientValidationError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(
    exception:
      | Prisma.PrismaClientKnownRequestError
      | Prisma.PrismaClientValidationError,
    host: ArgumentsHost,
  ) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof Prisma.PrismaClientValidationError) {
      this.handleValidationError(response, exception);
    } else {
      this.handleKnownRequestError(response, exception);
    }
  }

  // Handles Prisma known request errors (e.g., unique constraint violation, foreign key violation).

  private handleKnownRequestError(
    response: Response,
    exception: Prisma.PrismaClientKnownRequestError,
  ) {
    const meta = exception.meta as PrismaErrorMeta;
    const handler = this.errorHandlers[exception.code] ?? this.defaultHandler;
    const { statusCode, message } = handler(meta);

    this.sendErrorResponse(response, statusCode, message);
  }

  // Handles Prisma validation errors (e.g., wrong data type).
  private handleValidationError(
    response: Response,
    exception: Prisma.PrismaClientValidationError,
  ) {
    const errorDetails = this.extractValidationDetails(exception.message);

    response.status(HttpStatus.BAD_REQUEST).json({
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Data validation failed',
      error: HttpStatus[HttpStatus.BAD_REQUEST],
      details: errorDetails,
    });
  }

  // Extracts a more user-friendly message from Prisma validation error messages.

  private extractValidationDetails(message: string): string {
    const typeMismatch = message.match(
      /Argument `(\w+)`: Invalid value provided\. Expected (\w+), provided (\w+)\./,
    );

    return typeMismatch
      ? `Field '${typeMismatch[1]}' requires type ${typeMismatch[2]} but received ${typeMismatch[3]}`
      : 'Invalid data format provided';
  }

  // Utility to format unique constraint violation messages.

  private formatUniqueConstraintMessage(meta: PrismaErrorMeta): string {
    return meta?.target?.length
      ? `Duplicate value for: ${meta.target.join(', ')}`
      : 'Unique constraint violation';
  }

  // Unified JSON error response.

  private sendErrorResponse(
    response: Response,
    statusCode: number,
    message: string,
  ) {
    response.status(statusCode).json({
      statusCode,
      message,
      error: HttpStatus[statusCode],
    });
  }

  // Prisma error handlers grouped by error code.

  private readonly errorHandlers: Record<
    string,
    (meta: PrismaErrorMeta) => ErrorHandlerResponse
  > = {
    // Data not found
    P2025: (meta) => ({
      statusCode: HttpStatus.NOT_FOUND,
      message:
        typeof meta?.cause === 'string' ? meta.cause : 'Record not found',
    }),

    // Constraint violations
    P2002: (meta) => ({
      statusCode: HttpStatus.CONFLICT,
      message: this.formatUniqueConstraintMessage(meta),
    }),
    P2003: () => ({
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Foreign key constraint violation',
    }),
    P2004: () => ({
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Database constraint violation',
    }),
    P2005: () => ({
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Invalid field value',
    }),
    P2006: () => ({
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Invalid value provided',
    }),
    P2011: () => ({
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Null constraint violation',
    }),
    P2012: () => ({
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Missing required field',
    }),
    P2013: () => ({
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Invalid field type',
    }),

    // Database connection issues
    P1000: () => ({
      statusCode: HttpStatus.SERVICE_UNAVAILABLE,
      message: 'Database connection failed',
    }),
    P1001: () => ({
      statusCode: HttpStatus.SERVICE_UNAVAILABLE,
      message: 'Database timeout',
    }),
    P1002: () => ({
      statusCode: HttpStatus.SERVICE_UNAVAILABLE,
      message: 'Database connection limit reached',
    }),
    P1003: () => ({
      statusCode: HttpStatus.SERVICE_UNAVAILABLE,
      message: 'Database schema does not exist',
    }),
    P1008: () => ({
      statusCode: HttpStatus.SERVICE_UNAVAILABLE,
      message: 'Database operation timeout',
    }),
    P1011: () => ({
      statusCode: HttpStatus.SERVICE_UNAVAILABLE,
      message: 'Error opening database connection',
    }),
    P1012: () => ({
      statusCode: HttpStatus.SERVICE_UNAVAILABLE,
      message: 'Database schema validation error',
    }),
  };

  // Fallback handler for unhandled Prisma error codes.

  private readonly defaultHandler = (): ErrorHandlerResponse => ({
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    message: 'Database operation failed',
  });
}

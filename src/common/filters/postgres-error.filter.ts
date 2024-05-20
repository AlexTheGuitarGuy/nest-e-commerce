import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';
import { PostgresErrorCode } from '../enums/postgres-error-code.enum';

@Catch(QueryFailedError)
export class QueryErrorFilter implements ExceptionFilter<QueryFailedError> {
  catch(
    exception: QueryFailedError & { code: PostgresErrorCode; detail: string },
    host: ArgumentsHost,
  ) {
    Logger.debug(JSON.stringify(exception, null, 2));
    Logger.error(exception.message);

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (exception.code === PostgresErrorCode.UniqueViolation) {
      const key = exception.detail.split(')=(')[0].split('(')[1];
      const value = exception.detail.split(')=(')[1].split(')')[0];

      response.status(400).json({
        error: `Unique constraint failed`,
        message: `Key '${key}' with value '${value}' already exists, try again`,
      });
    } else {
      response.status(500).json({
        statusCode: 500,
        path: request.url,
        message: `Request failed with status code: ${exception.code}`,
      });
    }
  }
}

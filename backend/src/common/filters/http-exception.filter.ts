import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError, EntityNotFoundError } from 'typeorm';
import {
  ExpedienteInmutableException,
  EnmiendaNoAutorizadaException,
} from '../../modules/consulta/domain/exceptions';

interface ErrorResponse {
  statusCode: number;
  message: string | string[];
  errors?: Record<string, string[]>;
  code?: string;
  timestamp: string;
  path: string;
  method: string;
  requestId?: string;
}

interface ErrorFrequency {
  count: number;
  firstSeen: number;
  lastSeen: number;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);
  private readonly errorFrequency = new Map<string, ErrorFrequency>();
  private readonly securityAlertThreshold = 10;
  private readonly securityAlertWindowMs = 300000;

  private readonly knownErrorCodes: Record<
    string,
    { code: string; message: string; hipaaSafe: boolean }
  > = {
    '23505': {
      code: 'ERR_DUPLICATE_ENTRY',
      message: 'Ya existe un registro con este valor único',
      hipaaSafe: true,
    },
    '23503': {
      code: 'ERR_FOREIGN_KEY',
      message: 'La referencia a otro registro no existe',
      hipaaSafe: true,
    },
    '23502': {
      code: 'ERR_NOT_NULL',
      message: 'Un campo requerido no fue proporcionado',
      hipaaSafe: true,
    },
    '22P02': {
      code: 'ERR_INVALID_INPUT',
      message: 'Valor de entrada inválido',
      hipaaSafe: true,
    },
    '42P01': {
      code: 'ERR_UNDEFINED_TABLE',
      message: 'Error de configuración de base de datos',
      hipaaSafe: true,
    },
    '40001': {
      code: 'ERR_SERIALIZATION',
      message: 'Conflicto de concurrencia, intente nuevamente',
      hipaaSafe: true,
    },
    '40P01': {
      code: 'ERR_DEADLOCK',
      message: 'Deadlock detectado, intente nuevamente',
      hipaaSafe: true,
    },
  };

  private readonly httpErrorCodes: Record<
    number,
    { code: string; hipaaSafe: boolean }
  > = {
    [HttpStatus.BAD_REQUEST]: { code: 'ERR_BAD_REQUEST', hipaaSafe: true },
    [HttpStatus.UNAUTHORIZED]: { code: 'ERR_UNAUTHORIZED', hipaaSafe: true },
    [HttpStatus.FORBIDDEN]: { code: 'ERR_FORBIDDEN', hipaaSafe: true },
    [HttpStatus.NOT_FOUND]: { code: 'ERR_NOT_FOUND', hipaaSafe: true },
    [HttpStatus.CONFLICT]: { code: 'ERR_CONFLICT', hipaaSafe: true },
    [HttpStatus.TOO_MANY_REQUESTS]: { code: 'ERR_RATE_LIMIT', hipaaSafe: true },
    [HttpStatus.UNPROCESSABLE_ENTITY]: {
      code: 'ERR_VALIDATION',
      hipaaSafe: true,
    },
    [HttpStatus.INTERNAL_SERVER_ERROR]: {
      code: 'ERR_INTERNAL',
      hipaaSafe: false,
    },
    [HttpStatus.SERVICE_UNAVAILABLE]: {
      code: 'ERR_SERVICE_UNAVAILABLE',
      hipaaSafe: true,
    },
    [HttpStatus.GATEWAY_TIMEOUT]: { code: 'ERR_TIMEOUT', hipaaSafe: true },
  };

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const isProduction = process.env.NODE_ENV === 'production';

    const errorResponse: ErrorResponse = {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Error interno del servidor',
      code: 'ERR_INTERNAL',
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      requestId: request.headers['x-request-id'] as string,
    };

    if (exception instanceof HttpException) {
      errorResponse.statusCode = exception.getStatus();
      const excResp = exception.getResponse();
      const codeInfo = this.httpErrorCodes[errorResponse.statusCode];
      errorResponse.code = codeInfo?.code || `ERR_${errorResponse.statusCode}`;

      if (typeof excResp === 'string') {
        errorResponse.message = excResp;
      } else if (typeof excResp === 'object') {
        const obj = excResp as Record<string, unknown>;
        errorResponse.message =
          (obj.message as string | string[]) || exception.message;

        const excErrors = obj.errors as Record<string, string[]> | undefined;
        if (excErrors) {
          errorResponse.errors = excErrors;
        }

        const excCode = obj.code as string | undefined;
        if (excCode) {
          errorResponse.code = excCode;
        }
      }

      if (errorResponse.statusCode === HttpStatus.INTERNAL_SERVER_ERROR) {
        this.trackErrorFrequency(errorResponse.code, request.url);
      }
    } else if (exception instanceof QueryFailedError) {
      errorResponse.statusCode = HttpStatus.BAD_REQUEST;
      const code =
        (exception as QueryFailedError & { code?: string }).code || 'UNKNOWN';
      const errorDef = this.knownErrorCodes[code];

      if (errorDef) {
        errorResponse.code = errorDef.code;
        errorResponse.message = errorDef.message;
      } else {
        errorResponse.code = `ERR_DB_${code}`;
        errorResponse.message = isProduction
          ? 'Error de base de datos'
          : exception.message;
      }

      this.logger.error(`DB Error [${code}]: ${exception.message}`);
      this.trackErrorFrequency(errorResponse.code, request.url);
    } else if (exception instanceof EntityNotFoundError) {
      errorResponse.statusCode = HttpStatus.NOT_FOUND;
      errorResponse.code = 'ERR_NOT_FOUND';
      errorResponse.message = 'Recurso no encontrado';
    } else if (exception instanceof ExpedienteInmutableException) {
      errorResponse.statusCode = HttpStatus.CONFLICT;
      errorResponse.code = 'ERR_EXPEDIENTE_INMUTABLE';
      errorResponse.message = exception.message;
    } else if (exception instanceof EnmiendaNoAutorizadaException) {
      errorResponse.statusCode = HttpStatus.FORBIDDEN;
      errorResponse.code = 'ERR_ENMIENDA_NO_AUTORIZADA';
      errorResponse.message = exception.message;
    } else if (exception instanceof SyntaxError) {
      errorResponse.statusCode = HttpStatus.BAD_REQUEST;
      errorResponse.code = 'ERR_SYNTAX';
      errorResponse.message = 'Formato de solicitud inválido';
      this.logger.warn(`SyntaxError: ${exception.message}`);
    } else if (exception instanceof Error) {
      errorResponse.message = isProduction
        ? 'Error interno del servidor'
        : exception.message;
      this.logger.error(`Unhandled: ${exception.message}`, exception.stack);
      this.trackErrorFrequency('ERR_UNHANDLED', request.url);
    }

    const logLevel =
      errorResponse.statusCode >= 500
        ? 'error'
        : errorResponse.statusCode >= 400
          ? 'warn'
          : 'log';

    this.logger[logLevel](
      `[${errorResponse.statusCode}] ${request.method} ${request.url} | code: ${errorResponse.code} | ip: ${request.ip}`,
    );

    response.status(errorResponse.statusCode).json(errorResponse);
  }

  private trackErrorFrequency(code: string, url: string): void {
    const key = `${code}:${url}`;
    const now = Date.now();
    const existing = this.errorFrequency.get(key);

    if (existing) {
      existing.count++;
      existing.lastSeen = now;
      this.errorFrequency.set(key, existing);

      if (
        existing.count >= this.securityAlertThreshold &&
        now - existing.firstSeen < this.securityAlertWindowMs
      ) {
        this.logger.error(
          `[SECURITY] Error frequency alert: ${key} occurred ${existing.count} times in ${this.securityAlertWindowMs / 1000}s`,
        );
      }
    } else {
      this.errorFrequency.set(key, { count: 1, firstSeen: now, lastSeen: now });
    }

    if (this.errorFrequency.size > 1000) {
      const cutoff = now - 3600000;
      for (const [k, v] of this.errorFrequency.entries()) {
        if (v.lastSeen < cutoff) this.errorFrequency.delete(k);
      }
    }
  }

  getErrorFrequency(): Record<string, ErrorFrequency> {
    const result: Record<string, ErrorFrequency> = {};
    for (const [key, value] of this.errorFrequency.entries()) {
      result[key] = { ...value };
    }
    return result;
  }
}

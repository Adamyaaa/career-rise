import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Response } from "express";
import { ApiErrorCode } from "@career-rise/shared";

const STATUS_TO_CODE: Partial<Record<number, ApiErrorCode>> = {
  [HttpStatus.BAD_REQUEST]: "VALIDATION_ERROR",
  [HttpStatus.UNAUTHORIZED]: "UNAUTHORIZED",
  [HttpStatus.FORBIDDEN]: "FORBIDDEN",
  [HttpStatus.NOT_FOUND]: "NOT_FOUND",
  [HttpStatus.CONFLICT]: "CONFLICT",
};

// Catches every thrown value (Nest HttpExceptions and unexpected errors alike) and
// normalizes them to the uniform { error: { code, message, details } } shape defined
// in the Phase 3 API contract.
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const body = exception instanceof HttpException ? exception.getResponse() : undefined;

    let code: ApiErrorCode = STATUS_TO_CODE[status] ?? "INTERNAL_ERROR";
    let message = "Unexpected error";
    let details: unknown;

    if (typeof body === "string") {
      message = body;
    } else if (body && typeof body === "object") {
      const b = body as Record<string, unknown>;
      if (typeof b.code === "string") {
        code = b.code as ApiErrorCode;
      }
      if (typeof b.message === "string") {
        message = b.message;
      } else if (Array.isArray(b.message)) {
        message = b.message.join(", ");
        details = b.details ?? b.message;
      }
      details = details ?? b.details;
    }

    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        exception instanceof Error ? exception.stack : String(exception),
      );
      message = "Internal server error";
      details = undefined;
      code = "INTERNAL_ERROR";
    }

    response.status(status).json({ error: { code, message, details } });
  }
}

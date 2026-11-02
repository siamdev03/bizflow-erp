
import fs from 'node:fs/promises';
import path from 'node:path';

import type {
  ErrorRequestHandler
} from 'express';

// ==========================================
// ERROR LOG CONFIGURATION
// ==========================================

type ErrorLogEntry = {
  timestamp: string;
  level: 'error';
  message: string;
  statusCode: number;
  method: string;
  path: string;
  userId?: string;
  userRole?: string;
  requestId?: string;
  stack?: string;
};

const LOG_DIRECTORY = path.resolve(process.cwd(), 'logs');
const ERROR_LOG_FILE = path.join(LOG_DIRECTORY, 'error.log');

let writeQueue: Promise<void> = Promise.resolve();

// ==========================================
// WRITE ERROR LOG
// ==========================================

export async function logError(
  entry: ErrorLogEntry
): Promise<void> {
  const line = `${JSON.stringify(entry)}\n`;

  writeQueue = writeQueue
    .then(async () => {
      await fs.mkdir(LOG_DIRECTORY, {
        recursive: true
      });

      await fs.appendFile(
        ERROR_LOG_FILE,
        line,
        { encoding: 'utf8' }
      );
    })
    .catch((writeError: unknown) => {
      console.error(
        '[BizFlow Error Logger] Could not write log:',
        writeError
      );
    });

  await writeQueue;
}

// ==========================================
// GET ERROR STATUS CODE
// ==========================================

function getStatusCode(error: any): number {
  if (error?.name === 'ZodError') return 400;
  if (error?.name === 'ValidationError') return 400;
  if (error?.name === 'CastError') return 400;
  if (error?.code === 11000) return 409;

  const status = Number(
    error?.statusCode || error?.status || 500
  );

  return status >= 400 && status <= 599
    ? status
    : 500;
}

// ==========================================
// ERROR RESPONSE MESSAGE
// ==========================================

function getPublicMessage(
  error: any,
  statusCode: number
): string {
  if (error?.name === 'ZodError') {
    return 'Validation failed';
  }

  if (
    error?.name === 'ValidationError' ||
    error?.name === 'CastError'
  ) {
    return error.message || 'Invalid data';
  }

  if (error?.code === 11000) {
    return 'A record with this unique value already exists';
  }

  if (
    statusCode >= 500 &&
    process.env.NODE_ENV === 'production'
  ) {
    return 'An unexpected server error occurred.';
  }

  return error?.message || 'Internal server error';
}

// ==========================================
// CENTRAL ERROR HANDLER
// ==========================================

export const errorLogger: ErrorRequestHandler = (
  error: any,
  req,
  res,
  _next
) => {
  const statusCode = getStatusCode(error);

  const user = (req as any).user;

  const entry: ErrorLogEntry = {
    timestamp: new Date().toISOString(),
    level: 'error',
    message: error?.message || 'Unknown server error',
    statusCode,
    method: req.method,

    // Do not log query strings or request bodies.
    path: req.path,

    userId: user?.id
      ? String(user.id)
      : undefined,

    userRole: user?.role
      ? String(user.role)
      : undefined,

    requestId:
      req.get('x-request-id') || undefined,

    stack: error?.stack
  };

  // Save error without blocking the HTTP response.
  void logError(entry);

  if (res.headersSent) {
    return;
  }

  res.status(statusCode).json({
    message: getPublicMessage(
      error,
      statusCode
    )
  });
};

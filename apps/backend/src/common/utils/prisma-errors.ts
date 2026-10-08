import { HttpException, NotFoundException } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';

const PRISMA_ERROR_STATUS = {
  P2025: NotFoundException, // the targeted record does not exist
} as const;

type PrismaErrorCode = keyof typeof PRISMA_ERROR_STATUS;

function isHandledCode(code: string): code is PrismaErrorCode {
  return Object.hasOwn(PRISMA_ERROR_STATUS, code);
}

/**
 * Translates the listed Prisma codes into HTTP exceptions, rethrows anything else.
 *
 * Catching after the fact rather than checking first is deliberate: the statement
 * is atomic, so there is no check-then-write window for another request to slip in.
 */
export function rethrowPrismaError(
  error: unknown,
  messages: Partial<Record<PrismaErrorCode, string>>,
): never {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    isHandledCode(error.code)
  ) {
    const message = messages[error.code];

    if (message !== undefined) {
      const Exception: new (message: string) => HttpException =
        PRISMA_ERROR_STATUS[error.code];

      throw new Exception(message);
    }
  }

  throw error;
}

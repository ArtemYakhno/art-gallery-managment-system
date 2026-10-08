import { NotFoundException } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { rethrowPrismaError } from './prisma-errors.js';

describe('rethrowPrismaError', () => {
  function prismaError(code: string): Prisma.PrismaClientKnownRequestError {
    return new Prisma.PrismaClientKnownRequestError('Request failed', {
      code,
      clientVersion: 'test',
    });
  }

  it('maps a missing record to Not Found with the given message', () => {
    expect(() =>
      rethrowPrismaError(prismaError('P2025'), { P2025: 'Artwork not found' }),
    ).toThrow(new NotFoundException('Artwork not found'));
  });

  it('rethrows a handled code when the call site gave no message for it', () => {
    expect(() => rethrowPrismaError(prismaError('P2025'), {})).toThrow(
      Prisma.PrismaClientKnownRequestError,
    );
  });

  it('rethrows an unhandled Prisma code untouched', () => {
    expect(() =>
      rethrowPrismaError(prismaError('P2002'), { P2025: 'Artwork not found' }),
    ).toThrow(Prisma.PrismaClientKnownRequestError);
  });

  it('does not treat inherited object keys as handled codes', () => {
    expect(() =>
      rethrowPrismaError(prismaError('toString'), {
        P2025: 'Artwork not found',
      }),
    ).toThrow(Prisma.PrismaClientKnownRequestError);
  });

  it('rethrows a non-Prisma error untouched', () => {
    expect(() =>
      rethrowPrismaError(new Error('connection lost'), {
        P2025: 'Artwork not found',
      }),
    ).toThrow('connection lost');
  });
});

import { BadRequestException, ValidationPipeOptions } from '@nestjs/common';
import { ValidationError } from 'class-validator';

export const validationConfig: ValidationPipeOptions = {
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
  exceptionFactory: (errors: ValidationError[]) => {
    const fieldErrors = errors.reduce(
      (acc, error) => {
        acc[error.property] = Object.values(error.constraints ?? {});
        return acc;
      },
      {} as Record<string, string[]>,
    );

    return new BadRequestException({
      message: 'Validation failed',
      errors: fieldErrors,
    });
  },
};

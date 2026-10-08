import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { getCorsConfig } from '../configs/cors.config.js';
import { validationConfig } from '../configs/validation.config.js';
import { HttpExceptionFilter } from '../filters/http-exception.filter.js';
import { setupSwagger } from './swagger.setup.js';

export function setupApp(app: NestExpressApplication): void {
  const configService = app.get(ConfigService);

  app.enableCors(getCorsConfig(configService));
  app.use(helmet());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(new ValidationPipe(validationConfig));
  setupSwagger(app);
}

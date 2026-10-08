import { ConfigService } from '@nestjs/config';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface.js';

export function getCorsConfig(configService: ConfigService): CorsOptions {
  return {
    origin: configService.get<string>('FRONTEND_URL', 'http://localhost:5173'),
  };
}

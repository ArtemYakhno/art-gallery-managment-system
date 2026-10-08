import { Test, TestingModule } from '@nestjs/testing';
import { HealthCheckService } from '@nestjs/terminus';
import { HealthController } from './health.controller.js';
import { PrismaHealthIndicator } from './prisma.health-indicator.js';

describe('HealthController', () => {
  let controller: HealthController;
  let healthCheckService: { check: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    healthCheckService = { check: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        { provide: HealthCheckService, useValue: healthCheckService },
        { provide: PrismaHealthIndicator, useValue: { isHealthy: vi.fn() } },
      ],
    }).compile();

    controller = module.get(HealthController);
  });

  it('delegates to HealthCheckService.check with the Prisma indicator', async () => {
    const result = { status: 'ok', info: {}, error: {}, details: {} };
    healthCheckService.check.mockResolvedValue(result);

    await expect(controller.check()).resolves.toEqual(result);
    expect(healthCheckService.check).toHaveBeenCalledWith([
      expect.any(Function),
    ]);
  });
});

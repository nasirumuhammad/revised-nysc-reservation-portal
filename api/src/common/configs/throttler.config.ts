import { ConfigService } from '@nestjs/config';
import { ThrottlerAsyncOptions } from '@nestjs/throttler';

export const throttlerConfig: ThrottlerAsyncOptions = {
  inject: [ConfigService],
  useFactory(configService: ConfigService) {
    const ttl = configService.getOrThrow('RATE_LIMITER_TTL');
    return { throttlers: [{ ttl, limit: 10 }] };
  },
};

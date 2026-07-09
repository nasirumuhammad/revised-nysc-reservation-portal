import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, LessThan, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { HashingService } from '@/common/services/hash.service';
import { RefreshToken } from './entity/refresh-token.entity';
import { User } from '@/user/entity/user.entity';
import ms, { StringValue } from 'ms';

@Injectable()
export class RefreshTokenService {
  private logger = new Logger(RefreshTokenService.name);
  constructor(
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    private readonly configService: ConfigService,
    private readonly hashingService: HashingService,
  ) {}

  private parseExpiry(expiry: string): Date {
    const match = expiry.match(/^(\d+)([smhdw])$/);
    if (!match) throw new BadRequestException('Invalid expiry format');
    const [, value, unit] = match;
    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60_000,
      h: 3_600_000,
      d: 86_400_000,
      w: 604_800_000,
    };
    return new Date(Date.now() + Number(value) * multipliers[unit]);
  }

  private async buildRefreshTokenEntity(payload: {
    userId: string;
    token: string;
    jti: string;
  }): Promise<Partial<RefreshToken>> {
    const expiresIn =
      this.configService.getOrThrow<string>('JWT_REFRESH_EXPIRY');
    return {
      user: { id: payload.userId } as User,
      hashedToken: await this.hashingService.hash(payload.token),
      expiredAt: this.parseExpiry(expiresIn),
      jti: payload.jti,
    };
  }

  async create(payload: {
    userId: string;
    token: string;
    jti: string;
  }): Promise<void> {
    await this.refreshTokenRepository.save(
      await this.buildRefreshTokenEntity(payload),
    );
  }

  async createWithManager(payload: {
    manager: EntityManager;
    userId: string;
    token: string;
    jti: string;
  }): Promise<void> {
    const entity = await this.buildRefreshTokenEntity(payload);
    await payload.manager.save(payload.manager.create(RefreshToken, entity));
  }

  async findByJti(jti: string): Promise<RefreshToken | null> {
    return this.refreshTokenRepository.findOne({
      where: { jti },
    });
  }

  async deleteAllUserTokens(userId: string): Promise<void> {
    await this.refreshTokenRepository.delete({ user: { id: userId } });
  }

  async deleteByJti(jti: string) {
    await this.refreshTokenRepository.delete({ jti });
  }

  async deleteByIdWithManager(
    manager: EntityManager,
    id: string,
  ): Promise<void> {
    await manager.delete(RefreshToken, { id });
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async deleteExpiredTokens(): Promise<void> {
    this.logger.log('Running expired refresh token cleanup');
    try {
      const result = await this.refreshTokenRepository.delete({
        expiredAt: LessThan(new Date()),
      });
      this.logger.log(`Deleted ${result.affected ?? 0} expired refresh tokens`);
    } catch (error) {
      this.logger.error({ error }, 'Failed to delete expired refresh tokens');
    }
  }
}

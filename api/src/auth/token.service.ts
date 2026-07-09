import { HashingService } from '@/common/services/hash.service';
import { maskEmail } from '@/common/utils/mask.util';
import { Payload } from '@/types/payload.type';
import { User } from '@/user/entity/user.entity';
import { UserService } from '@/user/user.service';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import { StringValue } from 'ms';

@Injectable()
export class TokenService {
  private readonly AUTH_FAILED_MESSAGE =
    'Authentication failed. Please sign in again.';

  private readonly resetExpiry: StringValue;
  private readonly jwtRefreshSecret: string;
  private readonly jwtRefreshExpiry: StringValue;
  private readonly resetSecret: string;
  private logger = new Logger(TokenService.name);
  constructor(
    private readonly hashingService: HashingService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {
    this.resetSecret =
      this.configService.getOrThrow<string>('JWT_RESET_SECRET');
    this.resetExpiry =
      this.configService.getOrThrow<StringValue>('JWT_RESET_EXPIRY');
    this.jwtRefreshSecret =
      this.configService.getOrThrow<string>('JWT_REFRESH_SECRET');
    this.jwtRefreshExpiry =
      this.configService.getOrThrow<StringValue>('JWT_REFRESH_EXPIRY');
  }

  generateAccessToken(payload: Payload): string {
    return this.jwtService.sign({ ...payload });
  }

  generateRefreshToken(payload: Payload): string {
    return this.jwtService.sign(
      { ...payload },
      {
        secret: this.jwtRefreshSecret,
        expiresIn: this.jwtRefreshExpiry,
      },
    );
  }

  buildPayload(user: User): Payload {
    return {
      jti: randomUUID(),
      sub: user.id,
      tokenVersion: user.tokenVersion,
    };
  }

  generateTokenPair(user: User) {
    const payload = this.buildPayload(user);
    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);
    return {
      accessToken,
      refreshToken,
      payload,
    };
  }

  generateResetToken(user: User): string {
    const payload = {
      sub: user.id,
      email: user.email,
    };
    return this.jwtService.sign(payload, {
      secret: this.resetSecret,
      expiresIn: this.resetExpiry,
    });
  }

  async validateCredentials(email: string, password: string): Promise<User> {
    const user = await this.userService.findByEmail(email);
    const isValidPassword = user
      ? await this.hashingService.compare(password, user.password)
      : false;

    if (!user || !isValidPassword) {
      this.logger.warn(
        { email: maskEmail(email) },
        'signin failed invalid credentials',
      );
      throw new UnauthorizedException(this.AUTH_FAILED_MESSAGE);
    }

    return user;
  }
}

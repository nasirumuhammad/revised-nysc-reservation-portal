import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Payload } from '@/types/payload.type';
import { UserService } from '@/user/user.service';
import { User } from '@/user/entity/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  private logger = new Logger(JwtStrategy.name);
  constructor(
    configService: ConfigService,
    private readonly userService: UserService,
  ) {
    const secret = configService.getOrThrow('JWT_SECRET');
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: Payload): Promise<User> {
    const user = await this.userService.findById(payload.sub);
    if (!user) {
      this.logger.warn({ userId: payload.sub }, 'validate user:user not found');
      throw new UnauthorizedException();
    }
    return user;
  }
}

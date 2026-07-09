import { CommonModule } from '@/common/common.module';
import { UserModule } from '@/user/user.module';
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RefreshTokenModule } from '@/refresh-token/refresh-token.module';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { OtpController } from './controllers/otp.controller';
import { PasswordResetController } from './controllers/password-reset.controller';
import { OtpModule } from '@/otp/otp.module';
import { TokenService } from './token.service';
import { AuthController } from './controllers/auth.controller';

@Module({
  imports: [
    PassportModule,
    UserModule,
    CommonModule,
    RefreshTokenModule,
    OtpModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory(configService: ConfigService) {
        const secret = configService.getOrThrow('JWT_SECRET');
        const expiresIn = configService.getOrThrow('JWT_EXPIRY');
        return {
          secret,
          signOptions: {
            expiresIn,
          },
        };
      },
    }),
  ],
  providers: [AuthService, JwtRefreshStrategy, JwtStrategy, TokenService],
  controllers: [OtpController, PasswordResetController, AuthController],
})
export class AuthModule {}

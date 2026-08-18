import { OtpService, Purpose } from '@/otp/otp.service';
import { RefreshToken } from '@/refresh-token/entity/refresh-token.entity';
import { RefreshTokenService } from '@/refresh-token/refresh-token.service';
import { Payload, ResetPasswordPayload } from '@/types/payload.type';
import { User } from '@/user/entity/user.entity';
import { UserService } from '@/user/user.service';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { JwtService } from '@nestjs/jwt';
import { SignInDto } from './dto/signin.dto';
import { maskEmail } from '@/common/utils/mask.util';
import { DataSource, Repository } from 'typeorm';
import { ResetPasswordDto } from './dto/reset-password.dto';
import {
  ForgotPasswordOtpEventPayload,
  ResendOtpEventPayload,
  SystemEvents,
  UserLoginEventPayload,
} from '@/common/constants/system-events.constant';
import { TokenService } from './token.service';
import { HashingService } from '@/common/services/hash.service';
import { StudentSignInDto } from './dto/student-signin.dto';
import { StudentProfile } from '@/student/entity/student-profile.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AuthService {
  private readonly AUTH_FAILED_MESSAGE =
    'Authentication failed. Please sign in again.';

  private readonly logger = new Logger(AuthService.name);

  private readonly resetSecret: string;

  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly otpService: OtpService,
    private readonly eventEmitter: EventEmitter2,
    private readonly datasource: DataSource,
    private readonly tokenService: TokenService,
    private readonly hashingService: HashingService,
    @InjectRepository(StudentProfile)
    private readonly studentProfileRepository: Repository<StudentProfile>,
  ) {
    this.resetSecret =
      this.configService.getOrThrow<string>('JWT_RESET_SECRET');
  }

  async signin(payload: SignInDto): Promise<string> {
    const { email, password } = payload;
    const user = await this.tokenService.validateCredentials(email, password);

    this.eventEmitter.emit(
      SystemEvents.USER_LOGIN,
      new UserLoginEventPayload(user),
    );
    this.logger.log(
      { email: maskEmail(email) },
      `${SystemEvents.USER_LOGIN} event emitted`,
    );
    return 'signin code sent to your email address';
  }

  async signinStudent(
    payload: StudentSignInDto,
  ): Promise<{ refreshToken: string; accessToken: string }> {
    const { registrationNumber, password } = payload;

    const studentProfile = await this.studentProfileRepository.findOne({
      where: { registrationNumber },
      relations: { profile: { user: true } },
    });

    const user = studentProfile?.profile?.user;

    if (
      !user ||
      !(await this.hashingService.compare(password, user.password))
    ) {
      this.logger.warn(
        { registrationNumber },
        'student signin failed: invalid credentials',
      );
      throw new UnauthorizedException(this.AUTH_FAILED_MESSAGE);
    }

    const tokens = await this.issueTokenPair(user);
    this.logger.log(
      { userId: user.id },
      'student signin succeeded tokens issued',
    );
    return tokens;
  }

  async resendOtp(email: string, purpose: Purpose): Promise<string> {
    const RESPONSE = 'OTP sent to your email address';
    const user = await this.userService.findByEmail(email);
    if (!user) {
      this.logger.warn(
        { email: maskEmail(email) },
        'resend otp requested for unregistered email',
      );
      return RESPONSE;
    }

    this.eventEmitter.emit(
      SystemEvents.RESEND_OTP,
      new ResendOtpEventPayload(email, purpose),
    );
    this.logger.log(
      { email: maskEmail(email) },
      `${SystemEvents.RESEND_OTP} event emitted`,
    );
    return RESPONSE;
  }

  async verifyResetOtp(payload: {
    email: string;
    otp: string;
  }): Promise<{ resetToken: string }> {
    const { email, otp } = payload;
    await this.otpService.verifyAndDelete({
      email,
      otp,
      purpose: 'forgot-password',
    });

    const user = await this.userService.findByEmail(email);
    if (!user) {
      this.logger.warn(
        { email: maskEmail(email) },
        'verify reset otp: user not found',
      );
      throw new NotFoundException();
    }

    const resetToken = this.tokenService.generateResetToken(user);
    this.logger.log(
      { email: maskEmail(email) },
      'reset otp verified reset token issued',
    );
    return { resetToken };
  }

  async verifyLoginOtp(payload: {
    email: string;
    otp: string;
  }): Promise<{ accessToken: string; refreshToken: string }> {
    await this.otpService.verifyAndDelete({ ...payload, purpose: 'login' });
    const user = await this.userService.findByEmail(payload.email);
    if (!user) {
      this.logger.warn(
        { email: maskEmail(payload.email) },
        'verify otp: user not found after otp verification',
      );
      throw new UnauthorizedException(this.AUTH_FAILED_MESSAGE);
    }

    const tokens = await this.issueTokenPair(user);
    this.logger.log(
      { email: maskEmail(payload.email) },
      'otp verified signin succeeded tokens issued',
    );
    return tokens;
  }

  async refresh(
    payload: Payload & { refreshToken: string },
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.userService.findById(payload.sub);
    if (!user) {
      this.logger.warn(
        { userId: payload.sub },
        'user not found during token refresh',
      );
      throw new UnauthorizedException(this.AUTH_FAILED_MESSAGE);
    }

    if (user.tokenVersion !== payload.tokenVersion) {
      this.logger.warn(
        { userId: payload.sub },
        'token version mismatch token revoked',
      );
      throw new UnauthorizedException(this.AUTH_FAILED_MESSAGE);
    }

    const tokenToRotate: RefreshToken | null =
      await this.refreshTokenService.findByJti(payload.jti);

    if (!tokenToRotate) {
      await this.refreshTokenService.deleteAllUserTokens(payload.sub);
      this.logger.warn(
        { userId: payload.sub },
        'token replay detected all sessions invalidated',
      );
      throw new UnauthorizedException(this.AUTH_FAILED_MESSAGE);
    }

    const rotatedTokenId = tokenToRotate.id;

    const newTokens = await this.datasource.transaction(async (manager) => {
      await this.refreshTokenService.deleteByIdWithManager(
        manager,
        rotatedTokenId,
      );
      const { payload: tokenPayload, ...tokens } =
        this.tokenService.generateTokenPair(user);
      await this.refreshTokenService.createWithManager({
        manager,
        userId: user.id,
        token: tokens.refreshToken,
        jti: tokenPayload.jti,
      });
      return tokens;
    });

    this.logger.log(
      { email: maskEmail(user.email) },
      'refresh token rotated successfully',
    );

    return newTokens;
  }

  async forgotPassword(email: string): Promise<string> {
    const RESPONSE = 'If the email exists, a password reset OTP will be sent';

    const user = await this.userService.findByEmail(email);
    if (!user) {
      this.logger.warn(
        { email: maskEmail(email) },
        'password reset requested for unregistered email',
      );
      return RESPONSE;
    }

    this.eventEmitter.emit(
      SystemEvents.SEND_FORGOT_PASSWORD_OTP,
      new ForgotPasswordOtpEventPayload(email),
    );
    this.logger.log(
      { email: maskEmail(email) },
      `${SystemEvents.SEND_FORGOT_PASSWORD_OTP} event emitted`,
    );
    return RESPONSE;
  }

  async resetPassword(payload: ResetPasswordDto): Promise<string> {
    const { sub, email } = this.verifyResetToken(payload.token);

    await this.userService.resetPassword(email, payload.password);
    this.logger.log({ userId: sub }, 'Password reset successfully');
    return 'Password reset successfully. Please sign in with your new password.';
  }

  private verifyResetToken(token: string): ResetPasswordPayload {
    try {
      return this.jwtService.verify<ResetPasswordPayload>(token, {
        secret: this.resetSecret,
      });
    } catch (error: any) {
      this.logger.warn(
        { err: error.message },
        'Reset token verification failed: invalid or expired token',
      );
      throw new BadRequestException('Reset token is invalid or expired');
    }
  }

  private async issueTokenPair(
    user: User,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const {
      payload: { sub, jti },
      ...tokens
    } = this.tokenService.generateTokenPair(user);
    await this.refreshTokenService.create({
      userId: sub,
      token: tokens.refreshToken,
      jti,
    });
    return tokens;
  }

  async signout(userId: string): Promise<{ message: string }> {
    await this.refreshTokenService.deleteAllUserTokens(userId);
    this.logger.log({ userId }, 'user signed out all sessions revoked');
    return {
      message: 'Account logged out successfully',
    };
  }
}

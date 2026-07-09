import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResendOtpDto } from '../dto/resend-otp.dto';
import { VerifyOtpDto } from '../dto/verify-otp.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';

@Controller('auth/reset-password')
export class PasswordResetController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('request')
  forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<string> {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @HttpCode(HttpStatus.OK)
  @Post('resend-otp')
  resendForgotPasswordOtp(@Body() payload: ResendOtpDto): Promise<string> {
    return this.authService.resendOtp(payload.email, 'forgot-password');
  }

  @HttpCode(HttpStatus.OK)
  @Post('verify-otp')
  verifyResetOtp(
    @Body() payload: VerifyOtpDto,
  ): Promise<{ resetToken: string }> {
    return this.authService.verifyResetOtp(payload);
  }

  @HttpCode(HttpStatus.OK)
  @Post()
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<string> {
    return this.authService.resetPassword(resetPasswordDto);
  }
}

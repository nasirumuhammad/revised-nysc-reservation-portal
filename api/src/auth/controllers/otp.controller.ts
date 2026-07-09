import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { VerifyOtpDto } from '../dto/verify-otp.dto';
import { SignInResponse } from '../types/response.type';
import { ResendOtpDto } from '../dto/resend-otp.dto';

@Controller('auth/otp')
export class OtpController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('verify-signin')
  verifyOtp(@Body() payload: VerifyOtpDto): Promise<SignInResponse> {
    return this.authService.verifyLoginOtp(payload);
  }

  @HttpCode(HttpStatus.OK)
  @Post('resend-login')
  resendLoginOtp(@Body() payload: ResendOtpDto): Promise<string> {
    return this.authService.resendOtp(payload.email, 'login');
  }
}

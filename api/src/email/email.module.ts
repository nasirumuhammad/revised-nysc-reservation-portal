import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { BullModule } from '@nestjs/bullmq';
import { EmailJobProcessor } from './email.processor';
import { OtpModule } from '@/otp/otp.module';
import { LoginRequestListener } from './listeners/login-request.listener';
import { ForgotPasswordRequestListener } from './listeners/forgot-password-request.listener';
import { ResendOtpListener } from './listeners/resend-otp.listener';
import { RESEND_CLIENT, SystemQueues } from './common/email.constant';

@Module({
  imports: [BullModule.registerQueue({ name: SystemQueues.EMAIL }), OtpModule],
  providers: [
    EmailService,
    {
      provide: RESEND_CLIENT,
      inject: [ConfigService],
      useFactory(configService: ConfigService) {
        const apiKey = configService.getOrThrow('RESEND_API_KEY');
        return new Resend(apiKey);
      },
    },
    EmailJobProcessor,
    LoginRequestListener,
    ForgotPasswordRequestListener,
    ResendOtpListener,
  ],
  exports: [EmailService],
})
export class EmailModule {}

import { maskEmail } from '@/common/utils/mask.util';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateEmailOptions, Resend } from 'resend';
import {
  EmailSubject,
  EmailSubjects,
  RESEND_CLIENT,
  ResendOtpJobPayload,
  SystemJobsBasePayload,
} from './common/email.constant';

export type SendEmail = Omit<CreateEmailOptions, 'from'>;

export type OtpEmailPayload = {
  email: string;
  otp: string;
};

@Injectable()
export class EmailService {
  private readonly serverEmail: string;
  private readonly logger = new Logger(EmailService.name);

  constructor(
    @Inject(RESEND_CLIENT) private readonly resend: Resend,
    private readonly configService: ConfigService,
  ) {
    this.serverEmail = this.configService.getOrThrow<string>('RESEND_EMAIL');
  }

  async sendLoginOtp(payload: SystemJobsBasePayload): Promise<void> {
    await this.sendOtpEmail(payload, EmailSubjects.LOGIN);
  }

  async sendForgotPasswordOtp(payload: SystemJobsBasePayload): Promise<void> {
    await this.sendOtpEmail(payload, EmailSubjects.FORGOT_PASSWORD);
  }

  async sendResendOtp(payload: ResendOtpJobPayload): Promise<void> {
    const subject =
      payload.purpose === 'forgot-password'
        ? EmailSubjects.FORGOT_PASSWORD
        : EmailSubjects.RESEND_OTP;
    await this.sendOtpEmail(payload, subject);
  }

  private async sendOtpEmail(
    payload: OtpEmailPayload,
    subject: EmailSubject,
  ): Promise<void> {
    const { email, otp } = payload;
    await this.send({
      to: email,
      subject,
      html: this.buildOtpHtml(otp),
    });
  }

  private buildOtpHtml(otp: string): string {
    return `<p>Your code is: <strong>${otp}</strong></p>`;
  }

  private async send(payload: SendEmail): Promise<void> {
    const resendPayload = {
      ...payload,
      from: this.serverEmail,
    } as CreateEmailOptions;

    const { error } = await this.resend.emails.send(resendPayload);

    if (error) {
      this.logger.error(
        {
          email: maskEmail(payload.to as string),
          subject: payload.subject,
          err: error,
        },
        'Failed to send email via Resend',
      );
      throw new InternalServerErrorException('Failed to send email');
    }
  }
}

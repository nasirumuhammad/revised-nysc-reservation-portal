import { maskEmail } from '@/common/utils/mask.util';
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Queue } from 'bullmq';
import {
  EmailJobPayload,
  SystemJobs,
  SystemQueues,
} from '../common/email.constant';
import { OtpService } from '@/otp/otp.service';
import {
  ForgotPasswordOtpEventPayload,
  SystemEvents,
} from '@/common/constants/system-events.constant';
import { BaseOtpQueueListener } from './base-otp-queue.listener';

@Injectable()
export class ForgotPasswordRequestListener extends BaseOtpQueueListener<EmailJobPayload> {
  constructor(
    @InjectQueue(SystemQueues.EMAIL)
    queue: Queue<EmailJobPayload>,
    private readonly otpService: OtpService,
  ) {
    super(queue, new Logger(ForgotPasswordRequestListener.name));
  }

  @OnEvent(SystemEvents.SEND_FORGOT_PASSWORD_OTP)
  async handle(event: ForgotPasswordOtpEventPayload): Promise<void> {
    const { email } = event;
    try {
      const otp = await this.otpService.generateAndStore(
        email,
        'forgot-password',
      );
      await this.enqueueOtpJob(SystemJobs.SEND_FORGOT_PASSWORD_OTP, {
        email,
        otp,
      });
    } catch (error) {
      this.logger.error(
        { email: maskEmail(email), err: error },
        'Failed to process forgot password OTP request',
      );
    }
  }
}

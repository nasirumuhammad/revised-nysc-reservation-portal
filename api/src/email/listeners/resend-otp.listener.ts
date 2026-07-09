import { maskEmail } from '@/common/utils/mask.util';
import { InjectQueue } from '@nestjs/bullmq';
import { OnEvent } from '@nestjs/event-emitter';
import { Queue } from 'bullmq';
import {
  EmailJobPayload,
  SystemJobs,
  SystemQueues,
} from '../common/email.constant';
import { OtpService } from '@/otp/otp.service';
import { Injectable, Logger } from '@nestjs/common';
import {
  ResendOtpEventPayload,
  SystemEvents,
} from '@/common/constants/system-events.constant';
import { BaseOtpQueueListener } from './base-otp-queue.listener';

@Injectable()
export class ResendOtpListener extends BaseOtpQueueListener<EmailJobPayload> {
  constructor(
    @InjectQueue(SystemQueues.EMAIL)
    queue: Queue<EmailJobPayload>,
    private readonly otpService: OtpService,
  ) {
    super(queue, new Logger(ResendOtpListener.name));
  }

  @OnEvent(SystemEvents.RESEND_OTP)
  async handle(event: ResendOtpEventPayload): Promise<void> {
    const { email, purpose } = event;
    try {
      const otp = await this.otpService.generateAndStore(email, purpose);
      await this.enqueueOtpJob(SystemJobs.RESEND_OTP, { email, otp, purpose });
    } catch (error) {
      this.logger.error(
        { email: maskEmail(email), purpose, err: error },
        'Failed to process resend OTP request',
      );
    }
  }
}

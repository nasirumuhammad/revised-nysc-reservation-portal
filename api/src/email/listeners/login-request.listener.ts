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
  SystemEvents,
  UserLoginEventPayload,
} from '@/common/constants/system-events.constant';
import { BaseOtpQueueListener } from './base-otp-queue.listener';

@Injectable()
export class LoginRequestListener extends BaseOtpQueueListener<EmailJobPayload> {
  constructor(
    @InjectQueue(SystemQueues.EMAIL)
    queue: Queue<EmailJobPayload>,
    private readonly otpService: OtpService,
  ) {
    super(queue, new Logger(LoginRequestListener.name));
  }

  @OnEvent(SystemEvents.USER_LOGIN)
  async handle(event: UserLoginEventPayload): Promise<void> {
    const {
      user: { email },
    } = event;
    try {
      const otp = await this.otpService.generateAndStore(email, 'login');
      await this.enqueueOtpJob(SystemJobs.SEND_LOGIN_OTP, { email, otp });
    } catch (error) {
      this.logger.error(
        { email: maskEmail(email), err: error },
        'Failed to process login OTP request',
      );
    }
  }
}

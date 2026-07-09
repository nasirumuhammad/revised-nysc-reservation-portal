import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { EmailService } from './email.service';
import {
  EmailJobPayload,
  ResendOtpJobPayload,
  SystemJob,
  SystemJobs,
  SystemJobsBasePayload,
  SystemQueues,
} from './common/email.constant';

type EmailJobHandler = (job: Job<EmailJobPayload>) => Promise<void>;

@Injectable()
@Processor(SystemQueues.EMAIL)
export class EmailJobProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailJobProcessor.name);

  private readonly handlers: Partial<Record<SystemJob, EmailJobHandler>> = {
    [SystemJobs.SEND_LOGIN_OTP]: (job) =>
      this.emailService.sendLoginOtp(job.data as SystemJobsBasePayload),
    [SystemJobs.SEND_FORGOT_PASSWORD_OTP]: (job) =>
      this.emailService.sendForgotPasswordOtp(
        job.data as SystemJobsBasePayload,
      ),
    [SystemJobs.RESEND_OTP]: (job) =>
      this.emailService.sendResendOtp(job.data as ResendOtpJobPayload),
  };

  constructor(private readonly emailService: EmailService) {
    super();
  }

  async process(job: Job<EmailJobPayload>): Promise<void> {
    const handler = this.handlers[job.name as SystemJob];

    if (!handler) {
      this.logger.warn(
        { jobId: job.id, jobName: job.name },
        'Received unknown mail job type',
      );
      return;
    }

    await this.executeJob(job, handler);
  }

  private async executeJob(
    job: Job<EmailJobPayload>,
    handler: EmailJobHandler,
  ): Promise<void> {
    try {
      await handler(job);
    } catch (error) {
      this.logger.error(
        {
          jobId: job.id,
          jobName: job.name,
          attemptsMade: job.attemptsMade,
          err: error,
        },
        `${job.name} job failed`,
      );
      throw error;
    }
  }
}

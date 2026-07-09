import { InternalServerErrorException, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import {
  emailJobConfig,
  EmailJobPayload,
  SystemJob,
} from '../common/email.constant';
import { maskEmail } from '@/common/utils/mask.util';

export abstract class BaseOtpQueueListener<T extends EmailJobPayload> {
  constructor(
    protected readonly queue: Queue<EmailJobPayload>,
    protected readonly logger: Logger,
  ) {}

  /**
   * Enqueues an OTP email job. Throws on failure so the calling listener's
   * handle() can decide how to react (retry, alert, compensating action)
   * instead of the failure being silently swallowed here.
   */
  protected async enqueueOtpJob(jobName: SystemJob, payload: T): Promise<void> {
    try {
      await this.queue.add(jobName, payload, emailJobConfig);
    } catch (error: any) {
      this.logger.error(
        {
          jobName,
          email: maskEmail(payload.email),
          err: error,
        },
        `Failed to add ${jobName} job to queue`,
      );
      throw new Error(error);
    }
  }
}

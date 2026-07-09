import { JobsOptions } from 'bullmq';
import { Purpose } from '@/otp/otp.service';

export const EmailSubjects = {
  LOGIN: 'Your login verification code',
  FORGOT_PASSWORD: 'Reset your password',
  RESEND_OTP: 'Your new verification code',
} as const;

export type EmailSubject = (typeof EmailSubjects)[keyof typeof EmailSubjects];

export const SystemQueues = {
  EMAIL: 'email.queue',
} as const;

export const SystemJobs = {
  SEND_LOGIN_OTP: 'send-login-otp',
  SEND_FORGOT_PASSWORD_OTP: 'send-forgot-password-otp',
  RESEND_OTP: 'resend-otp',
} as const;

export type SystemJob = (typeof SystemJobs)[keyof typeof SystemJobs];

export type SystemJobsBasePayload = { email: string; otp: string };

export type ResendOtpJobPayload = SystemJobsBasePayload & { purpose: Purpose };

export const RESEND_CLIENT = 'RESEND_CLIENT';

export type EmailJobPayload = SystemJobsBasePayload | ResendOtpJobPayload;

export const emailJobConfig: JobsOptions = {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 1000 * 20,
  },
  removeOnComplete: 100,
  removeOnFail: 100,
};

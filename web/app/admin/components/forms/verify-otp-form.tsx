"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import z from "zod";

import { verifyOtpSchema } from "@/schemas/verify-otp.schema";
import { authApi } from "@/lib/api/auth";
import { ApiError } from "@/lib/api";
import { applyFieldErrors } from "@/lib/api/apply-field-error";
import { BackLink } from "../../components/back-link";
import { SubmitButton } from "../../components/submit-button";
import { FormError } from "../../components/form-error";
import { OtpField } from "../../components/otp-field";
import { EmailField } from "../../components/email-field";
import { ResendOtp } from "../../components/resend-otp";
import { UseFormSubmitState } from "@/hooks/use-form-submit-state";
import FormHeading from "@/components/form-heading";

type FormSchema = z.infer<typeof verifyOtpSchema>;

function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromQuery = searchParams.get("email") ?? "";
  const { isBusy, markRedirecting } = UseFormSubmitState();

  useEffect(() => {
    router.prefetch("/admin/reset-password");
  }, [router]);

  const {
    handleSubmit,
    control,
    getValues,
    setError,
    formState: { isSubmitting, errors },
  } = useForm<FormSchema>({
    resolver: standardSchemaResolver(verifyOtpSchema),
    defaultValues: {
      email: emailFromQuery,
      otp: "",
    },
  });

  async function onSubmit(data: FormSchema) {
    try {
      const result = await authApi.verifyResetOtp(data);
      if (!result) {
        setError("root", {
          message: "Something went wrong. Please try again.",
        });
        return;
      }
      markRedirecting();
      router.push(
        `/admin/reset-password?token=${encodeURIComponent(result.resetToken)}`,
      );
    } catch (error) {
      if (error instanceof ApiError) {
        const handled = applyFieldErrors(error, setError);
        if (!handled) {
          setError("root", { message: error.message });
        }
      }
    }
  }

  async function handleResend() {
    const email = emailFromQuery || getValues("email");
    if (!email) return;
    await authApi.resendForgotPasswordOtp(email);
  }

  const busy = isBusy(isSubmitting);

  return (
    <>
      <FormHeading
        heading="Enter verification code"
        subHeading={
          emailFromQuery
            ? `We sent a 6-digit code to ${emailFromQuery}`
            : "Enter the code sent to your email"
        }
      />
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-8 flex flex-col gap-5 p-6"
        noValidate
      >
        <FormError message={errors.root?.message} />
        {!emailFromQuery && (
          <EmailField control={control} name="email" autoFocus />
        )}
        <div className="w-full flex justify-center items-center">
          <div>
            <OtpField control={control} name="otp" label="" />
          </div>
        </div>
        <SubmitButton isSubmitting={busy} loadingText="Verifying...">
          Verify code
        </SubmitButton>

        <ResendOtp onResend={handleResend} />
      </form>

      <BackLink href="/admin/forgot-password">Back to forgot password</BackLink>
    </>
  );
}

export default VerifyOtpForm;

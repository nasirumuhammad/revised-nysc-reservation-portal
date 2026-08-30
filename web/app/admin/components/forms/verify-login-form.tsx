"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import z from "zod";

import { verifyOtpSchema } from "@/schemas/verify-otp.schema";
import { authApi } from "@/lib/api/auth";
import { applyFieldErrors } from "@/lib/api/apply-field-error";
import FormHeading from "@/components/form-heading";
import { BackLink } from "../../components/back-link";
import { FormError } from "../../components/form-error";
import { OtpField } from "../../components/otp-field";
import { SubmitButton } from "../../components/submit-button";
import { ResendOtp } from "../../components/resend-otp";
import { UseFormSubmitState } from "@/hooks/use-form-submit-state";
import { ApiError } from "@/lib/api/api-error";

type FormSchema = z.infer<typeof verifyOtpSchema>;

function VerifySigninOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const { isBusy, markRedirecting } = UseFormSubmitState();

  useEffect(() => {
    router.prefetch("/admin/students");
  }, [router]);

  const {
    handleSubmit,
    control,
    setError,
    formState: { isSubmitting, errors },
  } = useForm<FormSchema>({
    resolver: standardSchemaResolver(verifyOtpSchema),
    defaultValues: { email, otp: "" },
  });

  async function onSubmit(data: FormSchema) {
    try {
      await authApi.verifySigninOtp(data);

      markRedirecting();
      router.push("/admin/students");
    } catch (error) {
      if (error instanceof ApiError) {
        const handled = applyFieldErrors(error, setError);

        if (!handled) {
          setError("root", { message: error.message });
        }
      } else {
        setError("root", {
          message: "Something went wrong. Please try again.",
        });
      }
    }
  }

  async function handleResend() {
    if (!email) return;
    await authApi.resendLoginOtp(email);
  }

  const busy = isBusy(isSubmitting);

  if (!email) {
    return (
      <>
        <div className="text-center">
          <h1 className="text-xl font-semibold tracking-tight">
            Session expired
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Please sign in again to receive a new code.
          </p>
        </div>
        <BackLink href="/auth/signin/admin">Back to sign in</BackLink>
      </>
    );
  }

  return (
    <>
      <FormHeading
        heading="Enter verification code"
        subHeading={`We sent a 6-digit code to ${email}`}
      />
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-8 flex flex-col gap-5 p-6"
        noValidate
      >
        <FormError message={errors.root?.message} />
        <div className="w-full flex justify-center items-center">
          <div>
            <OtpField control={control} name="otp" label="" />
          </div>
        </div>
        <SubmitButton isSubmitting={busy} loadingText="Verifying...">
          Verify and sign in
        </SubmitButton>

        <ResendOtp onResend={handleResend} />
      </form>

      <BackLink href="/admin">Back to sign in</BackLink>
    </>
  );
}

export default VerifySigninOtpForm;

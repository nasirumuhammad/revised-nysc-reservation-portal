"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { MailCheck } from "lucide-react";
import z from "zod";

import { forgotPasswordSchema } from "@/schemas/forgot-password.schema";
import FormHeading from "@/components/form-heading";
import { SubmitButton } from "../../components/submit-button";
import { EmailField } from "../../components/email-field";
import { BackLink } from "../../components/back-link";
import { authApi } from "@/lib/api/auth";
import { ApiError } from "@/lib/api";
import { applyFieldErrors } from "@/lib/api/apply-field-error";
import { AuthLayout } from "../../components/authlayout";
import { UseFormSubmitState } from "@/hooks/use-form-submit-state";

type FormSchema = z.infer<typeof forgotPasswordSchema>;

const ForgotPasswordForm = () => {
  const { isBusy, markRedirecting } = UseFormSubmitState();
  const {
    handleSubmit,
    control,
    getValues,
    reset,
    formState: { isSubmitting, isSubmitSuccessful },
    setError,
  } = useForm<FormSchema>({
    resolver: standardSchemaResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(data: FormSchema) {
    try {
      await authApi.forgotPassword(data.email);
      markRedirecting();
    } catch (error) {
      if (error instanceof ApiError) {
        const handled = applyFieldErrors(error, setError);
        if (!handled) {
          setError("root", { message: error.message });
        }
        return;
      }
    }
  }
  const busy = isBusy(isSubmitting);
  if (isSubmitSuccessful) {
    return (
      <>
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <MailCheck className="h-6 w-6 text-primary" />
        </div>
        <h1 className="mt-4 text-xl text-center font-semibold tracking-tight">
          Check your email
        </h1>
        <p className="mt-2 text-sm text-muted-foreground text-center">
          If an account exists for{" "}
          <span className="font-medium text-foreground">
            {getValues("email")}
          </span>
          , we&apos;ve sent a code to reset your password.
        </p>

        <SubmitButton
          isSubmitting={false}
          loadingText=""
          className="mt-6 w-full"
        >
          <Link
            href={`/admin/verify-otp?email=${encodeURIComponent(getValues("email"))}`}
          >
            Enter reset code
          </Link>
        </SubmitButton>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => reset()}
            className="mt-4 text-sm font-medium text-primary hover:underline block"
          >
            Use a different email
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <FormHeading
        heading="Forgot password?"
        subHeading="Enter your email and we'll send you a code to reset it."
      />
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-8 flex flex-col gap-5 p-6 "
        noValidate
      >
        <EmailField control={control} name="email" autoFocus />
        <SubmitButton isSubmitting={busy} loadingText="Sending code...">
          Send reset code
        </SubmitButton>
      </form>

      <BackLink href="/admin">Back to sign in</BackLink>
    </>
  );
};

export default ForgotPasswordForm;

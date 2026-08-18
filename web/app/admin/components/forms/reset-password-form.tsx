"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import z from "zod";

import { resetPasswordSchema } from "@/schemas/reset-password.schema";
import FormHeading from "@/components/form-heading";
import { SubmitButton } from "../../components/submit-button";
import { PasswordField } from "../../components/password-field";
import { authApi } from "@/lib/api/auth";
import { ApiError } from "@/lib/api";
import { applyFieldErrors } from "@/lib/api/apply-field-error";

type FormSchema = z.infer<typeof resetPasswordSchema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const {
    handleSubmit,
    control,
    setError,
    formState: { isSubmitting },
  } = useForm<FormSchema>({
    resolver: standardSchemaResolver(resetPasswordSchema),
    defaultValues: {
      token,
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: FormSchema) {
    if (!data.token) {
      setError("token", { message: "Reset link is invalid or has expired." });
      return;
    }

    try {
      await authApi.resetPassword({
        token: data.token,
        password: data.password,
      });
      router.push("/admin?reset=success");
    } catch (error) {
      if (error instanceof ApiError) {
        const handled = applyFieldErrors(error, setError);
        if (!handled) {
          setError("root", { message: error.message });
        }
      }
    }
  }

  if (!token) {
    return (
      <div className="text-center w-full flex flex-col items-center justify-center  h-full">
        <div className="text-center">
          <h1 className="text-xl font-semibold tracking-tight">
            Invalid or expired link
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This password reset link is missing or no longer valid. Please
            request a new one.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-8 flex flex-col gap-5 p-6"
        noValidate
      >
        <PasswordField
          control={control}
          name="password"
          label="New password"
          placeholder="Enter your new password"
        />
        <PasswordField
          control={control}
          name="confirmPassword"
          label="Confirm password"
          placeholder="Re-enter your new password"
        />
        <SubmitButton isSubmitting={isSubmitting} loadingText="Resetting...">
          Reset password
        </SubmitButton>
      </form>
    </>
  );
}

export default ResetPasswordForm;

"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { Loader2 } from "lucide-react";
import z from "zod";

import { signinSchema } from "@/schemas/signup.schema";
import { Button } from "@/components/ui/button";
import { authApi } from "@/lib/api/auth";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api";
import { applyFieldErrors } from "@/lib/api/apply-field-error";
import { useEffect } from "react";
import { UseFormSubmitState } from "@/hooks/use-form-submit-state";
import { FormError } from "../form-error";
import { EmailField } from "../email-field";
import { PasswordField } from "../password-field";

type FormSchema = z.infer<typeof signinSchema>;

const SignInForm = () => {
  const router = useRouter();
  const { isBusy, markRedirecting } = UseFormSubmitState();
  useEffect(() => {
    router.prefetch("/admin/verify-login");
  }, [router]);
  const {
    handleSubmit,
    control,
    formState: { isSubmitting, errors },
    setError,
  } = useForm<FormSchema>({
    resolver: standardSchemaResolver(signinSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: FormSchema) {
    try {
      await authApi.adminSignIn(data);
      markRedirecting();
      router.push(
        `/admin/verify-login?email=${encodeURIComponent(data.email)}`,
      );
    } catch (error) {
      if (error instanceof ApiError) {
        const handledError = applyFieldErrors(error, setError);
        if (!handledError) setError("root", { message: error.message });
      }
    }
  }
  const busy = isBusy(isSubmitting);
  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-8 flex flex-col gap-5 p-6 w-full"
        noValidate
      >
        <FormError message={errors.root?.message} />
        <EmailField control={control} name="email" />

        <PasswordField
          control={control}
          name="password"
          forgotPasswordHref="/admin/forgot-password"
        />

        <Button type="submit" disabled={busy} className="mt-1">
          {busy ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Not an admin?{" "}
        <Link
          href="/auth/signin/student"
          className="font-medium text-primary hover:underline"
        >
          Sign in as a student
        </Link>
      </p>
    </>
  );
};

export default SignInForm;

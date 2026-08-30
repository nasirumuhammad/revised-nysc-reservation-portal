"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { Loader2 } from "lucide-react";
import z from "zod";

import { studentSigninSchema } from "@/schemas/student-signin.schema";
import { authApi } from "@/lib/api/auth";
import { Button } from "@/components/ui/button";
import { UseFormSubmitState } from "@/hooks/use-form-submit-state";
import { FormError } from "@/app/admin/components/form-error";
import { RegNumberField } from "@/components/reg-number-field";
import { PasswordField } from "@/app/admin/components/password-field";
import { applyFieldErrors } from "@/lib/api/apply-field-error";
import { ApiError } from "@/lib/api/api-error";
import Image from "next/image";
type FormSchema = z.infer<typeof studentSigninSchema>;

export function StudentSigninForm() {
  const router = useRouter();
  const { isBusy, markRedirecting } = UseFormSubmitState();

  useEffect(() => {
    router.prefetch("/student/dashboard");
  }, [router]);

  const {
    handleSubmit,
    control,
    setError,
    formState: { isSubmitting, errors },
  } = useForm<FormSchema>({
    resolver: standardSchemaResolver(studentSigninSchema),
    defaultValues: { registrationNumber: "", password: "" },
  });

  async function onSubmit(data: FormSchema) {
    try {
      await authApi.studentSignIn(data);

      markRedirecting();
      router.push("/student/dashboard");
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

  const busy = isBusy(isSubmitting);

  return (
    <>
      <div className="w-full flex justify-center">
        <div className="relative w-[80px] h-[80px]">
          <Image src={"/abu-logo.png"} alt="abu logo" fill />
        </div>
      </div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-8 flex flex-col gap-5 p-6 items-center justify-center "
        noValidate
      >
        <FormError message={errors.root?.message} />
        <RegNumberField control={control} name="registrationNumber" autoFocus />
        <PasswordField control={control} name="password" />
        <Button type="submit" disabled={busy} className=" w-full mt-1">
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
    </>
  );
}

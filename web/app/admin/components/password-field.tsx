"use client";

import { useState } from "react";
import Link from "next/link";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type PasswordFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  placeholder?: string;
  forgotPasswordHref?: string;
};

export function PasswordField<T extends FieldValues>({
  control,
  name,
  label = "Password",
  placeholder = "Enter your password",
  forgotPasswordHref,
}: PasswordFieldProps<T>) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <div className="flex items-center justify-between">
            <FieldLabel htmlFor={name}>{label}</FieldLabel>
            {forgotPasswordHref && (
              <Link
                href={forgotPasswordHref}
                className="text-sm font-medium text-primary hover:underline"
              >
                Forgot password?
              </Link>
            )}
          </div>
          <div className="relative">
            <Input
              {...field}
              id={name}
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder={placeholder}
              aria-invalid={fieldState.invalid}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? "Hide password" : "Show password"}
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}

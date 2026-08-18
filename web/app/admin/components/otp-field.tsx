"use client";

import { Control, Controller, FieldValues, Path } from "react-hook-form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";

type OtpFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  length?: number;
};

export function OtpField<T extends FieldValues>({
  control,
  name,
  label = "Verification code",
  length = 6,
}: OtpFieldProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className="block">
          <FieldLabel htmlFor={name}>{label}</FieldLabel>
          <InputOTP
            maxLength={length}
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
          >
            <InputOTPGroup>
              {Array.from({ length }).map((_, i) => (
                <InputOTPSlot key={i} index={i} />
              ))}
            </InputOTPGroup>
          </InputOTP>
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}

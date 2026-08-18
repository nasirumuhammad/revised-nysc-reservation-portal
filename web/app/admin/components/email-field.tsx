"use client";

import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type EmailFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  placeholder?: string;
  autoFocus?: boolean;
};

export function EmailField<T extends FieldValues>({
  control,
  name,
  label = "Email",
  placeholder = "admin@abu.edu.ng",
  autoFocus,
}: EmailFieldProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={name}>{label}</FieldLabel>
          <Input
            {...field}
            id={name}
            type="email"
            autoComplete="email"
            placeholder={placeholder}
            aria-invalid={fieldState.invalid}
            autoFocus={autoFocus}
          />
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}

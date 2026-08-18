"use client";

import { useForm, Controller } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { Loader2 } from "lucide-react";

import {
  createStaffSchema,
  CreateStaffSchema,
} from "@/schemas/create-staff.schema";
import { ApiError } from "@/lib/api/api-error";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { staffApi } from "@/lib/api/staffs";

type AddStaffDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
};

export function AddStaffDialog({
  open,
  onOpenChange,
  onCreated,
}: AddStaffDialogProps) {
  const {
    handleSubmit,
    control,
    reset,
    setError,
    formState: { isSubmitting, errors },
  } = useForm<CreateStaffSchema>({
    resolver: standardSchemaResolver(createStaffSchema),
    defaultValues: {
      firstName: "",
      middleName: "",
      surname: "",
      email: "",
      staffId: "",
      password:''
    },
  });

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) reset();
    onOpenChange(nextOpen);
  }

  async function onSubmit(data: CreateStaffSchema) {
    const payload = { ...data, password: data.password || undefined };
    try {
      await staffApi.create(data);
      handleOpenChange(false);
      onCreated();
    } catch (error: any) {
      if (error instanceof ApiError) {
        const fieldErrorEntries = error.fieldErrors
          ? Object.entries(error.fieldErrors)
          : [];

        if (fieldErrorEntries.length > 0) {
          for (const [field, messages] of fieldErrorEntries) {
            setError(field as keyof CreateStaffSchema, {
              message: messages[0],
            });
          }
        } else {
          setError("root", { message: error.message });
        }
      } else {
        setError("root", {
          message: error.message ?? "Something went wrong. Please try again.",
        });
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add staff</DialogTitle>
          <DialogDescription>
            Create a single staff record. The staff member's default password
            will be their staff ID.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
          noValidate
        >
          {errors.root && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {errors.root.message}
            </p>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Controller
              name="firstName"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="firstName">First name</FieldLabel>
                  <Input {...field} id="firstName" autoFocus />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="middleName"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="middleName">Middle name</FieldLabel>
                  <Input {...field} id="middleName" />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>

          <Controller
            name="surname"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="surname">Surname</FieldLabel>
                <Input {...field} id="surname" />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="email"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input {...field} id="email" type="email" />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="password"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="password">Password (optional)</FieldLabel>
                <Input
                  {...field}
                  id="password"
                  type="password"
                  placeholder="Leave blank to use staff ID as default password"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="staffId"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="staffId">Staff ID</FieldLabel>
                <Input {...field} id="staffId" />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create staff"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

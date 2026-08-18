"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { Loader2 } from "lucide-react";

import {
  createStaffSchema,
  CreateStaffSchema,
  EditStaffSchema,
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
import { StaffRecord } from "@/types/staffs";
import { staffApi } from "@/lib/api/staffs";

type EditStaffDialogProps = {
  staff: StaffRecord | null;
  onOpenChange: (open: boolean) => void;
  onUpdated: () => void;
};

export function EditStaffDialog({
  staff,
  onOpenChange,
  onUpdated,
}: EditStaffDialogProps) {
  const {
    handleSubmit,
    control,
    reset,
    setError,
    formState: { isSubmitting, errors },
  } = useForm<EditStaffSchema>({
    resolver: standardSchemaResolver(createStaffSchema),
    defaultValues: {
      firstName: "",
      middleName: "",
      surname: "",
      email: "",
      staffId: "",
      password: "",
    },
  });

  useEffect(() => {
    if (staff) {
      reset({
        firstName: staff.firstName,
        middleName: staff.middleName ?? "",
        surname: staff.surname,
        email: staff.email,
        staffId: staff.staffId,
        password: "",
      });
    }
  }, [staff, reset]);

  function handleOpenChange(nextOpen: boolean) {
    onOpenChange(nextOpen);
  }

  async function onSubmit(data: EditStaffSchema) {
    if (!staff) return;
    try {
      await staffApi.update(staff.id, data);
      handleOpenChange(false);
      onUpdated();
    } catch (error) {
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
          message: "Something went wrong. Please try again.",
        });
      }
    }
  }

  return (
    <Dialog open={staff !== null} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit staff</DialogTitle>
          <DialogDescription>
            Update this staff member's record.
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
                  <Input {...field} id="firstName" />
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
                <FieldLabel htmlFor="password">
                  New password (optional)
                </FieldLabel>
                <Input
                  {...field}
                  id="password"
                  type="password"
                  placeholder="Leave blank to keep current password"
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
                  Saving...
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

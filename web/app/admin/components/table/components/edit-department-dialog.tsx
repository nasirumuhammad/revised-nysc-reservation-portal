"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { Loader2 } from "lucide-react";

import {
  createDepartmentSchema,
  CreateDepartmentSchema,
} from "@/schemas/create-department.schema";
import { ApiError } from "@/lib/api/api-error";
import { DepartmentRecord } from "@/types/department";
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
import { departmentsApi } from "@/lib/api/department";

type EditDepartmentDialogProps = {
  department: DepartmentRecord | null;
  onOpenChange: (open: boolean) => void;
  onUpdated: () => void;
};

export function EditDepartmentDialog({
  department,
  onOpenChange,
  onUpdated,
}: EditDepartmentDialogProps) {
  const {
    handleSubmit,
    control,
    reset,
    setError,
    formState: { isSubmitting, errors },
  } = useForm<CreateDepartmentSchema>({
    resolver: standardSchemaResolver(createDepartmentSchema),
    defaultValues: { name: "" },
  });

  useEffect(() => {
    if (department) {
      reset({ name: department.name });
    }
  }, [department, reset]);

  function handleOpenChange(nextOpen: boolean) {
    onOpenChange(nextOpen);
  }

  async function onSubmit(data: CreateDepartmentSchema) {
    if (!department) return;
    try {
      await departmentsApi.update(department.id, data);
      handleOpenChange(false);
      onUpdated();
    } catch (error) {
      if (error instanceof ApiError) {
        const fieldErrorEntries = error.fieldErrors
          ? Object.entries(error.fieldErrors)
          : [];
        if (fieldErrorEntries.length > 0) {
          for (const [field, messages] of fieldErrorEntries) {
            setError(field as keyof CreateDepartmentSchema, {
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
    <Dialog open={department !== null} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit department</DialogTitle>
          <DialogDescription>
            Update this department's details.
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

          <Controller
            name="name"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="name">Department name</FieldLabel>
                <Input {...field} id="name" autoFocus />
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

"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { Loader2 } from "lucide-react";

import {
  createStudentSchema,
  CreateStudentSchema,
  ClassOfDegree,
  Gender,
  Marital_status,
  EditStudentSchema,
} from "@/schemas/create-student.schema";
import { studentsApi } from "@/lib/api/students";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StudentRecord } from "@/types/students";

type EditStudentDialogProps = {
  student: StudentRecord | null;
  onOpenChange: (open: boolean) => void;
  onUpdated: () => void;
};

function toTitleCase(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(" ");
}

export function EditStudentDialog({
  student,
  onOpenChange,
  onUpdated,
}: EditStudentDialogProps) {
  const {
    handleSubmit,
    control,
    reset,
    setError,
    formState: { isSubmitting, errors },
  } = useForm<EditStudentSchema>({
    resolver: standardSchemaResolver(createStudentSchema),
    defaultValues: {
      firstName: "",
      middleName: "",
      surname: "",
      email: "",
      dateOfBirth: "",
      dateOfGraduation: "",
      jambRegNumber: "",
      registrationNumber: "",
      stateOfOrigin: "",
      isMilitary: false,
      password: "",
    },
  });

  useEffect(() => {
    if (student) {
      reset({
        firstName: student.firstName,
        middleName: student.middleName ?? "",
        surname: student.surname,
        email: student.email,
        gender: student.gender as CreateStudentSchema["gender"],
        dateOfBirth: student.dateOfBirth.slice(0, 10),
        maritalStatus:
          student.maritalStatus as CreateStudentSchema["maritalStatus"],
        classOfDegree:
          student.classOfDegree as CreateStudentSchema["classOfDegree"],
        dateOfGraduation: student.dateOfGraduation.slice(0, 10),
        jambRegNumber: student.jambRegNumber,
        registrationNumber: student.registrationNumber,
        stateOfOrigin: student.stateOfOrigin,
        isMilitary: student.isMilitary,
        password: "",
      });
    }
  }, [student, reset]);

  function handleOpenChange(nextOpen: boolean) {
    onOpenChange(nextOpen);
  }

  async function onSubmit(data: EditStudentSchema) {
    if (!student) return;
    const payload = { ...data, password: data.password || undefined };
    try {
      await studentsApi.update(student.id, data);
      handleOpenChange(false);
      onUpdated();
    } catch (error) {
      if (error instanceof ApiError) {
        const fieldErrorEntries = error.fieldErrors
          ? Object.entries(error.fieldErrors)
          : [];

        if (fieldErrorEntries.length > 0) {
          for (const [field, messages] of fieldErrorEntries) {
            setError(field as keyof CreateStudentSchema, {
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
    <Dialog open={student !== null} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit student</DialogTitle>
          <DialogDescription>Update this student's record.</DialogDescription>
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

          <div className="grid grid-cols-2 gap-3">
            <Controller
              name="gender"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="gender">Gender</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="gender">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      {Gender.map((option) => (
                        <SelectItem key={option} value={option}>
                          {toTitleCase(option)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="maritalStatus"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="maritalStatus">
                    Marital status
                  </FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="maritalStatus">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {Marital_status.map((option) => (
                        <SelectItem key={option} value={option}>
                          {toTitleCase(option)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>

          <Controller
            name="dateOfBirth"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="dateOfBirth">Date of birth</FieldLabel>
                <Input {...field} id="dateOfBirth" type="date" />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <div className="grid grid-cols-2 gap-3">
            <Controller
              name="classOfDegree"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="classOfDegree">
                    Class of degree
                  </FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="classOfDegree">
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {ClassOfDegree.map((option) => (
                        <SelectItem key={option} value={option}>
                          {toTitleCase(option)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="dateOfGraduation"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="dateOfGraduation">
                    Date of graduation
                  </FieldLabel>
                  <Input {...field} id="dateOfGraduation" type="date" />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Controller
              name="jambRegNumber"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="jambRegNumber">
                    JAMB reg number
                  </FieldLabel>
                  <Input {...field} id="jambRegNumber" />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="registrationNumber"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="registrationNumber">
                    Registration number
                  </FieldLabel>
                  <Input {...field} id="registrationNumber" />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>

          <Controller
            name="stateOfOrigin"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="stateOfOrigin">State of origin</FieldLabel>
                <Input {...field} id="stateOfOrigin" />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="isMilitary"
            control={control}
            render={({ field }) => (
              <div className="flex items-center gap-2">
                <Checkbox
                  id="isMilitary"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
                <FieldLabel htmlFor="isMilitary" className="font-normal">
                  Military personnel
                </FieldLabel>
              </div>
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

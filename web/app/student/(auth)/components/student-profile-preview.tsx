"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { studentsApi } from "@/lib/api/students";
import { ApiError } from "@/lib/api/api-error";
import { Skeleton } from "@/components/ui/skeleton";
import { StudentRecord } from "@/types/students";
import { StudentLogoutButton } from "../../components/student-logout-botton";

function formatDate(value: string): string {
  try {
    return format(new Date(value), "dd MMM yyyy");
  } catch {
    return value;
  }
}

function toTitleCase(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(" ");
}

type InfoRowProps = {
  label: string;
  value: string;
};

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div className="flex flex-col gap-0.5 py-3 sm:flex-row sm:items-center sm:justify-between sm:py-2.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground sm:text-right">
        {value}
      </span>
    </div>
  );
}

export function StudentProfileView() {
  const [student, setStudent] = useState<StudentRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      setIsLoading(true);
      setError(null);
      try {
        const result = await studentsApi.getMe();
        if (result) setStudent(result);
      } catch (err) {
        setError(
          err instanceof ApiError
            ? err.message
            : "Failed to load your profile.",
        );
      } finally {
        setIsLoading(false);
      }
    }
    fetchProfile();
  }, []);

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-2xl space-y-4 p-4 sm:p-6">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-3 rounded-lg border p-4 sm:p-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-5 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-2xl p-4 sm:p-6">
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      </div>
    );
  }

  if (!student) return null;

  const fullName = [student.firstName, student.middleName, student.surname]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="mx-auto w-full max-w-2xl p-4 sm:p-6">
      <div className="mb-4 flex items-start justify-between gap-4 sm:mb-6">
        <div>
          <h1 className="text-xl font-semibold sm:text-2xl">{fullName}</h1>
          <p className="text-sm text-muted-foreground">{student.email}</p>
        </div>
        <StudentLogoutButton />
      </div>

      <div className="space-y-6">
        <section className="rounded-lg border p-4 sm:p-6">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Personal Information
          </h2>
          <div className="divide-y sm:divide-y-0">
            <InfoRow label="Full name" value={fullName} />
            <InfoRow label="Email" value={student.email} />
            <InfoRow label="Gender" value={toTitleCase(student.gender)} />
            <InfoRow
              label="Date of birth"
              value={formatDate(student.dateOfBirth)}
            />
            <InfoRow
              label="Marital status"
              value={toTitleCase(student.maritalStatus)}
            />
            <InfoRow label="State of origin" value={student.stateOfOrigin} />
          </div>
        </section>

        <section className="rounded-lg border p-4 sm:p-6">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Academic Information
          </h2>
          <div className="divide-y sm:divide-y-0">
            <InfoRow
              label="Registration number"
              value={student.registrationNumber}
            />
            <InfoRow label="JAMB reg number" value={student.jambRegNumber} />
            <InfoRow
              label="Class of degree"
              value={toTitleCase(student.classOfDegree)}
            />
            <InfoRow
              label="Date of graduation"
              value={formatDate(student.dateOfGraduation)}
            />
            <InfoRow
              label="Military personnel"
              value={student.isMilitary ? "Yes" : "No"}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

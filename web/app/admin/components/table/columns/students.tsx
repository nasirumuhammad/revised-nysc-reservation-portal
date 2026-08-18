"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { StudentRecord } from "@/types/students";
import { selectionColumn } from "./selection-column";
import { actionsColumn } from "./action-column";

function formatDate(value: string): string {
  try {
    return format(new Date(value), "dd MMM yyyy");
  } catch {
    return value;
  }
}

export function getStudentColumns(
  onEditOne: (id: string) => void,
  onDeleteOne: (id: string) => void,
): ColumnDef<StudentRecord>[] {
  return [
    selectionColumn<StudentRecord>(),
    {
      id: "name",
      header: "Name",
      cell: ({ row }) => {
        const s = row.original;
        return (
          <span className="font-medium">
            {[s.firstName, s.middleName, s.surname].filter(Boolean).join(" ")}
          </span>
        );
      },
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ getValue }) => (
        <span className="text-muted-foreground">{getValue<string>()}</span>
      ),
    },
    { accessorKey: "registrationNumber", header: "Reg. Number" },
    { accessorKey: "classOfDegree", header: "Class of Degree" },
    {
      accessorKey: "dateOfBirth",
      header: "Date of Birth",
      cell: ({ getValue }) => formatDate(getValue<string>()),
    },
    { accessorKey: "gender", header: "Gender" },
    actionsColumn<StudentRecord>((row) => row.id, onEditOne, onDeleteOne),
  ];
}

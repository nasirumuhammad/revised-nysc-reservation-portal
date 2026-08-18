"use client";

import { StaffRecord } from "@/types/staffs";
import { ColumnDef } from "@tanstack/react-table";
import { selectionColumn } from "./selection-column";
import { actionsColumn } from "./action-column";

export function getStaffColumns(
  onEditOne: (id: string) => void,
  onDeleteOne: (id: string) => void,
): ColumnDef<StaffRecord>[] {
  return [
    selectionColumn<StaffRecord>(),
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
    { accessorKey: "staffId", header: "Staff ID" },
    actionsColumn<StaffRecord>((row) => row.id, onEditOne, onDeleteOne),
  ];
}

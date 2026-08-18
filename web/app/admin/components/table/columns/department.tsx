"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DepartmentRecord } from "@/types/department";
import { selectionColumn } from "../columns/selection-column";
import { actionsColumn } from "./action-column";

export function getDepartmentColumns(
  onDeleteOne: (id: string) => void,
  onEditOne: (id: string) => void,
): ColumnDef<DepartmentRecord>[] {
  return [
    selectionColumn<DepartmentRecord>(),
    {
      accessorKey: "name",
      header: "Department Name",
      cell: ({ getValue }) => (
        <span className="font-medium">{getValue<string>()}</span>
      ),
    },
    actionsColumn<DepartmentRecord>((row) => row.id, onEditOne, onDeleteOne),
  ];
}

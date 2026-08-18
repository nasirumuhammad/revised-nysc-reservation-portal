"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function actionsColumn<TData>(
  getId: (row: TData) => string,
  onEditOne: (id: string) => void,
  onDeleteOne: (id: string) => void,
): ColumnDef<TData> {
  return {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={() => onEditOne(getId(row.original))}
          aria-label="Edit record"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={() => onDeleteOne(getId(row.original))}
          aria-label="Delete record"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    ),
    enableSorting: false,
  };
}

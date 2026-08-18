"use client";

import { Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type BulkActionsBarProps = {
  selectedCount: number;
  onClearSelection: () => void;
  onDeleteSelected: () => void;
};

export function BulkActionsBar({
  selectedCount,
  onClearSelection,
  onDeleteSelected,
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center justify-between rounded-md border bg-muted/50 px-4 py-2">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onClearSelection}
          className="text-muted-foreground hover:text-foreground"
          aria-label="Clear selection"
        >
          <X className="h-4 w-4" />
        </button>
        <span className="text-sm font-medium">{selectedCount} selected</span>
      </div>
      <Button variant="destructive" size="sm" onClick={onDeleteSelected}>
        <Trash2 className="mr-2 h-4 w-4" />
        Delete selected
      </Button>
    </div>
  );
}

"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type DeleteConfirmDialogProps = {
  open: boolean;
  count: number;
  isDeleting: boolean;
  entityName: string; // singular, e.g. "student record"
  entityNamePlural?: string; // defaults to `${entityName}s`
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

export function DeleteConfirmDialog({
  open,
  count,
  isDeleting,
  entityName,
  entityNamePlural,
  onOpenChange,
  onConfirm,
}: DeleteConfirmDialogProps) {
  const plural = entityNamePlural ?? `${entityName}s`;
  const noun = count === 1 ? entityName : plural;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Delete {count === 1 ? `this ${entityName}` : `${count} ${plural}`}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action can be reversed by an administrator, but the {noun} will
            no longer appear in this list.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

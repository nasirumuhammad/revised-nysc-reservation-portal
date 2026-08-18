"use client";

import { useRef, useState } from "react";
import { Loader2, Upload, FileWarning, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api";
import { CsvUploadResult } from "@/types/students";

type CsvUploadDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadComplete: () => void;
  uploadFn: (file: File) => Promise<CsvUploadResult | undefined>;
  title?: string;
  description?: string;
};

export function CsvUploadDialog({
  open,
  onOpenChange,
  onUploadComplete,
  uploadFn,
  title = "Bulk upload",
  description = "Upload a CSV file using the template format to add multiple records at once.",
}: CsvUploadDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<CsvUploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setSelectedFile(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) reset();
    onOpenChange(nextOpen);
  }

  async function handleUpload() {
    if (!selectedFile) return;
    setIsUploading(true);
    setError(null);
    try {
      const uploadResult = await uploadFn(selectedFile);
      if (uploadResult) {
        setResult(uploadResult);
        if (uploadResult.created > 0) onUploadComplete();
      }
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Upload failed. Please try again.",
      );
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {!result && (
          <div className="space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-muted-foreground file:mr-4 file:rounded-md file:border-0 file:bg-primary/10 file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary hover:file:bg-primary/20"
            />
            {error && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}
          </div>
        )}

        {result && (
          <div className="space-y-3">
            {result.created > 0 && (
              <div className="flex items-center gap-2 rounded-md bg-primary/10 px-3 py-2 text-sm text-primary">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                {result.created} record{result.created === 1 ? "" : "s"} added
                successfully.
              </div>
            )}
            {result.errors.length > 0 && (
              <div className="max-h-48 space-y-2 overflow-y-auto rounded-md border p-3">
                <div className="flex items-center gap-2 text-sm font-medium text-destructive">
                  <FileWarning className="h-4 w-4" />
                  {result.errors.length} row
                  {result.errors.length === 1 ? "" : "s"} could not be imported
                </div>
                {result.errors.map(({ row, errors }) => (
                  <div key={row} className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">
                      Row {row}:
                    </span>{" "}
                    {Object.entries(errors)
                      .map(([field, msgs]) => `${field} — ${msgs[0]}`)
                      .join("; ")}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          {result ? (
            <Button onClick={() => handleOpenChange(false)}>Done</Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => handleOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

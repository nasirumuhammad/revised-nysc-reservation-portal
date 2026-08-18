"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type SubmitButtonProps = {
  isSubmitting: boolean;
  loadingText: string;
  children: React.ReactNode;
  className?: string;
};

export function SubmitButton({
  isSubmitting,
  loadingText,
  children,
  className,
}: SubmitButtonProps) {
  return (
    <Button type="submit" disabled={isSubmitting} className={className}>
      {isSubmitting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </Button>
  );
}

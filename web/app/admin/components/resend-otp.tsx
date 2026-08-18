"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useResendCooldown } from "@/hooks/use-resend-cooldown";

type ResendOtpProps = {
  onResend: () => Promise<unknown>;
  cooldownSeconds?: number;
};

export function ResendOtp({ onResend, cooldownSeconds }: ResendOtpProps) {
  const { secondsRemaining, isCoolingDown, startCoolDown } =
    useResendCooldown(cooldownSeconds);
  const [isSending, setIsSending] = useState(false);

  async function handleResend() {
    if (isCoolingDown || isSending) return;

    setIsSending(true);
    try {
      await onResend();
      startCoolDown();
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
      <span>Didn&apos;t get a code?</span>
      <button
        type="button"
        onClick={handleResend}
        disabled={isCoolingDown || isSending}
        className="font-medium text-primary hover:underline disabled:cursor-not-allowed disabled:text-muted-foreground disabled:no-underline"
      >
        {isSending ? (
          <Loader2 className="inline h-3.5 w-3.5 animate-spin" />
        ) : isCoolingDown ? (
          `Resend in ${secondsRemaining}s`
        ) : (
          "Resend code"
        )}
      </button>
    </div>
  );
}

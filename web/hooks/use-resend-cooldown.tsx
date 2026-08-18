import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_COOLDOWN_SECOND = 60;

type UseResendCoolDownReturn = {
  secondsRemaining: number;
  isCoolingDown: boolean;
  startCoolDown: () => void;
};

export function useResendCooldown(
  cooldownSeconds: number = DEFAULT_COOLDOWN_SECOND,
): UseResendCoolDownReturn {
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const clearExistingInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startCoolDown = useCallback(() => {
    clearExistingInterval();
    setSecondsRemaining(cooldownSeconds);
    intervalRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearExistingInterval();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [cooldownSeconds, clearExistingInterval]);
  useEffect(() => {
    return () => clearExistingInterval();
  }, [clearExistingInterval]);

  return {
    secondsRemaining,
    isCoolingDown: secondsRemaining > 0,
    startCoolDown,
  };
}

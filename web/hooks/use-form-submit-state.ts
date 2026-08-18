import { useState } from "react";

type UseFormSubmitStateReturn = {
  isRedirecting: boolean;
  isBusy: (isSubmitting: boolean) => boolean;
  markRedirecting: () => void;
};

export function UseFormSubmitState(): UseFormSubmitStateReturn {
  const [isRedirecting, setIsRedirecting] = useState(false);
  function markRedirecting() {
    setIsRedirecting(true);
  }

  function isBusy(isSubmitting: boolean) {
    return isRedirecting || isSubmitting;
  }
  return {
    isBusy,
    isRedirecting,
    markRedirecting,
  };
}

"use client";

import { useEffect, useState } from "react";
import { tokenStorage } from "@/lib/api/token-storage";
import { Payload } from "@/types/payload";
import { decodeJwt } from "@/lib/api/jwt-decode";

export function useCurrentRole(): Payload["role"] | null {
  const [role, setRole] = useState<Payload["role"] | null>(null);

  useEffect(() => {
    const token = tokenStorage.getAccessToken();
    if (!token) return;
    const payload = decodeJwt(token);
    setRole(payload?.role ?? null);
  }, []);

  return role;
}

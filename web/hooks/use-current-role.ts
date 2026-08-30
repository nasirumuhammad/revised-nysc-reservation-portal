"use client";

import { useEffect, useState } from "react";
import { Payload } from "@/types/payload";

type Role = Payload["role"] | null;

export function useCurrentRole(): Role {
  const [role, setRole] = useState<Role>(null);

  useEffect(() => {
    async function fetchRole() {
      try {
        const response = await fetch("/api/auth/me");

        if (!response.ok) {
          setRole(null);
          return;
        }

        const data = await response.json();
        setRole(data.user?.role ?? null);
      } catch (error) {
        console.error("Failed to fetch user role:", error);
        setRole(null);
      }
    }

    fetchRole();
  }, []);

  return role;
}

import { Payload } from "@/types/payload";

export function decodeJwt(token: string): Payload | null {
  try {
    const payloadSegment = token.split(".")[1];
    if (!payloadSegment) return null;

    const base64 = payloadSegment.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(base64);
    return JSON.parse(json) as Payload;
  } catch {
    return null;
  }
}

import { getPayload } from "payload";
import config from "@payload-config";

let cached = (global as typeof globalThis & { __payload?: Awaited<ReturnType<typeof getPayload>> }).__payload;

export async function getPayloadClient() {
  if (cached) return cached;
  cached = await getPayload({ config });
  (global as typeof globalThis & { __payload?: Awaited<ReturnType<typeof getPayload>> }).__payload = cached;
  return cached;
}

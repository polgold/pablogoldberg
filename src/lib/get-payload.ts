// Asegura global File antes de cargar Payload (runtime Node en Netlify puede no tenerlo).
import { File as NodeFile } from "node:buffer";
if (typeof globalThis.File === "undefined") {
  (globalThis as unknown as { File: typeof NodeFile }).File = NodeFile as unknown as typeof globalThis.File;
}

import { getPayload } from "payload";
import config from "@payload-config";

type PayloadClient = Awaited<ReturnType<typeof getPayload>>;
const cache = global as typeof globalThis & { __payload?: PayloadClient | null };

export async function getPayloadClient(): Promise<PayloadClient | null> {
  if (cache.__payload !== undefined) return cache.__payload;
  try {
    const payload = await getPayload({ config });
    cache.__payload = payload;
    return payload;
  } catch {
    cache.__payload = null;
    return null;
  }
}

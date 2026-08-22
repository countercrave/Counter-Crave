// @ts-expect-error cloudflare:workers is injected by Cloudflare/Vinext at runtime
import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export function getDb() {
  const cloudflareEnv = typeof env !== "undefined" ? (env as Record<string, unknown>) : (process.env as unknown as Record<string, unknown>);
  if (!cloudflareEnv?.DB) {
    throw new Error(
      "Cloudflare D1 binding `DB` is unavailable. Set the `d1` field in .openai/hosting.json to `DB` or let your control plane inject the real binding values before using the database."
    );
  }

  return drizzle(cloudflareEnv.DB as any, { schema });
}

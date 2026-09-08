/**
 * Minimal structural types for the Vercel Node.js serverless runtime.
 * We deliberately avoid depending on the `@vercel/node` package (it isn't
 * needed at runtime — Vercel injects a compatible req/res itself) so this
 * function has zero npm dependencies beyond what's built into Node.
 */
export interface VercelRequest {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body: unknown;
}

export interface VercelResponse {
  status(code: number): VercelResponse;
  json(body: unknown): void;
  setHeader(name: string, value: string): void;
  end(chunk?: unknown): void;
}

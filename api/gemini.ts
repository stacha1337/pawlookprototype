import { ApiError } from './errors';
import { buildGroomingPrompt, StyleId } from './prompts';

/**
 * Real image-to-image client.
 *
 * MODEL CHOICE: gemini-3.1-flash-image-preview ("Nano Banana 2"), called
 * directly against Google's Generative Language API.
 *
 * Why this model for PawLook's MVP (checked Sept 2026):
 *  - It's an image *editing* model (text+image in, image out) with strong
 *    subject/identity preservation across edits — exactly the "same dog,
 *    different haircut" requirement, not text-to-image from scratch.
 *  - It is Google's current recommended image-editing model. The older,
 *    cheaper `gemini-2.5-flash-image` ("Nano Banana" 1) that a lot of
 *    write-ups still reference is being shut down by Google on
 *    2 Oct 2026, so it would be a bad choice to build on today.
 *  - Pricing is still MVP-friendly: roughly $0.067 per generated image at
 *    1K resolution (billed as output image tokens), no fixed monthly cost,
 *    pay-per-call — good fit for a demo/MVP with unpredictable traffic.
 *  - Single REST call, no SDK required, so the serverless function has
 *    zero extra npm dependencies.
 *
 * Swapping providers later: everything Gemini-specific lives in this one
 * file. `generate.ts` only calls `generateGroomedImage(...)`, so moving to
 * e.g. Flux Kontext (via Replicate/BFL) or `gemini-3-pro-image-preview`
 * later means rewriting this file only.
 */

const GEMINI_MODEL = 'gemini-3.1-flash-image-preview';
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const REQUEST_TIMEOUT_MS = 55_000;

interface GeminiInlineDataPart {
  inlineData?: { mimeType?: string; data?: string };
  inline_data?: { mime_type?: string; data?: string };
  text?: string;
}

interface GeminiResponse {
  candidates?: Array<{
    content?: { parts?: GeminiInlineDataPart[] };
    finishReason?: string;
  }>;
  promptFeedback?: { blockReason?: string };
}

export interface GenerateGroomedImageInput {
  base64Image: string;
  mimeType: string;
  styleId: StyleId;
  apiKey: string;
  /** Injectable for tests; defaults to the global fetch. */
  fetchImpl?: typeof fetch;
}

export interface GenerateGroomedImageResult {
  base64Image: string;
  mimeType: string;
}

export async function generateGroomedImage({
  base64Image,
  mimeType,
  styleId,
  apiKey,
  fetchImpl = fetch,
}: GenerateGroomedImageInput): Promise<GenerateGroomedImageResult> {
  const prompt = buildGroomingPrompt(styleId);

  const body = {
    contents: [
      {
        role: 'user',
        parts: [{ inlineData: { mimeType, data: base64Image } }, { text: prompt }],
      },
    ],
    generationConfig: {
      responseModalities: ['IMAGE'],
    },
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetchImpl(GEMINI_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (err) {
    if ((err as { name?: string })?.name === 'AbortError') {
      throw new ApiError('timeout', 504, 'Model nie odpowiedział na czas. Spróbuj ponownie.');
    }
    throw new ApiError(
      'upstream-error',
      502,
      'Nie udało się połączyć z modelem AI. Sprawdź połączenie i spróbuj ponownie.'
    );
  } finally {
    clearTimeout(timeout);
  }

  if (res.status === 429) {
    throw new ApiError('rate-limited', 429, 'Model AI jest chwilowo przeciążony. Spróbuj ponownie za chwilę.');
  }

  if (!res.ok) {
    let details = '';
    try {
      details = await res.text();
    } catch {
      // ignore
    }
    throw new ApiError(
      'upstream-error',
      502,
      `Model AI zwrócił błąd (HTTP ${res.status}).${details ? ` ${details.slice(0, 300)}` : ''}`
    );
  }

  let data: GeminiResponse;
  try {
    data = (await res.json()) as GeminiResponse;
  } catch {
    throw new ApiError('upstream-error', 502, 'Odpowiedź modelu AI była nieczytelna.');
  }

  if (data.promptFeedback?.blockReason) {
    throw new ApiError(
      'upstream-error',
      422,
      `Zdjęcie zostało odrzucone przez filtry bezpieczeństwa modelu (${data.promptFeedback.blockReason}).`
    );
  }

  const parts = data.candidates?.[0]?.content?.parts ?? [];
  for (const part of parts) {
    const inline = part.inlineData ?? part.inline_data;
    const data64 = inline?.data;
    const mime = (inline as { mimeType?: string; mime_type?: string } | undefined)?.mimeType
      ?? (inline as { mimeType?: string; mime_type?: string } | undefined)?.mime_type;
    if (data64) {
      return { base64Image: data64, mimeType: mime ?? 'image/png' };
    }
  }

  throw new ApiError(
    'no-image-returned',
    502,
    'Model AI nie zwrócił obrazu wynikowego dla tego zdjęcia. Spróbuj z innym zdjęciem lub innym stylem.'
  );
}

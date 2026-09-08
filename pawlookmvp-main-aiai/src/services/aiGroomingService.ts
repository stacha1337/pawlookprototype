import { GenerationResult, GenerationError } from '../types';
import { API_URL } from '../config';
import { resizeImageDataUrl, estimateDataUrlBytes, MAX_UPLOAD_BYTES } from '../utils/image';

export type StageCallback = (stage: 'analyzing' | 'matching' | 'rendering') => void;

/**
 * AI Grooming Service — REAL implementation.
 * ------------------------------------------------------------
 * This module is the single seam between UI and AI generation.
 * The function signature and `GenerationResult` shape are unchanged
 * from the old mock, so no screen other than this file and
 * GeneratingScreen (which needed real error handling) had to change.
 *
 * Flow:
 *   1. 'analyzing' — resize/re-encode the photo client-side (real work:
 *      smaller upload, lower model cost). No filters, no style applied.
 *   2. 'matching'  — send the photo + styleId to our backend, which calls
 *      the real image-to-image model and waits for the actual response.
 *   3. 'rendering' — decode the returned image into the result shown on
 *      the Result screen.
 *
 * There is no artificial delay anywhere in this file — every stage
 * represents real work, and the "matching" stage's duration is however
 * long the model actually takes.
 * ------------------------------------------------------------
 */

const REQUEST_TIMEOUT_MS = 60_000;

interface BackendErrorBody {
  error?: string;
  code?: string;
}

export async function generateGroomingPreview(
  photoDataUrl: string,
  styleId: string,
  onStage?: StageCallback
): Promise<GenerationResult> {
  if (!photoDataUrl) {
    throw new GenerationError('no-photo', 'Brak zdjęcia psa. Dodaj zdjęcie i spróbuj ponownie.');
  }

  if (!API_URL) {
    throw new GenerationError(
      'api-error',
      'Usługa generowania AI nie jest skonfigurowana (brak adresu backendu). ' +
        'Sprawdź zmienną PAWLOOK_API_URL w konfiguracji builda.'
    );
  }

  onStage?.('analyzing');
  if (estimateDataUrlBytes(photoDataUrl) > MAX_UPLOAD_BYTES) {
    throw new GenerationError('too-large', 'Zdjęcie jest za duże. Wybierz mniejszy plik (do ok. 12MB).');
  }

  let preparedPhoto: string;
  try {
    preparedPhoto = await resizeImageDataUrl(photoDataUrl);
  } catch {
    throw new GenerationError(
      'invalid-format',
      'Nie udało się przetworzyć tego zdjęcia. Spróbuj innego pliku (JPG lub PNG).'
    );
  }

  onStage?.('matching');
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photo: preparedPhoto, styleId }),
      signal: controller.signal,
    });
  } catch (err) {
    if ((err as { name?: string })?.name === 'AbortError') {
      throw new GenerationError('timeout', 'Generowanie trwało zbyt długo. Spróbuj ponownie.');
    }
    throw new GenerationError(
      'network',
      'Nie udało się połączyć z serwerem generowania. Sprawdź internet i spróbuj ponownie.'
    );
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    let body: BackendErrorBody = {};
    try {
      body = (await response.json()) as BackendErrorBody;
    } catch {
      // response wasn't JSON — fall through to generic message below
    }

    if (response.status === 429) {
      throw new GenerationError(
        'rate-limited',
        body.error || 'Serwer generowania jest chwilowo przeciążony. Spróbuj ponownie za chwilę.'
      );
    }

    throw new GenerationError(
      'api-error',
      body.error || `Generowanie nie powiodło się (błąd serwera ${response.status}). Spróbuj ponownie.`
    );
  }

  onStage?.('rendering');
  let payload: { image?: string };
  try {
    payload = (await response.json()) as { image?: string };
  } catch {
    throw new GenerationError('no-image-returned', 'Odpowiedź serwera była nieczytelna. Spróbuj ponownie.');
  }

  if (!payload.image) {
    throw new GenerationError(
      'no-image-returned',
      'Model AI nie zwrócił obrazu. Spróbuj ponownie lub wybierz inne zdjęcie.'
    );
  }

  return {
    styleId,
    originalPhoto: photoDataUrl,
    resultImage: payload.image,
    generatedAt: Date.now(),
  };
}

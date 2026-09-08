import { ApiError } from './errors';
import { generateGroomedImage, GenerateGroomedImageInput } from './gemini';
import { isValidStyleId } from './prompts';

const ACCEPTED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
// Base64 payload length limit — roughly corresponds to an ~8MB decoded image.
// The frontend already downsizes photos before sending, so a legitimate
// upload should be far under this; this is a backstop against abuse.
const MAX_BASE64_LENGTH = 11_000_000;

export interface GenerateRequestBody {
  photo?: unknown;
  styleId?: unknown;
}

export interface GenerateSuccess {
  image: string; // data URL
}

/**
 * Pure request-handling logic, deliberately separated from the Vercel
 * handler so it can be unit-tested without spinning up a server, and so
 * validation rules are exercised the same way in tests as in production.
 */
export async function handleGenerateRequest(
  rawBody: unknown,
  apiKey: string | undefined,
  fetchImpl?: GenerateGroomedImageInput['fetchImpl']
): Promise<GenerateSuccess> {
  if (!apiKey) {
    throw new ApiError(
      'missing-api-key',
      500,
      'Serwer nie ma skonfigurowanego GEMINI_API_KEY. Ustaw tę zmienną środowiskową w konfiguracji backendu.'
    );
  }

  const body = (typeof rawBody === 'object' && rawBody !== null ? rawBody : {}) as GenerateRequestBody;

  const photo = body.photo;
  const styleId = body.styleId;

  if (typeof photo !== 'string' || photo.length === 0) {
    throw new ApiError('invalid-request', 400, 'Brak zdjęcia psa w żądaniu.');
  }

  if (typeof styleId !== 'string' || !isValidStyleId(styleId)) {
    throw new ApiError('invalid-request', 400, 'Nieznany lub brakujący styl groomingu.');
  }

  const match = /^data:([a-zA-Z0-9/+.-]+);base64,(.*)$/s.exec(photo);
  if (!match) {
    throw new ApiError(
      'invalid-request',
      400,
      'Zdjęcie musi zostać przesłane jako poprawny data URL (base64).'
    );
  }

  const [, mimeType, base64Payload] = match;

  if (!ACCEPTED_MIME_TYPES.has(mimeType)) {
    throw new ApiError(
      'invalid-request',
      400,
      `Nieobsługiwany format zdjęcia: ${mimeType}. Użyj JPG, PNG lub WebP.`
    );
  }

  if (base64Payload.length === 0) {
    throw new ApiError('invalid-request', 400, 'Przesłane zdjęcie jest puste.');
  }

  if (base64Payload.length > MAX_BASE64_LENGTH) {
    throw new ApiError(
      'invalid-request',
      413,
      'Zdjęcie jest za duże. Spróbuj mniejszego pliku (do ok. 8MB).'
    );
  }

  const result = await generateGroomedImage({
    base64Image: base64Payload,
    mimeType,
    styleId,
    apiKey,
    fetchImpl,
  });

  return { image: `data:${result.mimeType};base64,${result.base64Image}` };
}

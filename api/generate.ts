import { ApiError } from './errors';
import { handleGenerateRequest } from './handleGenerateRequest';
import { VercelRequest, VercelResponse } from './types';

/**
 * POST /api/generate
 * Body: { photo: "data:image/jpeg;base64,...", styleId: "teddy" | ... }
 * Response 200: { image: "data:image/png;base64,..." }
 * Response 4xx/5xx: { error: string, code: string }
 *
 * This is the only place a Gemini API key is used. It is read from the
 * `GEMINI_API_KEY` environment variable, configured in the hosting
 * provider's dashboard (see .env.example) — it is never present in any
 * file shipped to the browser.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || '*';
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Metoda niedozwolona. Użyj POST.', code: 'method-not-allowed' });
    return;
  }

  try {
    const result = await handleGenerateRequest(req.body, process.env.GEMINI_API_KEY);
    res.status(200).json(result);
  } catch (err) {
    if (err instanceof ApiError) {
      res.status(err.httpStatus).json({ error: err.message, code: err.code });
      return;
    }
    // eslint-disable-next-line no-console
    console.error('Unexpected error in /api/generate:', err);
    res.status(500).json({
      error: 'Wystąpił nieoczekiwany błąd serwera. Spróbuj ponownie.',
      code: 'internal-error',
    });
  }
}

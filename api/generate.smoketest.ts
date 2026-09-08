// Lightweight smoke test for the backend request-handling logic.
// Run with: npx tsx api/generate.smoketest.ts
// No test framework / network required — fetch is mocked below.
// This exercises handleGenerateRequest exactly as generate.ts calls it.

import assert from 'node:assert/strict';
import { handleGenerateRequest } from './handleGenerateRequest';
import { ApiError } from './errors';

const VALID_PHOTO = 'data:image/jpeg;base64,dGVzdC1pbWFnZS1ieXRlcw==';
let passed = 0;
let failed = 0;

async function check(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    passed++;
    console.log(`  ok  - ${name}`);
  } catch (err) {
    failed++;
    console.log(`FAIL  - ${name}`);
    console.log(`        ${(err as Error).message}`);
  }
}

async function expectApiError(
  promise: Promise<unknown>,
  code: string,
  httpStatus: number
) {
  try {
    await promise;
  } catch (err) {
    assert.ok(err instanceof ApiError, `expected ApiError, got ${err}`);
    assert.equal((err as ApiError).code, code, `expected code ${code}, got ${(err as ApiError).code}`);
    assert.equal(
      (err as ApiError).httpStatus,
      httpStatus,
      `expected httpStatus ${httpStatus}, got ${(err as ApiError).httpStatus}`
    );
    return;
  }
  throw new Error(`expected ApiError(${code}) to be thrown, but call succeeded`);
}

function fakeGeminiSuccessFetch(): typeof fetch {
  return (async () =>
    new Response(
      JSON.stringify({
        candidates: [
          {
            content: {
              parts: [{ inlineData: { mimeType: 'image/png', data: 'ZmFrZS1yZXN1bHQtYnl0ZXM=' } }],
            },
          },
        ],
      }),
      { status: 200 }
    )) as unknown as typeof fetch;
}

function fakeGeminiRateLimitFetch(): typeof fetch {
  return (async () => new Response('rate limited', { status: 429 })) as unknown as typeof fetch;
}

function fakeGeminiNoImageFetch(): typeof fetch {
  return (async () =>
    new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: 'no image' }] } }] }), {
      status: 200,
    })) as unknown as typeof fetch;
}

function fakeGeminiAbortFetch(): typeof fetch {
  return (async () => {
    const err = new Error('aborted');
    err.name = 'AbortError';
    throw err;
  }) as unknown as typeof fetch;
}

async function main() {
  console.log('Backend smoke test (api/handleGenerateRequest.ts)\n');

  await check('missing API key -> 500 missing-api-key', () =>
    expectApiError(handleGenerateRequest({ photo: VALID_PHOTO, styleId: 'teddy' }, undefined), 'missing-api-key', 500)
  );

  await check('missing photo -> 400 invalid-request', () =>
    expectApiError(handleGenerateRequest({ styleId: 'teddy' }, 'fake-key'), 'invalid-request', 400)
  );

  await check('invalid styleId -> 400 invalid-request', () =>
    expectApiError(handleGenerateRequest({ photo: VALID_PHOTO, styleId: 'not-a-style' }, 'fake-key'), 'invalid-request', 400)
  );

  await check('malformed data URL -> 400 invalid-request', () =>
    expectApiError(handleGenerateRequest({ photo: 'not-a-data-url', styleId: 'teddy' }, 'fake-key'), 'invalid-request', 400)
  );

  await check('unsupported mime type -> 400 invalid-request', () =>
    expectApiError(
      handleGenerateRequest({ photo: 'data:image/gif;base64,AAAA', styleId: 'teddy' }, 'fake-key'),
      'invalid-request',
      400
    )
  );

  await check('valid request -> resolves with image data URL', async () => {
    const result = await handleGenerateRequest(
      { photo: VALID_PHOTO, styleId: 'fluffy' },
      'fake-key',
      fakeGeminiSuccessFetch()
    );
    assert.equal(result.image, 'data:image/png;base64,ZmFrZS1yZXN1bHQtYnl0ZXM=');
  });

  await check('upstream 429 -> 429 rate-limited', () =>
    expectApiError(
      handleGenerateRequest({ photo: VALID_PHOTO, styleId: 'short' }, 'fake-key', fakeGeminiRateLimitFetch()),
      'rate-limited',
      429
    )
  );

  await check('upstream returns no image -> 502 no-image-returned', () =>
    expectApiError(
      handleGenerateRequest({ photo: VALID_PHOTO, styleId: 'clean' }, 'fake-key', fakeGeminiNoImageFetch()),
      'no-image-returned',
      502
    )
  );

  await check('upstream abort/timeout -> 504 timeout', () =>
    expectApiError(
      handleGenerateRequest({ photo: VALID_PHOTO, styleId: 'clean' }, 'fake-key', fakeGeminiAbortFetch()),
      'timeout',
      504
    )
  );

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) {
    process.exitCode = 1;
  }
}

main();

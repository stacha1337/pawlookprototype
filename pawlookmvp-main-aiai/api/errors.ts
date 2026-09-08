export type ApiErrorCode =
  | 'invalid-request'
  | 'missing-api-key'
  | 'timeout'
  | 'rate-limited'
  | 'upstream-error'
  | 'no-image-returned';

/**
 * Error type used across the backend. `httpStatus` is what we send back
 * to the frontend; `code` lets the frontend show a precise message.
 */
export class ApiError extends Error {
  code: ApiErrorCode;
  httpStatus: number;

  constructor(code: ApiErrorCode, httpStatus: number, message: string) {
    super(message);
    this.code = code;
    this.httpStatus = httpStatus;
    this.name = 'ApiError';
  }
}

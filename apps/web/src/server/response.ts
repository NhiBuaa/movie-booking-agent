import type {
  ApiResponse,
  ApiErrorResponse,
} from '@platform/contracts';

/**
 * Standard server response helper returning standardized ApiResponse<T>.
 * Uses native Web Standard Response.json() supported by Next.js and Node.js.
 */
export function jsonSuccess<T>(
  data: T,
  status = 200,
  message?: string
): Response {
  const body: ApiResponse<T> = {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
  };

  return Response.json(body, { status });
}

/**
 * Standard server response helper returning standardized ApiErrorResponse.
 * Uses native Web Standard Response.json() supported by Next.js and Node.js.
 */
export function jsonError(
  code: string,
  message: string,
  status = 400,
  details?: unknown
): Response {
  const body: ApiErrorResponse = {
    success: false,
    error: {
      code,
      message,
      details,
    },
    timestamp: new Date().toISOString(),
  };

  return Response.json(body, { status });
}

import { z } from 'zod';

export type HttpErrorKind = 'http' | 'contract' | 'network';

export class HttpError extends Error {
  readonly kind: HttpErrorKind;
  readonly status: number | undefined;

  constructor(message: string, kind: HttpErrorKind, status?: number) {
    super(message);
    this.name = 'HttpError';
    this.kind = kind;
    this.status = status;
  }
}

const REQUEST_TIMEOUT_MS = 10_000;

function describe(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export async function getJson<T>(
  url: string,
  schema: z.ZodType<T>,
  signal?: AbortSignal,
): Promise<T> {
  const timeout = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
  const combined = AbortSignal.any(signal ? [signal, timeout] : [timeout]);

  let response: Response;
  try {
    response = await fetch(url, { signal: combined });
  } catch (error) {
    throw new HttpError(`Request to ${url} failed: ${describe(error)}`, 'network');
  }

  if (!response.ok) {
    throw new HttpError(`HTTP ${response.status} for ${url}`, 'http', response.status);
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch (error) {
    throw new HttpError(`Invalid JSON from ${url}: ${describe(error)}`, 'contract');
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    throw new HttpError(
      `Unexpected response from ${url}:\n${z.prettifyError(result.error)}`,
      'contract',
    );
  }

  return result.data;
}

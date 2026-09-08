import { afterEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { getJson, HttpError } from './getJson';

const URL = 'https://example.test/data';
const schema = z.object({ ok: z.literal(true) });

function stubFetch(implementation: () => Promise<Response>) {
  const fetchMock = vi.fn<typeof fetch>(implementation);
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status });
}

async function rejection(promise: Promise<unknown>): Promise<HttpError> {
  try {
    await promise;
  } catch (error) {
    if (error instanceof HttpError) return error;
    throw new Error(`Expected HttpError, got ${String(error)}`, { cause: error });
  }
  throw new Error('Expected promise to reject');
}

describe('getJson', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('resolves with the parsed body when the envelope matches the schema', async () => {
    stubFetch(() => Promise.resolve(jsonResponse({ ok: true, extra: 'ignored' })));

    await expect(getJson(URL, schema)).resolves.toEqual({ ok: true });
  });

  it('throws kind "http" with the status when the response is not ok', async () => {
    stubFetch(() => Promise.resolve(jsonResponse({ ok: true }, 500)));

    const error = await rejection(getJson(URL, schema));

    expect(error.kind).toBe('http');
    expect(error.status).toBe(500);
  });

  it('throws kind "contract" when the envelope does not match the schema', async () => {
    stubFetch(() => Promise.resolve(jsonResponse({ nope: 1 })));

    const error = await rejection(getJson(URL, schema));

    expect(error.kind).toBe('contract');
    expect(error.message).toContain(URL);
  });

  it('throws kind "contract" when the body is not JSON', async () => {
    stubFetch(() => Promise.resolve(new Response('not json', { status: 200 })));

    const error = await rejection(getJson(URL, schema));

    expect(error.kind).toBe('contract');
  });

  it('throws kind "network" when fetch rejects', async () => {
    stubFetch(() => Promise.reject(new TypeError('Failed to fetch')));

    const error = await rejection(getJson(URL, schema));

    expect(error.kind).toBe('network');
    expect(error.message).toContain('Failed to fetch');
  });

  it('passes an AbortSignal to fetch', async () => {
    const fetchMock = stubFetch(() => Promise.resolve(jsonResponse({ ok: true })));

    await getJson(URL, schema, new AbortController().signal);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const call = fetchMock.mock.calls[0];
    expect(call?.[0]).toBe(URL);
    expect(call?.[1]?.signal).toBeInstanceOf(AbortSignal);
  });
});

import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { parseItems } from './parseItems';
import { reportContractViolation } from './reportContractViolation';

vi.mock('./reportContractViolation', () => ({ reportContractViolation: vi.fn() }));

const schema = z.object({ id: z.string() });
const reporter = vi.mocked(reportContractViolation);

describe('parseItems', () => {
  it('keeps every item when all are valid', () => {
    const items = [{ id: 'a' }, { id: 'b' }];

    expect(parseItems(items, schema, 'test')).toEqual(items);
    expect(reporter).not.toHaveBeenCalled();
  });

  it('drops invalid items, keeps order and reports each one once', () => {
    const items = [{ id: 'a' }, { id: 2 }, { id: 'c' }];

    expect(parseItems(items, schema, 'leagues')).toEqual([{ id: 'a' }, { id: 'c' }]);
    expect(reporter).toHaveBeenCalledTimes(1);
    const violation = reporter.mock.calls[0]?.[0];
    expect(violation).toMatchObject({ context: 'leagues', index: 1 });
    expect(violation?.issues[0]?.code).toBe('invalid_type');
  });

  it('returns an empty list for an empty input', () => {
    expect(parseItems([], schema, 'test')).toEqual([]);
    expect(reporter).not.toHaveBeenCalled();
  });
});

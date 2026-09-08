import { z } from 'zod';
import { reportContractViolation } from './reportContractViolation';

// Validates a list item by item. Valid items are kept, invalid ones are dropped
// and reported, so one bad record never takes the whole list down.
export function parseItems<T>(
  items: readonly unknown[],
  schema: z.ZodType<T>,
  context: string,
): T[] {
  const valid: T[] = [];

  items.forEach((item, index) => {
    const result = schema.safeParse(item);
    if (result.success) {
      valid.push(result.data);
    } else {
      reportContractViolation({ context, index, issues: result.error.issues });
    }
  });

  return valid;
}

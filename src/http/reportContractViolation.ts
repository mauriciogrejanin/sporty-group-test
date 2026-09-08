import { z } from 'zod';

export interface ContractViolation {
  context: string;
  index: number;
  issues: z.core.$ZodIssue[];
}

// Single place to report items dropped by parseItems. Today it warns on the
// console; in production this is where Sentry or Datadog would be plugged in.
export function reportContractViolation({ context, index, issues }: ContractViolation): void {
  console.warn(
    `[contract] ${context}: item ${index} dropped\n${z.prettifyError(new z.ZodError(issues))}`,
  );
}

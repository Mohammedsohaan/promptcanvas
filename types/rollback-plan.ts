export interface RollbackStep {
  id: string;
  action: string;
  order: number;
}

export interface RollbackPlan {
  planId: string;
  executionId: string;
  rollbackOrder: RollbackStep[];
  rollbackDependencies: string[];
  rollbackValidation: string[];
  expectedState: Record<string, unknown>;
  estimatedDurationMs: number;
  failureReason: string;
  timestamp: string;
}

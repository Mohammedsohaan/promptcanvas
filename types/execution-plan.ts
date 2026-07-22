import { ProductionAction } from './production-action';

export interface ExecutionStep {
  id: string;
  action: ProductionAction;
  order: number;
  dependencies: string[];
  preconditions: string[];
  postconditions: string[];
  timeoutMs: number;
  retryPolicy: string;
  expectedVerification: string;
  rollbackMapping: string;
}

export interface ExecutionPlan {
  planId: string;
  authorizationId: string;
  steps: ExecutionStep[];
  estimatedDurationMs: number;
  timestamp: string;
}

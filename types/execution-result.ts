import { ExecutionStatus } from './execution-status';

export interface ExecutionResult {
  executionId: string;
  planId: string;
  status: ExecutionStatus;
  startTime: string;
  endTime: string;
  logs: string[];
  error?: string;
}

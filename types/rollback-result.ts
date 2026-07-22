export interface RollbackResult {
  rollbackId: string;
  planId: string;
  success: boolean;
  startTime: string;
  endTime: string;
  error?: string;
}

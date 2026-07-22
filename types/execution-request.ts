export interface ExecutionRequest {
  id: string;
  actionId: string;
  targetId: string;
  requestedBy: string;
  timestamp: string;
  contextParams: Record<string, unknown>;
}

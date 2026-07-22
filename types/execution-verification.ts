export interface ExecutionVerification {
  verificationId: string;
  executionId: string;
  isVerified: boolean;
  desiredState: Record<string, unknown>;
  observedState: Record<string, unknown>;
  healthStatus: "Healthy" | "Unhealthy" | "Degraded" | "Unknown";
  availability: string;
  latencyMs: number;
  errorRate: number;
  replicaCount: number;
  deploymentRevision: string;
  executionDurationMs: number;
  failureReason?: string;
  timestamp: string;
}

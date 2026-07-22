export interface PipelineStage {
  name: string;
  status: "pending" | "running" | "success" | "failed" | "skipped" | "cancelled";
  duration: number; // in milliseconds
  retryCount: number;
  parallel: boolean;
  logs: string;
  failureReason?: string;
}

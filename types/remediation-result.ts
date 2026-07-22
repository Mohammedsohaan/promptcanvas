export interface RemediationResult {
  actionId: string;
  status: "Success" | "Failed" | "Skipped" | "DryRunSuccess" | "DryRunFailed";
  logs: string[];
  durationMs: number;
  error?: string;
}

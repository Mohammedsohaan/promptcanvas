export interface AlertModel {
  id: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  source: string;
  rule: string;
  triggerMetric: string;
  status: "firing" | "resolved";
  acknowledged: boolean;
  timestamp: string;
}

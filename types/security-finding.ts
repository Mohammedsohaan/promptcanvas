export interface SecurityFinding {
  id: string;
  type: "secret" | "vulnerability" | "misconfiguration" | "policy_violation" | "threat";
  severity: "critical" | "high" | "medium" | "low" | "info";
  title: string;
  description: string;
  location: string;
  remediation?: string;
  detectedAt: string;
}

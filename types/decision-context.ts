export interface DecisionContext {
  overallHealth: "Healthy" | "Degraded" | "Critical";
  overallRisk: "Low" | "Medium" | "High" | "Critical";
  deploymentReadiness: "Ready" | "NotReady" | "Blocked";
  costReadiness: "Optimized" | "OverProvisioned" | "ReviewNeeded";
  securityReadiness: "Secure" | "Vulnerable" | "CriticalThreats";
  operationalReadiness: "Stable" | "Unstable" | "IncidentActive";
  timestamp: string;
}

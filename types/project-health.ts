export interface ProjectHealth {
  overallHealth: "Excellent" | "Good" | "NeedsAttention" | "AtRisk";
  deliveryConfidence: number;
  engineeringVelocity: string;
  operationalStability: string;
  riskLevel: "Low" | "Medium" | "High";
  deploymentReadiness: string;
  serviceReliability: string;
  timestamp: string;
}

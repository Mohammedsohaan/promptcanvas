export interface SecurityRisk {
  overallRiskScore: number; // 0-100
  businessRisk: "critical" | "high" | "medium" | "low";
  technicalRisk: "critical" | "high" | "medium" | "low";
  deploymentRisk: "critical" | "high" | "medium" | "low";
  riskFactors: string[];
}

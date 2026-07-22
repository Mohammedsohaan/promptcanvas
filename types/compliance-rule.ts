export interface ComplianceRule {
  id: string;
  category: "Security" | "Infrastructure" | "Repository" | "Pipeline" | "Runtime" | "FinOps" | "Organizational";
  name: string;
  description: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  remediationGuidance: string;
}

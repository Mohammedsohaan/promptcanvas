import { RemediationAction } from './remediation-action';

export interface RemediationPlan {
  planId: string;
  actions: RemediationAction[];
  rollbackSteps: RemediationAction[];
  totalEstimatedDurationMs: number;
  overallRiskLevel: "Low" | "Medium" | "High" | "Critical";
  approvalRequirement: "None" | "Required" | "ManualReview";
  executionOrder: string[]; // array of action IDs
}

export interface RemediationAction {
  id: string;
  type: string; // e.g., "RestartService", "RightsizeVM"
  target: string;
  description: string;
  estimatedDurationMs: number;
  riskLevel: "Low" | "Medium" | "High" | "Critical";
  approvalRequired: boolean;
  rollbackActionId?: string;
}

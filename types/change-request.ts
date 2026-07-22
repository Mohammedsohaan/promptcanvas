export interface ChangeRequest {
  id: string;
  title: string;
  category: "Standard" | "Normal" | "Emergency";
  riskClassification: "Low" | "Medium" | "High" | "Critical";
  rollbackRequired: boolean;
  businessImpact: string;
  maintenanceWindowId?: string;
  submittedAt: string;
}

export interface DeploymentModel {
  target: string;
  status: "pending" | "in_progress" | "success" | "failed" | "rolled_back";
  strategy: "Rolling" | "BlueGreen" | "Canary" | "Shadow" | "Recreate" | "Unknown";
  rollbackAvailable: boolean;
  approvalStatus: "pending" | "approved" | "rejected" | "not_required";
  deploymentTime?: string;
  rollbackTime?: string;
}

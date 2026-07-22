export interface ApprovalStage {
  stageId: string;
  approverType: "Technical" | "Security" | "Operations" | "Business" | "CAB";
  status: "Pending" | "Approved" | "Rejected" | "Skipped" | "Timeout" | "Expired";
  required: boolean;
  isConditional: boolean;
}

export interface ApprovalWorkflow {
  workflowId: string;
  type: "Sequential" | "Parallel";
  stages: ApprovalStage[];
  overallStatus: "Pending" | "Approved" | "Rejected" | "Escalated" | "ManualOverride" | "Expired";
  expirationTime?: string;
}

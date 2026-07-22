export interface ApprovalRequest {
  requestId: string;
  planId: string;
  state: "Pending" | "Approved" | "Rejected" | "Expired" | "ManualOverride";
  requestedAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  comments?: string;
}

export interface ExecutionAuthorization {
  authorizationId: string;
  decisionSource: string;
  policyVersion: string;
  governanceVersion: string;
  approvalChain: string[];
  issuedTime: string;
  expirationTime: string;
  requestedBy: string;
  authorizedBy: string;
  reason: string;
  status: "Authorized" | "Denied" | "Expired" | "RequiresApproval";
}

export interface AuditRecord {
  id: string;
  correlationId: string;
  timestamp: string;
  actor: string;
  action: string;
  decisionSource: string;
  policyVersion: string;
  ruleVersion: string;
  previousState: Record<string, unknown> | null;
  currentState: Record<string, unknown>;
  outcome: string;
}

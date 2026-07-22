export interface RemediationRule {
  ruleId: string;
  priority: number;
  dependencies: string[];
  conditions: Record<string, unknown>;
  actionType: string;
  actionPayload: Record<string, unknown>;
}

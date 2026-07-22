import { DecisionContext } from './decision-context';
import { PolicyDecision } from './policy-decision';
import { RemediationPlan } from './remediation-plan';
import { ApprovalRequest } from './approval-request';
import { RemediationResult } from './remediation-result';

export interface RemediationContext {
  id: string;
  decision: DecisionContext;
  policy: PolicyDecision;
  plan: RemediationPlan;
  rollbackPlan: RemediationPlan;
  approvalState: ApprovalRequest | null;
  executionResults: RemediationResult[];
  timestamp: string;
}

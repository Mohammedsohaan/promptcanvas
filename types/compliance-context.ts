import { DecisionContext } from './decision-context';
import { PolicyDecision } from './policy-decision';
import { SecurityContext } from './security-context';
import { FinOpsContext } from './finops-context';
import { RemediationContext } from './remediation-context';
import { ComplianceResult } from './compliance-result';
import { GovernanceDecision } from './governance-decision';
import { AuditRecord } from './audit-record';
import { ComplianceScore } from './compliance-score';
import { ApprovalWorkflow } from './approval-workflow';

export interface ComplianceContext {
  id: string;
  decision: DecisionContext;
  policy: PolicyDecision;
  security: SecurityContext;
  finops: FinOpsContext;
  remediation: RemediationContext;
  complianceResult: ComplianceResult;
  governanceDecision: GovernanceDecision;
  approvalWorkflow: ApprovalWorkflow;
  auditRecords: AuditRecord[];
  score: ComplianceScore;
  timestamp: string;
}

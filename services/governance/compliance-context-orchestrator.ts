import { DecisionContext } from '../../types/decision-context';
import { PolicyDecision } from '../../types/policy-decision';
import { SecurityContext } from '../../types/security-context';
import { FinOpsContext } from '../../types/finops-context';
import { RemediationContext } from '../../types/remediation-context';
import { ComplianceResult } from '../../types/compliance-result';
import { GovernanceDecision } from '../../types/governance-decision';
import { ApprovalWorkflow } from '../../types/approval-workflow';
import { AuditRecord } from '../../types/audit-record';
import { ComplianceScore } from '../../types/compliance-score';
import { ComplianceContext } from '../../types/compliance-context';
import { PlatformEventBus } from '../core/platform-event-bus';

export class ComplianceContextOrchestrator {
  private eventBus = PlatformEventBus.getInstance();

  public assembleContext(
    decision: DecisionContext,
    policy: PolicyDecision,
    security: SecurityContext,
    finops: FinOpsContext,
    remediation: RemediationContext,
    complianceResult: ComplianceResult,
    governanceDecision: GovernanceDecision,
    approvalWorkflow: ApprovalWorkflow,
    auditRecords: AuditRecord[],
    score: ComplianceScore
  ): ComplianceContext {
    const context: ComplianceContext = {
      id: `comp-ctx-${Date.now()}`,
      decision,
      policy,
      security,
      finops,
      remediation,
      complianceResult,
      governanceDecision,
      approvalWorkflow,
      auditRecords,
      score,
      timestamp: new Date().toISOString()
    };
    
    this.eventBus.publish("ComplianceContextCreated", context);
    return context;
  }
}

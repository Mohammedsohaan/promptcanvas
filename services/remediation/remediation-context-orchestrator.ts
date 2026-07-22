import { DecisionContext } from '../../types/decision-context';
import { PolicyDecision } from '../../types/policy-decision';
import { RemediationPlan } from '../../types/remediation-plan';
import { ApprovalRequest } from '../../types/approval-request';
import { RemediationResult } from '../../types/remediation-result';
import { RemediationContext } from '../../types/remediation-context';
import { PlatformEventBus } from '../core/platform-event-bus';

export class RemediationContextOrchestrator {
  private eventBus = PlatformEventBus.getInstance();

  public assembleContext(
    decision: DecisionContext,
    policy: PolicyDecision,
    plan: RemediationPlan,
    rollbackPlan: RemediationPlan,
    approvalState: ApprovalRequest | null,
    executionResults: RemediationResult[]
  ): RemediationContext {
    const context: RemediationContext = {
      id: `rem-ctx-${Date.now()}`,
      decision,
      policy,
      plan,
      rollbackPlan,
      approvalState,
      executionResults,
      timestamp: new Date().toISOString()
    };
    
    this.eventBus.publish("RemediationContextCreated", context);
    return context;
  }
}

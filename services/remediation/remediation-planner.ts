import { RemediationAction } from '../../types/remediation-action';
import { RemediationPlan } from '../../types/remediation-plan';
import { PlatformEventBus } from '../core/platform-event-bus';

export class RemediationPlanner {
  private eventBus = PlatformEventBus.getInstance();

  public generatePlan(actions: RemediationAction[]): RemediationPlan {
    const plan: RemediationPlan = {
      planId: `plan-${Date.now()}`,
      actions,
      rollbackSteps: [], // Populated by RollbackPlanner
      totalEstimatedDurationMs: actions.reduce((acc, act) => acc + act.estimatedDurationMs, 0),
      overallRiskLevel: actions.some(a => a.riskLevel === "High") ? "High" : "Low",
      approvalRequirement: actions.some(a => a.approvalRequired) ? "Required" : "None",
      executionOrder: actions.map(a => a.id)
    };
    
    this.eventBus.publish("RemediationPlanned", plan);
    return plan;
  }
}

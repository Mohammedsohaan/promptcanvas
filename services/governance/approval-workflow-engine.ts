import { ApprovalWorkflow, ApprovalStage } from '../../types/approval-workflow';
import { GovernanceDecision } from '../../types/governance-decision';
import { PlatformEventBus } from '../core/platform-event-bus';

export class ApprovalWorkflowEngine {
  private eventBus = PlatformEventBus.getInstance();

  public evaluateWorkflow(decision: GovernanceDecision): ApprovalWorkflow {
    const workflow: ApprovalWorkflow = {
      workflowId: `wf-${Date.now()}`,
      type: "Sequential",
      stages: [
        {
          stageId: "stg-1",
          approverType: "Technical",
          status: decision.status === "Allowed" ? "Approved" : "Pending",
          required: true,
          isConditional: false
        }
      ],
      overallStatus: decision.status === "Allowed" ? "Approved" : "Pending"
    };
    
    this.eventBus.publish("ApprovalWorkflowEvaluated", workflow);
    return workflow;
  }
}

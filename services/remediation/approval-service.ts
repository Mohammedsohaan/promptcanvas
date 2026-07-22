import { ApprovalRequest } from '../../types/approval-request';
import { RemediationPlan } from '../../types/remediation-plan';
import { PlatformEventBus } from '../core/platform-event-bus';

export class ApprovalService {
  private eventBus = PlatformEventBus.getInstance();

  public requestApproval(plan: RemediationPlan): ApprovalRequest {
    const request: ApprovalRequest = {
      requestId: `appr-${Date.now()}`,
      planId: plan.planId,
      state: plan.approvalRequirement === "None" ? "Approved" : "Pending",
      requestedAt: new Date().toISOString()
    };
    
    this.eventBus.publish("ApprovalRequested", request);
    
    if (request.state === "Approved") {
      this.eventBus.publish("ApprovalGranted", request);
    }
    
    return request;
  }
}

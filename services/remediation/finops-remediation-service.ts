import { RemediationAction } from '../../types/remediation-action';

export class FinOpsRemediationService {
  public generateRightsizeAction(resourceId: string): RemediationAction {
    return {
      id: `act-fin-${Date.now()}`,
      type: 'RightsizeVM',
      target: resourceId,
      description: `Rightsize VM ${resourceId} to smaller instance type`,
      estimatedDurationMs: 120000,
      riskLevel: "Medium",
      approvalRequired: true
    };
  }
}

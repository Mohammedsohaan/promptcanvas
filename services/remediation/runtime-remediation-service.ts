import { RemediationAction } from '../../types/remediation-action';

export class RuntimeRemediationService {
  public generateRestartAction(serviceId: string): RemediationAction {
    return {
      id: `act-rt-${Date.now()}`,
      type: 'RestartService',
      target: serviceId,
      description: `Restart service ${serviceId}`,
      estimatedDurationMs: 30000,
      riskLevel: "Medium",
      approvalRequired: true
    };
  }
}

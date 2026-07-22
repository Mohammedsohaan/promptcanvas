import { RemediationAction } from '../../types/remediation-action';

export class PipelineRemediationService {
  public generateRetryAction(pipelineId: string): RemediationAction {
    return {
      id: `act-pipe-${Date.now()}`,
      type: 'RetryBuild',
      target: pipelineId,
      description: `Retry build for pipeline ${pipelineId}`,
      estimatedDurationMs: 180000,
      riskLevel: "Low",
      approvalRequired: false
    };
  }
}

import { RemediationPlan } from '../../types/remediation-plan';
import { RemediationResult } from '../../types/remediation-result';
import { PlatformEventBus } from '../core/platform-event-bus';

export interface IRemediationExecutor {
  execute(plan: RemediationPlan): Promise<RemediationResult[]>;
}

export class DryRunExecutor implements IRemediationExecutor {
  private eventBus = PlatformEventBus.getInstance();

  public async execute(plan: RemediationPlan): Promise<RemediationResult[]> {
    const results: RemediationResult[] = plan.actions.map(action => ({
      actionId: action.id,
      status: "DryRunSuccess",
      logs: [`[DRY RUN] Simulated execution of action ${action.id} of type ${action.type}`],
      durationMs: Math.random() * 100
    }));
    
    this.eventBus.publish("DryRunCompleted", results);
    return results;
  }
}

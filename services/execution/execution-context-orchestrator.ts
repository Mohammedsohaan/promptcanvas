import { ExecutionContext } from '../../types/execution-context';
import { PlatformEventBus } from '../core/platform-event-bus';

export class ExecutionContextOrchestrator {
  private eventBus = PlatformEventBus.getInstance();

  public assembleContext(
    engineeringManagerContext: any,
    authorization: any,
    plan: any,
    result: any,
    verification: any,
    rollbackPlan: any,
    rollbackResult: any,
    auditRecords: any[]
  ): ExecutionContext {
    const context: ExecutionContext = {
      id: `exec-ctx-${Date.now()}`,
      engineeringManagerContext,
      authorization,
      plan,
      result,
      verification,
      rollbackPlan,
      rollbackResult,
      auditRecords,
      timestamp: new Date().toISOString()
    };
    
    this.eventBus.publish("ExecutionContextCreated", context);
    return context;
  }
}

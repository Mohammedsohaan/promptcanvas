import { AuditRecord } from '../../types/audit-record';
import { PlatformEventBus } from '../core/platform-event-bus';

export class AuditEngine {
  private eventBus = PlatformEventBus.getInstance();

  public recordAudit(actor: string, action: string, previousState: any, currentState: any, outcome: string): AuditRecord {
    const record: AuditRecord = {
      id: `audit-${Date.now()}`,
      correlationId: `corr-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor,
      action,
      decisionSource: "DeterministicEngine",
      policyVersion: "1.0.0",
      ruleVersion: "1.0.0",
      previousState,
      currentState,
      outcome
    };
    
    // Making audit record immutable
    Object.freeze(record);
    
    this.eventBus.publish("AuditRecorded", record);
    return record;
  }
}

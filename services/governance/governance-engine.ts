import { GovernanceDecision } from '../../types/governance-decision';
import { ComplianceResult } from '../../types/compliance-result';
import { PlatformEventBus } from '../core/platform-event-bus';

export class GovernanceEngine {
  private eventBus = PlatformEventBus.getInstance();

  public evaluateGovernance(compliance: ComplianceResult): GovernanceDecision {
    const decision: GovernanceDecision = {
      status: compliance.status === "Compliant" ? "Allowed" : "Blocked",
      reason: compliance.status === "Compliant" ? "Passed Governance" : "Compliance Violations",
      evaluatedPolicies: ["Deployment", "Maintenance"],
      timestamp: new Date().toISOString()
    };
    
    this.eventBus.publish("GovernanceEvaluated", decision);
    return decision;
  }
}

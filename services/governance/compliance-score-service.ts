import { ComplianceScore } from '../../types/compliance-score';
import { ComplianceResult } from '../../types/compliance-result';
import { PlatformEventBus } from '../core/platform-event-bus';

export class ComplianceScoreService {
  private eventBus = PlatformEventBus.getInstance();

  public calculateScore(result: ComplianceResult): ComplianceScore {
    const score: ComplianceScore = {
      overallScore: result.status === "Compliant" ? 100 : 50,
      policyCoverage: 100,
      controlCoverage: 100,
      auditCompleteness: 100,
      approvalCoverage: 100,
      operationalReadiness: 100,
      securityReadiness: 100,
      governanceReadiness: 100
    };
    
    this.eventBus.publish("ComplianceScoreComputed", score);
    return score;
  }
}

import { RuntimeContext } from "../../types/runtime-context";
import { RuntimeThreatResult } from "../../types/security-context";
import { PlatformEventBus } from "../core/platform-event-bus";

/**
 * RuntimeThreatAnalysisService reuses the existing RuntimeContext
 * (health, incidents, logs, traces, metrics) to detect runtime threats
 * without duplicating any runtime analysis logic.
 */
export class RuntimeThreatAnalysisService {
  public analyze(runtimeContext?: RuntimeContext): RuntimeThreatResult {
    if (!runtimeContext) {
      const result: RuntimeThreatResult = { suspiciousActivity: false, privilegeEscalation: false, unexpectedNetworkCalls: false, maliciousProcessDetection: false, persistenceIndicators: false, threatLevel: "none" };
      PlatformEventBus.getInstance().publish("RuntimeThreatsAnalyzed", { result });
      return result;
    }

    const hasActiveIncidents = runtimeContext.incidentAnalysis.severity !== "none";
    const highErrorRate = runtimeContext.performanceAnalysis.errorRate > 5;
    const dependencyFailures = runtimeContext.dependencyAnalysis.failurePropagation;

    let threatLevel: RuntimeThreatResult["threatLevel"] = "none";
    if (hasActiveIncidents && highErrorRate) threatLevel = "high";
    else if (hasActiveIncidents || highErrorRate) threatLevel = "medium";
    else if (dependencyFailures) threatLevel = "low";

    const result: RuntimeThreatResult = {
      suspiciousActivity: highErrorRate,
      privilegeEscalation: false,
      unexpectedNetworkCalls: dependencyFailures,
      maliciousProcessDetection: false,
      persistenceIndicators: false,
      threatLevel
    };

    PlatformEventBus.getInstance().publish("RuntimeThreatsAnalyzed", { result });
    return result;
  }
}

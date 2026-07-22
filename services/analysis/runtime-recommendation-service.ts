import { RuntimeRecommendation } from "../../types/runtime-recommendation";
import { 
  HealthAnalysis, 
  IncidentAnalysis, 
  PerformanceAnalysis, 
  CapacityAnalysis, 
  DependencyAnalysis, 
  ObservabilityAnalysis 
} from "../../types/runtime-context";
import { PlatformEventBus } from "../core/platform-event-bus";

export class RuntimeRecommendationService {
  public generate(
    health: HealthAnalysis,
    incident: IncidentAnalysis,
    performance: PerformanceAnalysis,
    capacity: CapacityAnalysis,
    dependency: DependencyAnalysis,
    observability: ObservabilityAnalysis
  ): RuntimeRecommendation {
    
    let severity: RuntimeRecommendation["severity"] = "info";
    const nextActions: string[] = [];
    
    if (incident.severity === "SEV-1" || incident.severity === "SEV-2") {
      severity = "critical";
      nextActions.push("Immediately declare incident and page on-call.");
      nextActions.push("Investigate recent deployments for rollback.");
    } else if (health.availability < 99.0 || capacity.futureCapacityRisk === "high") {
      severity = "high";
      nextActions.push("Review autoscaling policies.");
    } else if (performance.errorRate > 5) {
      severity = "medium";
      nextActions.push("Investigate error rate spike.");
    }

    const recommendation: RuntimeRecommendation = {
      severity,
      recommendation: severity === "critical" ? "Mitigate active incidents immediately." : "System operating normally.",
      nextActions,
      rollbackRecommendation: incident.severity === "SEV-1" && incident.deploymentCorrelation,
      scaleRecommendation: capacity.autoscalingRecommendation,
      incidentPriority: incident.severity === "none" ? "none" : incident.severity === "SEV-1" ? "P1" : "P2"
    };

    PlatformEventBus.getInstance().publish("RuntimeRecommendationGenerated", { recommendation });
    return recommendation;
  }
}

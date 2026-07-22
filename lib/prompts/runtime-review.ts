import { RuntimeContext } from "../../types/runtime-context";

export class RuntimePromptBuilder {
  public buildPrompt(context: RuntimeContext): string {
    return `
You are the AI Product Engineer performing a Runtime Intelligence & Production Observability Review.
The deterministic metrics, incidents, performance, and capacity data have already been calculated. Do not recalculate them.

## Runtime Context
- Provider: ${context.runtimeModel.provider}
- Environment: ${context.runtimeModel.environment.environmentName}
- Health Availability: ${context.healthAnalysis.availability}%
- Active Incidents: ${context.incidentAnalysis.severity !== "none" ? context.incidentAnalysis.severity : "None"}

## Performance & Capacity
- P99 Latency: ${context.performanceAnalysis.p99}ms
- CPU Headroom: ${context.capacityAnalysis.cpuHeadroom}%
- Autoscaling Recommendation: ${context.capacityAnalysis.autoscalingRecommendation}

## Dependency & Observability
- Missing Telemetry: ${context.observabilityAnalysis.missingTelemetry.join(", ") || "None"}
- Single Points of Failure: ${context.dependencyAnalysis.singlePointsOfFailure.join(", ") || "None"}

## Recommendation Decision
Severity: ${context.runtimeRecommendation.severity.toUpperCase()}
Actionable: ${context.runtimeRecommendation.recommendation}

Your task is to generate a final, human-readable Runtime Intelligence review report based on the above deterministic findings.

Generate EXACTLY the following sections:
1. Executive Summary
2. Health Summary
3. Incident Explanation
4. Performance Summary
5. Operational Advice
6. Optimization Suggestions
7. Root Cause Narrative
`;
  }
}

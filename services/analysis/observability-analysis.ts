import { RuntimeModel } from "../../types/runtime";
import { ObservabilityAnalysis } from "../../types/runtime-context";
import { PlatformEventBus } from "../core/platform-event-bus";

export class ObservabilityAnalysisService {
  public analyze(runtime: RuntimeModel): ObservabilityAnalysis {
    
    const analysis: ObservabilityAnalysis = {
      metricCoverage: runtime.metrics ? 100 : 0,
      logCoverage: runtime.logs.length > 0 ? 100 : 0,
      traceCoverage: runtime.traces.length > 0 ? 100 : 0,
      alertCoverage: 80, // Default heuristic
      dashboardCoverage: 100,
      sloCompliance: runtime.alerts.length === 0, // Simplified: compliant if no alerts
      sliCoverage: 100,
      errorBudgetConsumption: runtime.alerts.length > 0 ? 50 : 0,
      missingTelemetry: runtime.traces.length === 0 ? ["Distributed Tracing"] : [],
      missingAlerts: [],
      missingDashboards: []
    };

    PlatformEventBus.getInstance().publish("ObservabilityAnalyzed", { runtimeId: runtime.id, analysis });
    return analysis;
  }
}

import { RuntimeModel } from "../../types/runtime";
import { DependencyAnalysis } from "../../types/runtime-context";
import { PlatformEventBus } from "../core/platform-event-bus";

export class DependencyAnalysisService {
  public analyze(runtime: RuntimeModel): DependencyAnalysis {
    const topology = runtime.serviceTopology;
    
    // Simulate finding failing dependencies from traces
    const dependencyFailures = new Set<string>();
    runtime.traces.filter(t => t.status === "error").forEach(t => t.dependencies.forEach(d => dependencyFailures.add(d)));

    const analysis: DependencyAnalysis = {
      criticalPaths: topology.criticalPaths,
      failurePropagation: dependencyFailures.size > 0,
      dependencyFailures: Array.from(dependencyFailures),
      singlePointsOfFailure: topology.databases.length === 1 ? topology.databases : [],
      externalDependencyRisk: topology.externalAPIs.length > 3 ? "medium" : "low"
    };

    PlatformEventBus.getInstance().publish("DependencyAnalyzed", { runtimeId: runtime.id, analysis });
    return analysis;
  }
}

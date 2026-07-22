import { RuntimeModel } from "../../types/runtime";
import { IncidentAnalysis } from "../../types/runtime-context";
import { PlatformEventBus } from "../core/platform-event-bus";

export class IncidentAnalysisService {
  public analyze(runtime: RuntimeModel): IncidentAnalysis {
    const activeIncidents = runtime.incidents.filter(i => i.status !== "closed" && i.status !== "resolved");
    const highestSeverity: IncidentAnalysis["severity"] = activeIncidents.length > 0 
      ? (activeIncidents.sort((a, b) => a.severity.localeCompare(b.severity))[0].severity as IncidentAnalysis["severity"])
      : "none";
    
    const affectedServices = new Set<string>();
    activeIncidents.forEach(i => i.affectedServices.forEach(s => affectedServices.add(s)));

    const blastRadius = affectedServices.size > 3 ? "widespread" 
      : affectedServices.size > 1 ? "localized" 
      : affectedServices.size === 1 ? "isolated" 
      : "isolated"; // default

    const analysis: IncidentAnalysis = {
      severity: highestSeverity,
      affectedServices: Array.from(affectedServices),
      blastRadius,
      deploymentCorrelation: false, // Could cross reference deployment times with incident start times
      failureTimeline: activeIncidents.map(i => `${i.startTime}: ${i.title}`),
      recoveryProgress: highestSeverity === "none" ? 100 : 0,
      recurrenceFrequency: 0,
      affectedUsersEstimate: highestSeverity !== "none" ? 500 : 0,
      businessImpact: highestSeverity === "SEV-1" || highestSeverity === "SEV-2" ? "high" : "low"
    };

    PlatformEventBus.getInstance().publish("IncidentAnalyzed", { runtimeId: runtime.id, analysis });
    return analysis;
  }
}

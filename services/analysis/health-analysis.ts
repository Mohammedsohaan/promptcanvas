import { RuntimeModel } from "../../types/runtime";
import { HealthAnalysis } from "../../types/runtime-context";
import { PlatformEventBus } from "../core/platform-event-bus";

export class HealthAnalysisService {
  public analyze(runtime: RuntimeModel): HealthAnalysis {
    const services = runtime.services;
    const degradedServices = services.filter(s => s.status === "degraded" || s.status === "unhealthy");
    
    // Average availability across services
    const availability = services.length > 0 
      ? services.reduce((acc, s) => acc + s.availability, 0) / services.length 
      : 100;

    const analysis: HealthAnalysis = {
      availability,
      readiness: degradedServices.length > 0 ? 80 : 100, // naive placeholder logic
      liveness: degradedServices.length > 0 ? 90 : 100,
      restartCount: 0, // Should be computed from actual pod logs/events in a real system
      crashLoops: 0,
      deploymentHealth: degradedServices.length > 0 ? "degraded" : "healthy",
      nodeHealth: "healthy", // Assuming nodes are healthy unless metrics say otherwise
      podHealth: degradedServices.length > 0 ? "degraded" : "healthy",
      containerHealth: "healthy"
    };

    PlatformEventBus.getInstance().publish("HealthAnalyzed", { runtimeId: runtime.id, analysis });
    return analysis;
  }
}

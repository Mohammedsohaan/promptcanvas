import { CapabilityRegistry } from "./capability-registry";
import { WorkflowRegistry } from "./workflow-registry";
import { AnalysisRegistry } from "./analysis-registry";
import { GeneratorRegistry } from "./generator-registry";
import { ConnectorRegistry } from "./connector-registry";
import { PlatformCache } from "./platform-cache";
import { PlatformTelemetryService } from "./platform-telemetry";
import { ProfilerService } from "./profiler-service";

export interface PlatformHealthReport {
  overall: "healthy" | "degraded" | "unhealthy";
  registries: {
    capability: { status: string; pluginCount: number };
    workflow: { status: string; pluginCount: number };
    analysis: { status: string; pluginCount: number };
    generator: { status: string; pluginCount: number };
    connector: { status: string; pluginCount: number };
  };
  cache: { status: string; size: number };
  telemetry: { status: string; totalEntries: number };
  profiler: { status: string; snapshotCount: number };
  timestamp: string;
}

/**
 * PlatformHealthService aggregates health status from every platform subsystem
 * into a single unified health report.
 */
export class PlatformHealthService {
  private static instance: PlatformHealthService;

  private constructor() {}

  public static getInstance(): PlatformHealthService {
    if (!PlatformHealthService.instance) {
      PlatformHealthService.instance = new PlatformHealthService();
    }
    return PlatformHealthService.instance;
  }

  public evaluate(): PlatformHealthReport {
    const capStatus = CapabilityRegistry.getInstance().getStatus();
    const wfStatus = WorkflowRegistry.getInstance().getStatus();
    const anStatus = AnalysisRegistry.getInstance().getStatus();
    const genStatus = GeneratorRegistry.getInstance().getStatus();
    const conStatus = ConnectorRegistry.getInstance().getStatus();

    const cacheHealth = PlatformCache.getInstance().health();
    const telemetryHealth = PlatformTelemetryService.getInstance().health();
    const profilerHealth = ProfilerService.getInstance().health();

    // Determine overall health
    const allValid = [
      capStatus.validationErrors.length === 0,
      wfStatus.validationErrors.length === 0,
      anStatus.validationErrors.length === 0,
      genStatus.validationErrors.length === 0,
      conStatus.validationErrors.length === 0
    ];
    const degradedCount = allValid.filter(v => !v).length;
    const overall = degradedCount === 0 ? "healthy" : degradedCount <= 2 ? "degraded" : "unhealthy";

    return {
      overall,
      registries: {
        capability: { status: capStatus.validationErrors.length === 0 ? "healthy" : "degraded", pluginCount: capStatus.pluginCount },
        workflow: { status: wfStatus.validationErrors.length === 0 ? "healthy" : "degraded", pluginCount: wfStatus.pluginCount },
        analysis: { status: anStatus.validationErrors.length === 0 ? "healthy" : "degraded", pluginCount: anStatus.pluginCount },
        generator: { status: genStatus.validationErrors.length === 0 ? "healthy" : "degraded", pluginCount: genStatus.pluginCount },
        connector: { status: conStatus.validationErrors.length === 0 ? "healthy" : "degraded", pluginCount: conStatus.pluginCount }
      },
      cache: cacheHealth,
      telemetry: telemetryHealth,
      profiler: profilerHealth,
      timestamp: new Date().toISOString()
    };
  }
}

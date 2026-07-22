import { RuntimeModel } from "../../types/runtime";
import { PerformanceAnalysis } from "../../types/runtime-context";
import { PlatformEventBus } from "../core/platform-event-bus";

export class PerformanceAnalysisService {
  public analyze(runtime: RuntimeModel): PerformanceAnalysis {
    const m = runtime.metrics;
    
    const analysis: PerformanceAnalysis = {
      latency: m.Latency,
      p50: m.P50,
      p95: m.P95,
      p99: m.P99,
      cpu: m.CPU,
      memory: m.Memory,
      disk: m.Disk,
      network: m.Network,
      requestRate: m.RequestRate,
      errorRate: m.ErrorRate,
      slowQueries: 0, // Extracted from traces theoretically
      cacheHitRate: m.CacheHitRate
    };

    PlatformEventBus.getInstance().publish("PerformanceAnalyzed", { runtimeId: runtime.id, analysis });
    return analysis;
  }
}

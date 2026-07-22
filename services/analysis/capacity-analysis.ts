import { RuntimeModel } from "../../types/runtime";
import { CapacityAnalysis } from "../../types/runtime-context";
import { PlatformEventBus } from "../core/platform-event-bus";

export class CapacityAnalysisService {
  public analyze(runtime: RuntimeModel): CapacityAnalysis {
    const m = runtime.metrics;
    const cpuHeadroom = 100 - m.CPU;
    const memoryHeadroom = 100 - m.Memory;

    let autoscalingRecommendation: "scale_up" | "scale_down" | "maintain" = "maintain";
    let futureCapacityRisk: "high" | "medium" | "low" = "low";

    if (cpuHeadroom < 20 || memoryHeadroom < 20) {
      autoscalingRecommendation = "scale_up";
      futureCapacityRisk = "high";
    } else if (cpuHeadroom > 80 && memoryHeadroom > 80) {
      autoscalingRecommendation = "scale_down";
    }

    const analysis: CapacityAnalysis = {
      cpuHeadroom,
      memoryHeadroom,
      diskUtilization: m.Disk,
      networkUtilization: m.Network, // as percentage relative to max capacity in real implementation
      autoscalingRecommendation,
      capacityTrend: "stable",
      futureCapacityRisk
    };

    PlatformEventBus.getInstance().publish("CapacityAnalyzed", { runtimeId: runtime.id, analysis });
    return analysis;
  }
}

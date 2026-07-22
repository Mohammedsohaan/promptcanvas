import { RuntimeProvider } from "./runtime-provider";
import { RuntimeModel } from "../../types/runtime";
import { PlatformEventBus } from "../core/platform-event-bus";

/**
 * RuntimeConnector normalizes provider output into RuntimeModel
 * and manages integration event lifecycles.
 */
export class RuntimeConnector {
  constructor(private provider: RuntimeProvider) {}

  public async getRuntimeData(envId: string, timeRangeMinutes: number = 60, credentials?: Record<string, any>): Promise<RuntimeModel> {
    PlatformEventBus.getInstance().publish("RuntimeConnected", { provider: this.provider.name(), envId });
    
    const runtime = await this.provider.fetchRuntimeData(envId, timeRangeMinutes, credentials);
    
    PlatformEventBus.getInstance().publish("MetricsCollected", { provider: this.provider.name(), metrics: runtime.metrics });
    PlatformEventBus.getInstance().publish("LogsCollected", { provider: this.provider.name(), logsCount: runtime.logs.length });
    PlatformEventBus.getInstance().publish("TracesCollected", { provider: this.provider.name(), tracesCount: runtime.traces.length });

    return runtime;
  }
}

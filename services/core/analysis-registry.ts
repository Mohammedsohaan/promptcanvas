import { AnalysisPlugin } from "../plugins/interfaces/analysis-plugin";
import { PlatformEventBus } from "./platform-event-bus";
import { RegistryStatus } from "./capability-registry";

export class AnalysisRegistry {
  private static instance: AnalysisRegistry;
  private analyses: AnalysisPlugin[] = [];
  private validationErrors: string[] = [];

  private constructor() {}

  public static getInstance(): AnalysisRegistry {
    if (!AnalysisRegistry.instance) {
      AnalysisRegistry.instance = new AnalysisRegistry();
    }
    return AnalysisRegistry.instance;
  }

  public register(plugin: AnalysisPlugin): void {
    this.analyses.push(plugin);
    this.analyses.sort((a, b) => b.priority() - a.priority());
    PlatformEventBus.getInstance().publish("AnalysisRegistered", {});
  }

  public resolve(context: Record<string, any>): AnalysisPlugin[] {
    return this.analyses.filter(p => p.supports(context));
  }

  public list(): AnalysisPlugin[] {
    return [...this.analyses];
  }

  public validate(): boolean {
    return this.validationErrors.length === 0;
  }

  public getStatus(): RegistryStatus {
    return {
      initialized: true,
      pluginCount: this.analyses.length,
      registeredPlugins: this.analyses.map((_, i) => `analysis-${i}`),
      validationErrors: [...this.validationErrors]
    };
  }
}

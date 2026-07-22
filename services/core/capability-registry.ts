import { CapabilityPlugin } from "../plugins/interfaces/capability-plugin";
import { PlatformEventBus } from "./platform-event-bus";

export interface RegistryStatus {
  initialized: boolean;
  pluginCount: number;
  registeredPlugins: string[];
  validationErrors: string[];
}

export class CapabilityRegistry {
  private static instance: CapabilityRegistry;
  private capabilities: Map<string, CapabilityPlugin> = new Map();
  private validationErrors: string[] = [];

  private constructor() {}

  public static getInstance(): CapabilityRegistry {
    if (!CapabilityRegistry.instance) {
      CapabilityRegistry.instance = new CapabilityRegistry();
    }
    return CapabilityRegistry.instance;
  }

  public register(plugin: CapabilityPlugin): void {
    if (this.capabilities.has(plugin.id)) {
      this.validationErrors.push(`Duplicate capability ID: ${plugin.id}`);
      return;
    }
    plugin.register();
    this.capabilities.set(plugin.id, plugin);
    PlatformEventBus.getInstance().publish("CapabilityRegistered", { id: plugin.id });
  }

  public unregister(id: string): void {
    this.capabilities.delete(id);
  }

  public resolve(id: string): CapabilityPlugin | undefined {
    return this.capabilities.get(id);
  }

  public list(): CapabilityPlugin[] {
    return Array.from(this.capabilities.values());
  }

  public exists(id: string): boolean {
    return this.capabilities.has(id);
  }

  public validate(): boolean {
    return this.validationErrors.length === 0;
  }

  public getStatus(): RegistryStatus {
    return {
      initialized: true,
      pluginCount: this.capabilities.size,
      registeredPlugins: Array.from(this.capabilities.keys()),
      validationErrors: [...this.validationErrors]
    };
  }

  // v3.3.1 Diagnostics Extensions

  public health(): { status: string; issues: string[] } {
    const issues: string[] = [...this.validationErrors];
    return { status: issues.length === 0 ? "healthy" : "degraded", issues };
  }

  public statistics(): { totalPlugins: number; registeredIds: string[] } {
    return { totalPlugins: this.capabilities.size, registeredIds: Array.from(this.capabilities.keys()) };
  }

  public diagnostics(): { health: any; status: RegistryStatus; statistics: any } {
    return { health: this.health(), status: this.getStatus(), statistics: this.statistics() };
  }
}

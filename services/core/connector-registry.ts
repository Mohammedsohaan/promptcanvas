import { ConnectorPlugin } from "../plugins/interfaces/connector-plugin";
import { PlatformEventBus } from "./platform-event-bus";
import { RegistryStatus } from "./capability-registry";

export class ConnectorRegistry {
  private static instance: ConnectorRegistry;
  private connectors: Map<string, ConnectorPlugin> = new Map();
  private validationErrors: string[] = [];

  private constructor() {}

  public static getInstance(): ConnectorRegistry {
    if (!ConnectorRegistry.instance) {
      ConnectorRegistry.instance = new ConnectorRegistry();
    }
    return ConnectorRegistry.instance;
  }

  public register(plugin: ConnectorPlugin): void {
    if (this.connectors.has(plugin.provider())) {
      this.validationErrors.push(`Duplicate connector for provider: ${plugin.provider()}`);
      return;
    }
    this.connectors.set(plugin.provider(), plugin);
    PlatformEventBus.getInstance().publish("ConnectorRegistered", { provider: plugin.provider() });
  }

  public resolve(provider: string): ConnectorPlugin | undefined {
    return this.connectors.get(provider);
  }

  public list(): ConnectorPlugin[] {
    return Array.from(this.connectors.values());
  }

  public validate(): boolean {
    return this.validationErrors.length === 0;
  }

  public getStatus(): RegistryStatus {
    return {
      initialized: true,
      pluginCount: this.connectors.size,
      registeredPlugins: Array.from(this.connectors.keys()),
      validationErrors: [...this.validationErrors]
    };
  }
}

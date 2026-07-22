import { GeneratorPlugin } from "../plugins/interfaces/generator-plugin";
import { PlatformEventBus } from "./platform-event-bus";
import { RegistryStatus } from "./capability-registry";

export class GeneratorRegistry {
  private static instance: GeneratorRegistry;
  private generators: Map<string, GeneratorPlugin> = new Map();
  private validationErrors: string[] = [];

  private constructor() {}

  public static getInstance(): GeneratorRegistry {
    if (!GeneratorRegistry.instance) {
      GeneratorRegistry.instance = new GeneratorRegistry();
    }
    return GeneratorRegistry.instance;
  }

  public register(plugin: GeneratorPlugin): void {
    if (this.generators.has(plugin.documentType())) {
      this.validationErrors.push(`Duplicate generator for type: ${plugin.documentType()}`);
      return;
    }
    this.generators.set(plugin.documentType(), plugin);
    PlatformEventBus.getInstance().publish("GeneratorRegistered", { documentType: plugin.documentType() });
  }

  public resolve(documentType: string): GeneratorPlugin | undefined {
    return this.generators.get(documentType);
  }

  public list(): GeneratorPlugin[] {
    return Array.from(this.generators.values());
  }

  public validate(): boolean {
    return this.validationErrors.length === 0;
  }

  public getStatus(): RegistryStatus {
    return {
      initialized: true,
      pluginCount: this.generators.size,
      registeredPlugins: Array.from(this.generators.keys()),
      validationErrors: [...this.validationErrors]
    };
  }
}

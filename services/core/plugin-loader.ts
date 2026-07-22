import { PluginManifest } from "./plugin-manifest";
import { PlatformEventBus } from "./platform-event-bus";
import { CapabilityRegistry } from "./capability-registry";
import { WorkflowRegistry } from "./workflow-registry";
import { AnalysisRegistry } from "./analysis-registry";
import { GeneratorRegistry } from "./generator-registry";
import { ConnectorRegistry } from "./connector-registry";

export class PluginLoader {
  private static instance: PluginLoader;

  private constructor() {}

  public static getInstance(): PluginLoader {
    if (!PluginLoader.instance) {
      PluginLoader.instance = new PluginLoader();
    }
    return PluginLoader.instance;
  }

  /**
   * Discovers and registers a plugin into the appropriate registries.
   * This handles capability plugins, workflow plugins, etc.
   */
  public loadPlugin(manifest: PluginManifest, instances: any): void {
    const eventBus = PlatformEventBus.getInstance();

    try {
      if (instances.capability) {
        CapabilityRegistry.getInstance().register(instances.capability);
      }
      
      if (instances.workflow) {
        WorkflowRegistry.getInstance().register(instances.workflow);
      }

      if (instances.analysis) {
        AnalysisRegistry.getInstance().register(instances.analysis);
      }

      if (instances.generator) {
        GeneratorRegistry.getInstance().register(instances.generator);
      }

      if (instances.connector) {
        ConnectorRegistry.getInstance().register(instances.connector);
      }

      manifest.status = "loaded";
      eventBus.publish("PluginLoaded", { manifest });
    } catch (error: any) {
      manifest.status = "failed";
      eventBus.publish("PluginRegistrationFailed", { manifest, error: error.message });
      throw error;
    }
  }
}

import { PlatformEventBus } from "./platform-event-bus";
import { CapabilityRegistry } from "./capability-registry";
import { WorkflowRegistry } from "./workflow-registry";
import { AnalysisRegistry } from "./analysis-registry";
import { GeneratorRegistry } from "./generator-registry";
import { ConnectorRegistry } from "./connector-registry";
import { PluginLoader } from "./plugin-loader";
import { PluginManifest } from "./plugin-manifest";
import { 
  PullRequestCapabilityPlugin, 
  PullRequestWorkflowPlugin, 
  PullRequestAnalysisPlugin 
} from "../plugins/pull-request-plugin";
import { GitHubPullRequestConnectorPlugin } from "../plugins/github-pr-connector-plugin";
import {
  PipelineCapabilityPlugin,
  PipelineWorkflowPlugin,
  PipelineAnalysisPlugin
} from "../plugins/pipeline-plugin";
import { GitHubActionsConnectorPlugin } from "../plugins/github-actions-connector-plugin";
import {
  RuntimeCapabilityPlugin,
  RuntimeWorkflowPlugin,
  RuntimeAnalysisPlugin
} from "../plugins/runtime-plugin";
import { OpenTelemetryConnectorPlugin } from "../plugins/opentelemetry-connector-plugin";
import {
  SecurityCapabilityPlugin,
  SecurityWorkflowPlugin,
  SecurityAnalysisPlugin
} from "../plugins/security-plugin";
import { GitHubSecurityConnectorPlugin } from "../plugins/github-security-connector-plugin";
import { ProfilerService } from "./profiler-service";
import { PlatformTelemetryService } from "./platform-telemetry";

export class BootstrapManager {
  private static instance: BootstrapManager;
  private isReady: boolean = false;
  private startupTimeMs: number = 0;
  private warnings: string[] = [];
  private errors: string[] = [];

  private constructor() {}

  public static getInstance(): BootstrapManager {
    if (!BootstrapManager.instance) {
      BootstrapManager.instance = new BootstrapManager();
    }
    return BootstrapManager.instance;
  }

  public async initialize(): Promise<void> {
    const profiler = ProfilerService.getInstance();
    const telemetry = PlatformTelemetryService.getInstance();
    profiler.startTimer("bootstrap");

    const eventBus = PlatformEventBus.getInstance();
    eventBus.publish("PlatformStarted");

    // Initialize all registries
    CapabilityRegistry.getInstance();
    WorkflowRegistry.getInstance();
    AnalysisRegistry.getInstance();
    GeneratorRegistry.getInstance();
    ConnectorRegistry.getInstance();

    eventBus.publish("RegistryInitialized");

    this.registerCoreServices();

    if (!this.validateDependencies()) {
      this.errors.push("Core dependencies validation failed.");
      eventBus.publish("PluginRegistrationFailed", { error: "Core dependencies missing" });
      throw new Error("Bootstrap failed: Missing dependencies");
    }

    this.startupTimeMs = profiler.stopTimer("bootstrap");
    telemetry.record("bootstrap", this.startupTimeMs);
    profiler.captureSnapshot({ bootstrapTimeMs: this.startupTimeMs });

    this.isReady = true;
    eventBus.publish("BootstrapCompleted");
    eventBus.publish("PlatformReady");
  }

  /**
   * Registers existing services (Repository Analysis, Traceability, Release, etc) 
   * into their respective plugin registries as a shim.
   */
  private registerCoreServices() {
    const loader = PluginLoader.getInstance();
    
    // Example wrapper for core existing capabilities.
    // In a full implementation, each existing service would be mapped to a true Plugin wrapper instance.
    const coreManifest: PluginManifest = {
      id: "core-services",
      name: "PromptCanvas Core Services",
      version: "3.0.1",
      description: "Foundation platform services.",
      author: "PromptCanvas",
      dependencies: [],
      status: "uninitialized"
    };

    // For the sake of the foundation architecture, we push the manifest through the loader 
    // to simulate the discovery of built-in deterministic services.
    const prManifest: PluginManifest = {
      id: "pull-request-intelligence",
      name: "Platform v3.1 PR Intelligence",
      version: "3.1.0",
      description: "AI Pull Request Code Review module",
      author: "PromptCanvas",
      dependencies: [],
      status: "uninitialized"
    };

    loader.loadPlugin(prManifest, {
      capability: new PullRequestCapabilityPlugin(),
      workflow: new PullRequestWorkflowPlugin(),
      analysis: new PullRequestAnalysisPlugin(),
      connector: new GitHubPullRequestConnectorPlugin()
    });

    const ciManifest: PluginManifest = {
      id: "cicd-intelligence",
      name: "Platform v3.2 CI/CD Intelligence",
      version: "3.2.0",
      description: "AI CI/CD Pipeline Intelligence module",
      author: "PromptCanvas",
      dependencies: ["pull-request-intelligence"],
      status: "uninitialized"
    };

    loader.loadPlugin(ciManifest, {
      capability: new PipelineCapabilityPlugin(),
      workflow: new PipelineWorkflowPlugin(),
      analysis: new PipelineAnalysisPlugin(),
      connector: new GitHubActionsConnectorPlugin()
    });

    const runtimeManifest: PluginManifest = {
      id: "runtime-intelligence",
      name: "Platform v3.3 Runtime Intelligence",
      version: "3.3.0",
      description: "AI Runtime Intelligence module",
      author: "PromptCanvas",
      dependencies: ["cicd-intelligence"],
      status: "uninitialized"
    };

    loader.loadPlugin(runtimeManifest, {
      capability: new RuntimeCapabilityPlugin(),
      workflow: new RuntimeWorkflowPlugin(),
      analysis: new RuntimeAnalysisPlugin(),
      connector: new OpenTelemetryConnectorPlugin()
    });

    const securityManifest: PluginManifest = {
      id: "security-intelligence",
      name: "Platform v3.4 Security Intelligence",
      version: "3.4.0",
      description: "AI Security Intelligence module",
      author: "PromptCanvas",
      dependencies: ["runtime-intelligence"],
      status: "uninitialized"
    };

    loader.loadPlugin(securityManifest, {
      capability: new SecurityCapabilityPlugin(),
      workflow: new SecurityWorkflowPlugin(),
      analysis: new SecurityAnalysisPlugin(),
      connector: new GitHubSecurityConnectorPlugin()
    });
  }

  private validateDependencies(): boolean {
    const registries = [
      CapabilityRegistry.getInstance().validate(),
      WorkflowRegistry.getInstance().validate(),
      AnalysisRegistry.getInstance().validate(),
      GeneratorRegistry.getInstance().validate(),
      ConnectorRegistry.getInstance().validate()
    ];
    return registries.every(r => r === true);
  }

  public generateBootstrapReport(): any {
    return {
      platformVersion: "3.4.0",
      platformReady: this.isReady,
      startupTimeMs: this.startupTimeMs,
      pluginCount: CapabilityRegistry.getInstance().getStatus().pluginCount
        + ConnectorRegistry.getInstance().getStatus().pluginCount,
      capabilityRegistry: CapabilityRegistry.getInstance().getStatus(),
      workflowRegistry: WorkflowRegistry.getInstance().getStatus(),
      analysisRegistry: AnalysisRegistry.getInstance().getStatus(),
      generatorRegistry: GeneratorRegistry.getInstance().getStatus(),
      connectorRegistry: ConnectorRegistry.getInstance().getStatus(),
      warnings: [...this.warnings],
      errors: [...this.errors]
    };
  }
}

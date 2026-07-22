import { PlatformEventBus } from "../core/platform-event-bus";
import { PluginManifest } from "../core/plugin-manifest";
import { PluginLoader } from "../core/plugin-loader";
import { CapabilityRegistry } from "../core/capability-registry";
import { WorkflowRegistry } from "../core/workflow-registry";
import { AnalysisRegistry } from "../core/analysis-registry";
import { GeneratorRegistry } from "../core/generator-registry";
import { ConnectorRegistry } from "../core/connector-registry";
import { BootstrapManager } from "../core/bootstrap-manager";
import { IntentResolver } from "../core/intent-resolver";
import { CapabilityPlugin } from "../plugins/interfaces/capability-plugin";
import { AnalysisPlugin } from "../plugins/interfaces/analysis-plugin";

describe("Platform v3.0.1 - Plugin Architecture & Registry Foundation", () => {
  let eventBus: PlatformEventBus;

  beforeEach(() => {
    // Reset singleton state if needed for clean tests
    eventBus = PlatformEventBus.getInstance();
    // Normally we'd want to clear registries here, but singletons in Node persist across tests
    // unless mocked or explicitly cleared. We will test additive behavior.
  });

  describe("PlatformEventBus", () => {
    it("should publish and subscribe to events", (done) => {
      const payload = { test: true };
      const callback = (data: any) => {
        expect(data).toEqual(payload);
        eventBus.unsubscribe("TestEvent", callback);
        done();
      };
      eventBus.subscribe("TestEvent", callback);
      eventBus.publish("TestEvent", payload);
    });
  });

  describe("CapabilityRegistry", () => {
    it("should register and resolve capabilities", () => {
      const registry = CapabilityRegistry.getInstance();
      const mockPlugin: CapabilityPlugin = {
        id: "test_capability",
        name: "Test Capability",
        version: "1.0.0",
        register: jest.fn(),
        execute: jest.fn().mockResolvedValue({ artifactId: "test-123" })
      };

      registry.register(mockPlugin);
      expect(mockPlugin.register).toHaveBeenCalled();
      expect(registry.exists("test_capability")).toBe(true);
      
      const resolved = registry.resolve("test_capability");
      expect(resolved).toBe(mockPlugin);
    });

    it("should record validation errors on duplicate ID", () => {
      const registry = CapabilityRegistry.getInstance();
      const duplicatePlugin: CapabilityPlugin = {
        id: "test_capability",
        name: "Duplicate",
        version: "1.0.0",
        register: jest.fn(),
        execute: jest.fn()
      };

      registry.register(duplicatePlugin);
      expect(registry.validate()).toBe(false);
      expect(registry.getStatus().validationErrors).toContain("Duplicate capability ID: test_capability");
    });
  });

  describe("AnalysisRegistry", () => {
    it("should register and resolve based on context support", () => {
      const registry = AnalysisRegistry.getInstance();
      const mockAnalysis: AnalysisPlugin = {
        supports: (context) => context.type === "code",
        priority: () => 10,
        analyze: jest.fn().mockResolvedValue({ status: "ok" })
      };

      registry.register(mockAnalysis);
      const resolved = registry.resolve({ type: "code" });
      expect(resolved.length).toBeGreaterThan(0);
      expect(resolved[0]).toBe(mockAnalysis);

      const unsupported = registry.resolve({ type: "image" });
      expect(unsupported.length).toBe(0);
    });
  });

  describe("PluginLoader", () => {
    it("should load valid plugins and publish events", () => {
      const loader = PluginLoader.getInstance();
      const manifest: PluginManifest = {
        id: "test_plugin",
        name: "Test Plugin",
        version: "1.0.0",
        description: "Test plugin",
        author: "Tester",
        dependencies: [],
        status: "uninitialized"
      };

      let eventFired = false;
      eventBus.subscribe("PluginLoaded", (data) => {
        if (data.manifest.id === "test_plugin") eventFired = true;
      });

      const mockCapability: CapabilityPlugin = {
        id: "test_plugin_cap",
        name: "Test Plugin Cap",
        version: "1.0.0",
        register: jest.fn(),
        execute: jest.fn()
      };

      loader.loadPlugin(manifest, { capability: mockCapability });
      
      expect(manifest.status).toBe("loaded");
      expect(CapabilityRegistry.getInstance().exists("test_plugin_cap")).toBe(true);
      expect(eventFired).toBe(true);
    });
  });

  describe("IntentResolver", () => {
    it("should resolve prompts to registered capabilities", () => {
      const resolver = IntentResolver.getInstance();
      // "test capability" was registered above
      const matches = resolver.resolve("I want to use the test capability");
      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0].id).toBe("test_capability");
    });
  });

  describe("BootstrapManager", () => {
    it("should initialize platform and validate dependencies", async () => {
      const manager = BootstrapManager.getInstance();
      
      let platformReadyFired = false;
      eventBus.subscribe("PlatformReady", () => {
        platformReadyFired = true;
      });

      // We expect it to fail here because we injected a duplicate capability above (test_capability)
      // which causes validate() to return false. Let's see if it throws correctly.
      await expect(manager.initialize()).rejects.toThrow("Bootstrap failed: Missing dependencies");
      
      const report = manager.generateBootstrapReport();
      expect(report.platformReady).toBe(false);
      expect(report.capabilityRegistry.validationErrors.length).toBeGreaterThan(0);
    });
  });
});

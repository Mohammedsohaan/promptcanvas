import { PluginSDK, PLATFORM_VERSION } from "../../sdk/plugin-sdk";
import { PluginBuilder } from "../../sdk/plugin-builder";
import { PluginValidator } from "../../sdk/plugin-validator";
import { CompatibilityValidator } from "../../sdk/compatibility-validator";
import { DependencyValidator } from "../../sdk/dependency-validator";
import { MigrationFramework } from "../../sdk/migration-framework";
import { PluginCLI } from "../../sdk/cli";
import { createPluginTemplate } from "../../sdk/plugin-template";
import { PlatformCache } from "../core/platform-cache";
import { PlatformTelemetryService } from "../core/platform-telemetry";
import { ProfilerService } from "../core/profiler-service";
import { PlatformHealthService } from "../core/platform-health";
import { BootstrapManager } from "../core/bootstrap-manager";
import { CapabilityRegistry } from "../core/capability-registry";
import { PlatformEventBus } from "../core/platform-event-bus";
import { PluginManifest } from "../core/plugin-manifest";

describe("Platform v3.3.1 — Stabilization & Plugin SDK", () => {

  // ===== Plugin SDK =====
  describe("Plugin SDK", () => {
    it("PluginSDK should expose platform version", () => {
      expect(PLATFORM_VERSION).toBe("3.3.1");
    });

    it("PluginSDK should manage lifecycle states", async () => {
      const manifest: PluginManifest = {
        id: "test-sdk", name: "Test", version: "1.0.0", description: "", author: "", dependencies: [], status: "uninitialized"
      };
      const sdk = new PluginSDK(manifest);
      expect(sdk.getStatus()).toBe("uninitialized");
      await sdk.start();
      expect(sdk.getStatus()).toBe("loaded");
      await sdk.stop();
      expect(sdk.getStatus()).toBe("stopped");
    });

    it("PluginSDK should call custom lifecycle hooks", async () => {
      let initialized = false;
      const manifest: PluginManifest = {
        id: "hook-test", name: "Hook", version: "1.0.0", description: "", author: "", dependencies: [], status: "uninitialized"
      };
      const sdk = new PluginSDK(manifest, {
        initialize: async () => { initialized = true; }
      });
      await sdk.initialize();
      expect(initialized).toBe(true);
    });
  });

  // ===== Plugin Builder =====
  describe("Plugin Builder", () => {
    it("should build a valid plugin via fluent API", () => {
      const sdk = new PluginBuilder()
        .setId("builder-test")
        .setName("Builder Test Plugin")
        .setVersion("1.0.0")
        .setAuthor("PromptCanvas")
        .addDependency("core-services")
        .build();
      expect(sdk.getPluginId()).toBe("builder-test");
      expect(sdk.getPlatformVersion()).toBe(PLATFORM_VERSION);
    });

    it("should throw if id or name is missing", () => {
      expect(() => new PluginBuilder().setId("").setName("").build()).toThrow();
    });
  });

  // ===== Plugin Validator =====
  describe("Plugin Validator", () => {
    it("should validate a correct manifest", () => {
      const validator = new PluginValidator();
      const result = validator.validate({ id: "x", name: "X", version: "1.0", description: "", author: "", dependencies: [], status: "uninitialized" });
      expect(result.valid).toBe(true);
    });

    it("should fail validation when id is missing", () => {
      const validator = new PluginValidator();
      const result = validator.validate({ id: "", name: "X", version: "1.0", description: "", author: "", dependencies: [], status: "uninitialized" });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Plugin id is required.");
    });

    it("should warn on pre-release versions", () => {
      const validator = new PluginValidator();
      const result = validator.validate({ id: "x", name: "X", version: "1.0", pluginVersion: "0.1.0", description: "", author: "", dependencies: [], status: "uninitialized" });
      expect(result.warnings).toContain("Pre-release plugin version detected.");
    });
  });

  // ===== Plugin Template =====
  describe("Plugin Template", () => {
    it("should create a valid scaffold manifest", () => {
      const template = createPluginTemplate("my-plugin", "My Plugin");
      expect(template.id).toBe("my-plugin");
      expect(template.minimumPlatformVersion).toBe("3.3.1");
      expect(template.status).toBe("uninitialized");
    });
  });

  // ===== Compatibility Validator =====
  describe("Compatibility Validator", () => {
    it("should pass for a compatible plugin", () => {
      const cv = new CompatibilityValidator([]);
      const result = cv.validate({ id: "compat", name: "C", version: "1.0", minimumPlatformVersion: "3.0.1", description: "", author: "", dependencies: [], status: "uninitialized" });
      expect(result.compatible).toBe(true);
    });

    it("should fail for duplicate plugin IDs", () => {
      const cv = new CompatibilityValidator(["compat"]);
      const result = cv.validate({ id: "compat", name: "C", version: "1.0", description: "", author: "", dependencies: [], status: "uninitialized" });
      expect(result.compatible).toBe(false);
      expect(result.errors[0]).toContain("Duplicate plugin");
    });

    it("should fail when platform version is below minimum", () => {
      const cv = new CompatibilityValidator([]);
      const result = cv.validate({ id: "future", name: "F", version: "1.0", minimumPlatformVersion: "99.0.0", description: "", author: "", dependencies: [], status: "uninitialized" });
      expect(result.compatible).toBe(false);
    });
  });

  // ===== Dependency Validator =====
  describe("Dependency Validator", () => {
    it("should validate a clean dependency graph", () => {
      const manifests: PluginManifest[] = [
        { id: "a", name: "A", version: "1.0", description: "", author: "", dependencies: [], status: "loaded" },
        { id: "b", name: "B", version: "1.0", description: "", author: "", dependencies: ["a"], status: "loaded" }
      ];
      const result = new DependencyValidator(manifests).validate();
      expect(result.valid).toBe(true);
      expect(result.loadOrder).toEqual(["a", "b"]);
    });

    it("should detect missing dependencies", () => {
      const manifests: PluginManifest[] = [
        { id: "b", name: "B", version: "1.0", description: "", author: "", dependencies: ["missing"], status: "loaded" }
      ];
      const result = new DependencyValidator(manifests).validate();
      expect(result.valid).toBe(false);
      expect(result.missingDependencies.length).toBeGreaterThan(0);
    });
  });

  // ===== Migration Framework =====
  describe("Migration Framework", () => {
    it("should migrate a manifest through versioned steps", () => {
      const mf = new MigrationFramework();
      mf.registerMigration({
        fromVersion: 0, toVersion: 1, description: "Add platformVersion",
        migrate: (m) => ({ ...m, platformVersion: "3.3.1" })
      });
      const original: PluginManifest = { id: "m", name: "M", version: "1.0", description: "", author: "", dependencies: [], status: "loaded", migrationVersion: 0 };
      const migrated = mf.migrate(original, 1);
      expect(migrated.platformVersion).toBe("3.3.1");
      expect(migrated.migrationVersion).toBe(1);
    });

    it("should support rollback", () => {
      const mf = new MigrationFramework();
      mf.registerMigration({
        fromVersion: 0, toVersion: 1, description: "V1",
        migrate: (m) => ({ ...m, description: "migrated" })
      });
      const original: PluginManifest = { id: "r", name: "R", version: "1.0", description: "original", author: "", dependencies: [], status: "loaded", migrationVersion: 0 };
      mf.migrate(original, 1);
      const rolledBack = mf.rollback();
      expect(rolledBack?.description).toBe("original");
    });
  });

  // ===== Cache =====
  describe("Platform Cache", () => {
    beforeEach(() => PlatformCache.getInstance().clear());

    it("should set and get values", () => {
      PlatformCache.getInstance().set("key1", "value1");
      expect(PlatformCache.getInstance().get("key1")).toBe("value1");
    });

    it("should return undefined for expired TTL", (done) => {
      PlatformCache.getInstance().set("ttl", "expiring", 1); // 1ms TTL
      setTimeout(() => {
        expect(PlatformCache.getInstance().get("ttl")).toBeUndefined();
        done();
      }, 10);
    });

    it("should track hit/miss statistics", () => {
      PlatformCache.getInstance().set("hit", "v");
      PlatformCache.getInstance().get("hit");
      PlatformCache.getInstance().get("miss");
      const stats = PlatformCache.getInstance().statistics();
      expect(stats.hits).toBe(1);
      expect(stats.misses).toBe(1);
      expect(stats.hitRate).toBe(50);
    });

    it("should invalidate entries", () => {
      PlatformCache.getInstance().set("del", "v");
      PlatformCache.getInstance().invalidate("del");
      expect(PlatformCache.getInstance().get("del")).toBeUndefined();
    });
  });

  // ===== Telemetry =====
  describe("Platform Telemetry", () => {
    beforeEach(() => PlatformTelemetryService.getInstance().clear());

    it("should measure synchronous operations", () => {
      const result = PlatformTelemetryService.getInstance().measure("test_op", () => 42);
      expect(result).toBe(42);
      expect(PlatformTelemetryService.getInstance().getEntries().length).toBe(1);
    });

    it("should compute average duration by operation", () => {
      PlatformTelemetryService.getInstance().record("op", 10);
      PlatformTelemetryService.getInstance().record("op", 20);
      expect(PlatformTelemetryService.getInstance().getAverageDuration("op")).toBe(15);
    });

    it("should produce a summary grouped by operation", () => {
      PlatformTelemetryService.getInstance().record("a", 5);
      PlatformTelemetryService.getInstance().record("b", 10);
      const summary = PlatformTelemetryService.getInstance().summary();
      expect(summary["a"].count).toBe(1);
      expect(summary["b"].avgMs).toBe(10);
    });
  });

  // ===== Profiler =====
  describe("Profiler Service", () => {
    beforeEach(() => ProfilerService.getInstance().clear());

    it("should time operations with start/stop", () => {
      ProfilerService.getInstance().startTimer("test");
      const elapsed = ProfilerService.getInstance().stopTimer("test");
      expect(elapsed).toBeGreaterThanOrEqual(0);
    });

    it("should capture and retrieve snapshots", () => {
      ProfilerService.getInstance().captureSnapshot({ bootstrapTimeMs: 42 });
      const latest = ProfilerService.getInstance().getLatestSnapshot();
      expect(latest?.bootstrapTimeMs).toBe(42);
    });

    it("should generate benchmarks from snapshots", () => {
      ProfilerService.getInstance().captureSnapshot({ bootstrapTimeMs: 10, memoryUsageMB: 50 });
      ProfilerService.getInstance().captureSnapshot({ bootstrapTimeMs: 20, memoryUsageMB: 60 });
      const bench = ProfilerService.getInstance().generateBenchmark();
      expect(bench.averageBootstrap).toBe(15);
      expect(bench.averageMemory).toBe(55);
    });
  });

  // ===== Health Monitor =====
  describe("Platform Health Service", () => {
    it("should produce a comprehensive health report", async () => {
      await BootstrapManager.getInstance().initialize();
      const report = PlatformHealthService.getInstance().evaluate();
      expect(report.overall).toBe("healthy");
      expect(report.cache.status).toBe("healthy");
      expect(report.telemetry.status).toBe("healthy");
    });
  });

  // ===== Registry Diagnostics =====
  describe("Registry Diagnostics", () => {
    it("CapabilityRegistry should expose health, statistics, and diagnostics", () => {
      const reg = CapabilityRegistry.getInstance();
      const h = reg.health();
      expect(h.status).toBeDefined();
      expect(reg.statistics().totalPlugins).toBeGreaterThanOrEqual(0);
      const diag = reg.diagnostics();
      expect(diag.health).toBeDefined();
      expect(diag.status).toBeDefined();
      expect(diag.statistics).toBeDefined();
    });
  });

  // ===== Bootstrap Report =====
  describe("Bootstrap Diagnostics", () => {
    it("should produce an enhanced bootstrap report with version and timing fields", () => {
      const report = BootstrapManager.getInstance().generateBootstrapReport();
      expect(report.platformVersion).toBeDefined();
      expect(report.startupTimeMs).toBeGreaterThanOrEqual(0);
      expect(report.warnings).toBeDefined();
      expect(report.errors).toBeDefined();
    });
  });

  // ===== CLI =====
  describe("Developer CLI", () => {
    it("generate should scaffold a plugin", () => {
      const cli = new PluginCLI();
      const result = cli.generate("new-plugin", "New Plugin");
      expect(result.success).toBe(true);
      expect(result.data.id).toBe("new-plugin");
    });

    it("validate should check manifest integrity", () => {
      const cli = new PluginCLI();
      const result = cli.validate({ id: "valid", name: "V", version: "1.0", description: "", author: "", dependencies: [], status: "uninitialized" });
      expect(result.success).toBe(true);
    });

    it("test/build/publish should return success stubs", () => {
      const cli = new PluginCLI();
      expect(cli.test("p").success).toBe(true);
      expect(cli.build("p").success).toBe(true);
      expect(cli.publish("p").success).toBe(true);
    });
  });

  // ===== Backward Compatibility =====
  describe("Backward Compatibility", () => {
    it("PluginManifest new fields should be optional", () => {
      const legacy: PluginManifest = { id: "legacy", name: "L", version: "1.0", description: "", author: "", dependencies: [], status: "loaded" };
      expect(legacy.pluginVersion).toBeUndefined();
      expect(legacy.minimumPlatformVersion).toBeUndefined();
    });

    it("existing PluginStatus values should still compile", () => {
      const statuses: Array<PluginManifest["status"]> = ["uninitialized", "loaded", "failed", "stopped", "error"];
      expect(statuses.length).toBe(5);
    });
  });
});

import { OpenTelemetryProvider } from "../integration/opentelemetry-provider";
import { RuntimeConnector } from "../integration/runtime-connector";
import { HealthAnalysisService } from "../analysis/health-analysis";
import { IncidentAnalysisService } from "../analysis/incident-analysis";
import { PerformanceAnalysisService } from "../analysis/performance-analysis";
import { CapacityAnalysisService } from "../analysis/capacity-analysis";
import { DependencyAnalysisService } from "../analysis/dependency-analysis";
import { ObservabilityAnalysisService } from "../analysis/observability-analysis";
import { RuntimeRecommendationService } from "../analysis/runtime-recommendation-service";
import { RuntimeContextOrchestrator } from "../analysis/runtime-context-orchestrator";
import { PlatformEventBus } from "../core/platform-event-bus";
import { RuntimeModel } from "../../types/runtime";
import { BootstrapManager } from "../core/bootstrap-manager";
import { CapabilityRegistry } from "../core/capability-registry";

let mockRuntime: RuntimeModel;

describe("Platform v3.3 - AI Runtime Intelligence", () => {
  beforeEach(() => {
    PlatformEventBus.getInstance().clearAllListeners();
    mockRuntime = {
      id: "prod-env",
      provider: "OpenTelemetry",
      services: [
        { name: "api", version: "1.0", status: "degraded", replicas: 2, uptime: 1000, availability: 95.0, environment: "prod", deploymentVersion: "v1" },
        { name: "db", version: "1.0", status: "healthy", replicas: 1, uptime: 1000, availability: 100.0, environment: "prod", deploymentVersion: "v1" }
      ],
      deployments: [],
      metrics: { CPU: 85, Memory: 90, Disk: 40, Network: 1000, Latency: 300, P50: 100, P95: 500, P99: 800, ErrorRate: 6, RequestRate: 100, CacheHitRate: 50, QueueDepth: 5 },
      logs: [],
      traces: [{ traceId: "1", spanId: "1", duration: 100, status: "error", service: "api", dependencies: ["db"] }],
      alerts: [{ id: "a1", severity: "high", source: "prom", rule: "CPU High", triggerMetric: "cpu", status: "firing", acknowledged: false, timestamp: "" }],
      incidents: [{ id: "i1", title: "API down", status: "investigating", severity: "SEV-2", startTime: "", affectedServices: ["api"], triggerAlerts: ["a1"] }],
      serviceTopology: { serviceName: "api", upstreamServices: [], downstreamServices: [], databases: ["db"], caches: [], queues: [], externalAPIs: [], regions: [], availabilityZones: [], criticalPaths: [] },
      environment: { environmentName: "prod", environmentType: "production", configurationVersion: "v1", secretStatus: "valid", infrastructureVersion: "v1", deploymentHistory: [], healthStatus: "degraded" },
      history: []
    };
  });

  describe("Providers & Connectors", () => {
    it("OpenTelemetryProvider should fetch and normalize runtime", async () => {
      const provider = new OpenTelemetryProvider();
      const runtime = await provider.fetchRuntimeData("env-1", 60);
      expect(runtime.provider).toBe("OpenTelemetry");
      expect(runtime.services.length).toBeGreaterThan(0);
    });

    it("RuntimeConnector should orchestrate provider and publish events", async () => {
      const connector = new RuntimeConnector(new OpenTelemetryProvider());
      let connectedEvent = false;
      let metricsEvent = false;
      PlatformEventBus.getInstance().subscribe("RuntimeConnected", () => connectedEvent = true);
      PlatformEventBus.getInstance().subscribe("MetricsCollected", () => metricsEvent = true);

      await connector.getRuntimeData("env-1");
      
      expect(connectedEvent).toBe(true);
      expect(metricsEvent).toBe(true);
    });
  });

  describe("Deterministic Analysis Services", () => {
    it("HealthAnalysisService should compute degraded health", () => {
      const service = new HealthAnalysisService();
      const analysis = service.analyze(mockRuntime);

      expect(analysis.deploymentHealth).toBe("degraded");
      expect(analysis.availability).toBe(97.5); // (95 + 100) / 2
    });

    it("IncidentAnalysisService should compute SEV-2 severity", () => {
      const service = new IncidentAnalysisService();
      const analysis = service.analyze(mockRuntime);

      expect(analysis.severity).toBe("SEV-2");
      expect(analysis.affectedServices).toContain("api");
      expect(analysis.businessImpact).toBe("high");
    });

    it("CapacityAnalysisService should recommend scale_up due to high usage", () => {
      const service = new CapacityAnalysisService();
      const analysis = service.analyze(mockRuntime);

      expect(analysis.cpuHeadroom).toBe(15);
      expect(analysis.memoryHeadroom).toBe(10);
      expect(analysis.autoscalingRecommendation).toBe("scale_up");
    });

    it("DependencyAnalysisService should map dependency failures", () => {
      const service = new DependencyAnalysisService();
      const analysis = service.analyze(mockRuntime);

      expect(analysis.failurePropagation).toBe(true);
      expect(analysis.dependencyFailures).toContain("db");
    });

    it("ObservabilityAnalysisService should map error budgets", () => {
      const service = new ObservabilityAnalysisService();
      const analysis = service.analyze(mockRuntime);

      expect(analysis.errorBudgetConsumption).toBe(50);
      expect(analysis.sloCompliance).toBe(false);
    });

    it("RuntimeRecommendationService should consume downstream metrics to produce decision", () => {
      const recService = new RuntimeRecommendationService();
      
      const health = new HealthAnalysisService().analyze(mockRuntime);
      const incident = new IncidentAnalysisService().analyze(mockRuntime);
      const perf = new PerformanceAnalysisService().analyze(mockRuntime);
      const capacity = new CapacityAnalysisService().analyze(mockRuntime);
      const dep = new DependencyAnalysisService().analyze(mockRuntime);
      const obs = new ObservabilityAnalysisService().analyze(mockRuntime);

      const rec = recService.generate(health, incident, perf, capacity, dep, obs);
      expect(rec.severity).toBe("critical"); // Because of SEV-2 incident
      expect(rec.incidentPriority).toBe("P2");
      expect(rec.nextActions[0]).toContain("declare incident");
    });
  });

  describe("Context Orchestration", () => {
    it("RuntimeContextOrchestrator should aggregate the runtime and fire events", async () => {
      const orchestrator = new RuntimeContextOrchestrator();
      
      let contextCreatedEvent = false;
      PlatformEventBus.getInstance().subscribe("RuntimeContextCreated", () => contextCreatedEvent = true);

      const context = await orchestrator.orchestrate(mockRuntime);
      
      expect(context.runtimeModel.id).toBe("prod-env");
      expect(context.healthAnalysis.deploymentHealth).toBe("degraded");
      expect(contextCreatedEvent).toBe(true);
    });
  });

  describe("Plugin Registration", () => {
    it("BootstrapManager should dynamically load Runtime plugins", async () => {
      const bootstrap = BootstrapManager.getInstance();
      await bootstrap.initialize();

      const capReg = CapabilityRegistry.getInstance();
      expect(capReg.exists("analyze_runtime")).toBe(true);
    });
  });
});

import { GitHubActionsProvider } from "../integration/github-actions-provider";
import { PipelineConnector } from "../integration/pipeline-connector";
import { PipelineAnalysisService } from "../analysis/pipeline-analysis";
import { QualityGateService } from "../analysis/quality-gate-service";
import { ArtifactAnalysisService } from "../analysis/artifact-analysis";
import { DeploymentRiskService } from "../analysis/deployment-risk-service";
import { ReleaseValidationService } from "../analysis/release-validation";
import { PipelineRecommendationService } from "../analysis/pipeline-recommendation-service";
import { PipelineContextOrchestrator } from "../analysis/pipeline-context-orchestrator";
import { PlatformEventBus } from "../core/platform-event-bus";
import { PipelineModel } from "../../types/pipeline";
import { BootstrapManager } from "../core/bootstrap-manager";
import { CapabilityRegistry } from "../core/capability-registry";

const mockPipeline: PipelineModel = {
  id: "gh-run-123",
  provider: "GitHubActions",
  workflow: "CI/CD",
  trigger: "push",
  status: "success",
  branch: "main",
  commit: "abcdef",
  duration: 100000,
  queueTime: 2000,
  stages: [
    { name: "build", status: "success", duration: 40000, retryCount: 0, parallel: false, logs: "" },
    { name: "test", status: "success", duration: 50000, retryCount: 1, parallel: true, logs: "" }, // Flaky test
    { name: "security_scan", status: "success", duration: 10000, retryCount: 0, parallel: true, logs: "" }
  ],
  artifacts: [{ artifactName: "dist", version: "1.0.0", checksum: "abc", size: 100, buildTimestamp: "", sourceCommit: "", storageLocation: "", signed: true, SBOMAvailable: true }],
  deployments: [{ target: "prod", status: "success", strategy: "Rolling", rollbackAvailable: true, approvalStatus: "approved" }],
  history: [{ runId: "prev-1", status: "failed", duration: 90000, date: "" }, { runId: "prev-2", status: "success", duration: 105000, date: "" }]
};

describe("Platform v3.2 - AI CI/CD Intelligence", () => {
  beforeAll(() => {
    PlatformEventBus.getInstance()["subscribers"] = {};
  });

  describe("Providers & Connectors", () => {
    it("GitHubActionsProvider should fetch and normalize pipeline", async () => {
      const provider = new GitHubActionsProvider();
      const pipeline = await provider.fetchPipelineRun("repo", "123");
      expect(pipeline.provider).toBe("GitHubActions");
      expect(pipeline.stages.length).toBeGreaterThan(0);
    });

    it("PipelineConnector should orchestrate provider and publish events", async () => {
      const connector = new PipelineConnector(new GitHubActionsProvider());
      let startedEvent = false;
      let fetchedEvent = false;
      PlatformEventBus.getInstance().subscribe("PipelineStarted", () => startedEvent = true);
      PlatformEventBus.getInstance().subscribe("PipelineFetched", () => fetchedEvent = true);

      await connector.getPipeline("repo", "123");
      
      expect(startedEvent).toBe(true);
      expect(fetchedEvent).toBe(true);
    });
  });

  describe("Deterministic Analysis Services", () => {
    it("PipelineAnalysisService should compute history, duration, and flakiness", () => {
      const service = new PipelineAnalysisService();
      const analysis = service.analyze(mockPipeline);

      expect(analysis.flakyJobs).toContain("test"); // Due to retryCount = 1 and status = success
      expect(analysis.stageSuccessRate).toBe(100);
      expect(analysis.historicalSuccessRate).toBe(50); // 1 success, 1 fail in history
    });

    it("QualityGateService should deterministically evaluate test and security states", () => {
      const service = new QualityGateService();
      const gate = service.evaluate(mockPipeline);

      expect(gate.status).toBe("passed");
      expect(gate.unitTests).toBe("passed");
      expect(gate.securityScan).toBe("passed");
      expect(gate.coverage).toBe(85);
    });

    it("ArtifactAnalysisService should validate integrity and SBOM", () => {
      const service = new ArtifactAnalysisService();
      const analysis = service.analyze(mockPipeline);

      expect(analysis.artifactIntegrity).toBe(true);
      expect(analysis.sbomAvailability).toBe(true);
      expect(analysis.missingArtifacts.length).toBe(0);
    });

    it("DeploymentRiskService should reuse PR context to identify risk", () => {
      const service = new DeploymentRiskService();
      // Test without PR context
      const riskWithoutPR = service.compute(mockPipeline);
      expect(riskWithoutPR.deploymentRisk).toBe("low");

      // Test with mocked PR context indicating breaking changes
      const riskWithPR = service.compute(mockPipeline, {
        diffAnalysis: { breakingChanges: [{ filename: "api.ts" } as any], categories: { database: [], infrastructure: [] } }
      } as any);
      expect(riskWithPR.deploymentRisk).toBe("high");
      expect(riskWithPR.apiCompatibility).toBe("breaking");
    });

    it("ReleaseValidationService should validate approvals and rollbacks", () => {
      const service = new ReleaseValidationService();
      const validation = service.validate(mockPipeline);
      
      expect(validation.missingApprovals.length).toBe(0);
      expect(validation.missingRollbackPlan).toBe(false);
      expect(validation.releaseReadiness).toBe("conditionally_ready"); // Due to default missingRunbook
    });

    it("PipelineRecommendationService should consume downstream metrics to produce decision", () => {
      const recService = new PipelineRecommendationService();
      
      const analysis = new PipelineAnalysisService().analyze(mockPipeline);
      const gate = new QualityGateService().evaluate(mockPipeline);
      const artifact = new ArtifactAnalysisService().analyze(mockPipeline);
      const risk = new DeploymentRiskService().compute(mockPipeline);
      const release = new ReleaseValidationService().validate(mockPipeline);

      const rec = recService.generate(analysis, gate, artifact, risk, release);
      expect(rec.decision).toBe("proceed");
      expect(rec.warnings).toContain("Flaky jobs detected: test");
    });
  });

  describe("Context Orchestration", () => {
    it("PipelineContextOrchestrator should aggregate the pipeline and fire events", async () => {
      const orchestrator = new PipelineContextOrchestrator();
      
      let contextCreatedEvent = false;
      PlatformEventBus.getInstance().subscribe("PipelineContextCreated", () => contextCreatedEvent = true);

      const context = await orchestrator.orchestrate(mockPipeline);
      
      expect(context.pipelineModel.id).toBe("gh-run-123");
      expect(context.qualityGate.status).toBe("passed");
      expect(contextCreatedEvent).toBe(true);
    });
  });

  describe("Plugin Registration", () => {
    it("BootstrapManager should dynamically load Pipeline plugins", async () => {
      const bootstrap = BootstrapManager.getInstance();
      await bootstrap.initialize();

      const capReg = CapabilityRegistry.getInstance();
      expect(capReg.exists("analyze_pipeline")).toBe(true);
    });
  });
});

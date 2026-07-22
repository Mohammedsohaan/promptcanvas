import { GitHubProvider } from "../integration/github-provider";
import { PullRequestConnector } from "../integration/pull-request-connector";
import { DiffAnalysisService } from "../analysis/diff-analysis";
import { ImpactAnalysisService } from "../analysis/impact-analysis";
import { MergeReadinessService } from "../analysis/merge-readiness";
import { ReviewRecommendationService } from "../analysis/review-recommendation";
import { PullRequestAnalysisService } from "../analysis/pull-request-analysis";
import { PullRequestReviewPromptBuilder } from "../../lib/prompts/pull-request-review";
import { PlatformEventBus } from "../core/platform-event-bus";
import { RepositoryDiff } from "../../types/repository-diff";
import { BootstrapManager } from "../core/bootstrap-manager";
import { CapabilityRegistry } from "../core/capability-registry";
import { ConnectorRegistry } from "../core/connector-registry";

const mockDiff: RepositoryDiff = {
  metadata: { id: "gh-1", url: "url", createdAt: "", updatedAt: "", title: "Test PR", description: "" },
  author: { login: "test" },
  reviewers: [],
  branch: "feat/test",
  baseBranch: "main",
  headBranch: "feat/test",
  commits: [],
  labels: [],
  mergeStatus: "mergeable",
  reviewStatus: "none",
  statistics: { filesChanged: 3, insertions: 100, deletions: 20 },
  addedFiles: [{ filename: "api/user.ts", status: "added", additions: 50, deletions: 0 }],
  modifiedFiles: [{ filename: "package.json", status: "modified", additions: 2, deletions: 1 }],
  deletedFiles: [],
  renamedFiles: [],
  patches: []
};

describe("Platform v3.1 - AI Pull Request Intelligence", () => {
  beforeEach(() => {
    // Reset event bus listeners
    PlatformEventBus.getInstance().clearAllListeners();
  });

  describe("Integration & Providers", () => {
    it("GitHubProvider should return normalized RepositoryDiff", async () => {
      const provider = new GitHubProvider();
      expect(provider.name()).toBe("GitHub");
      const diff = await provider.fetchPullRequest("test/repo", "123");
      expect(diff.metadata.id).toBe("gh-123");
      expect(diff.branch).toBe("feature/mock-pr");
    });

    it("PullRequestConnector should orchestrate provider and publish event", async () => {
      const connector = new PullRequestConnector(new GitHubProvider());
      let eventFired = false;
      PlatformEventBus.getInstance().subscribe("RepositoryDiffCreated", (data) => {
        if (data.prId === "123") eventFired = true;
      });

      const diff = await connector.getRepositoryDiff("test/repo", "123");
      expect(diff).toBeDefined();
      expect(eventFired).toBe(true);
    });
  });

  describe("Deterministic Services", () => {
    it("DiffAnalysisService should categorize files correctly", () => {
      const service = new DiffAnalysisService();
      const analysis = service.analyze(mockDiff);

      expect(analysis.categories.api.length).toBe(1);
      expect(analysis.categories.api[0].filename).toBe("api/user.ts");
      expect(analysis.categories.dependencies.length).toBe(1);
      expect(analysis.dependencyUpgrades.length).toBe(1);
      expect(analysis.breakingChanges.length).toBe(0);
    });

    it("ImpactAnalysisService should determine impacted APIs and downstream artifacts", async () => {
      const diffService = new DiffAnalysisService();
      const analysis = diffService.analyze(mockDiff);
      
      const service = new ImpactAnalysisService();
      const impact = await service.analyze(analysis, {});

      expect(impact.impactedAPIs).toContain("api/user.ts");
      // Because API was touched but no tests were added, missing downstream should trigger
      expect(impact.missingDownstreamArtifacts).toContain("API Tests");
    });

    it("MergeReadinessService should compute risk and complexity deterministically", async () => {
      const diffService = new DiffAnalysisService();
      const diffAnalysis = diffService.analyze(mockDiff);
      const impactService = new ImpactAnalysisService();
      const impactAnalysis = await impactService.analyze(diffAnalysis, {});
      
      const service = new MergeReadinessService();
      const readiness = await service.compute(diffAnalysis, impactAnalysis);

      expect(readiness.riskScore).toBeGreaterThan(0); // Because of missing downstream artifacts
      expect(readiness.warnings).toContain("Missing downstream artifacts: API Tests");
      expect(readiness.reviewComplexity).toBe("low");
    });

    it("ReviewRecommendationService should consume readiness and impact to produce decision", async () => {
      const diffService = new DiffAnalysisService();
      const diffAnalysis = diffService.analyze(mockDiff);
      const impactService = new ImpactAnalysisService();
      const impactAnalysis = await impactService.analyze(diffAnalysis, {});
      const mergeService = new MergeReadinessService();
      const mergeReadiness = await mergeService.compute(diffAnalysis, impactAnalysis);
      
      const service = new ReviewRecommendationService();
      const rec = service.generate(mergeReadiness, impactAnalysis);

      expect(rec.decision).toBe("comment");
      expect(rec.nextActions).toContain("Add missing artifacts: API Tests");
    });
  });

  describe("Orchestration & Context", () => {
    it("PullRequestAnalysisService should orchestrate entire pipeline and return context", async () => {
      const service = new PullRequestAnalysisService();
      
      let contextCreatedEvent = false;
      PlatformEventBus.getInstance().subscribe("PullRequestContextCreated", () => {
        contextCreatedEvent = true;
      });

      const context = await service.analyze(mockDiff);
      expect(context.repositoryDiff).toEqual(mockDiff);
      expect(context.reviewMetrics.totalFiles).toBe(2); // 1 added + 1 modified in mockDiff
      expect(contextCreatedEvent).toBe(true);
    });
  });

  describe("AI Boundary", () => {
    it("PullRequestReviewPromptBuilder should consume deterministic context to build prompt", async () => {
      const service = new PullRequestAnalysisService();
      const context = await service.analyze(mockDiff);
      
      const builder = new PullRequestReviewPromptBuilder();
      const prompt = builder.buildPrompt(context);

      expect(prompt).toContain("Risk Score: 10"); // Calculated strictly
      expect(prompt).toContain("COMMENT"); // Decision
      expect(prompt).toContain("API Tests"); // Missing work
      expect(prompt).toContain("Executive Summary"); // Required generation structure
    });
  });

  describe("Plugin Registration", () => {
    it("BootstrapManager should load PullRequest plugins dynamically", async () => {
      // Clear capability registry to test bootstrap loading specifically
      const capReg = CapabilityRegistry.getInstance();
      const connReg = ConnectorRegistry.getInstance();
      
      const bootstrap = BootstrapManager.getInstance();
      await bootstrap.initialize();

      expect(capReg.exists("analyze_pull_request")).toBe(true);
      expect(connReg.resolve("GitHubPullRequest")).toBeDefined();
    });
  });
});

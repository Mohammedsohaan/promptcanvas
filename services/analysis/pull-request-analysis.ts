import { PullRequestContext } from "../../types/pull-request";
import { RepositoryDiff } from "../../types/repository-diff";
import { DiffAnalysisService } from "./diff-analysis";
import { ImpactAnalysisService } from "./impact-analysis";
import { MergeReadinessService } from "./merge-readiness";
import { ReviewRecommendationService } from "./review-recommendation";
import { PlatformEventBus } from "../core/platform-event-bus";

/**
 * PullRequestAnalysisService orchestrates only.
 * It never computes directly and delegates to the deterministic pipeline.
 */
export class PullRequestAnalysisService {
  private diffAnalysisService = new DiffAnalysisService();
  private impactAnalysisService = new ImpactAnalysisService();
  private mergeReadinessService = new MergeReadinessService();
  private reviewRecommendationService = new ReviewRecommendationService();

  public async analyze(repositoryDiff: RepositoryDiff): Promise<PullRequestContext> {
    const eventBus = PlatformEventBus.getInstance();
    
    // 1. Diff Analysis
    const diffAnalysis = this.diffAnalysisService.analyze(repositoryDiff);
    
    // 2. Mocking existing contexts for orchestration flow
    const repositoryAnalysis = { status: "scanned" };
    const architectureContext = { currentArchitecture: "microservices" };
    const releaseContext = { targetVersion: "v1.1.0" };
    const traceabilityContext = { mapped: true };
    const semanticContext = { hits: 5 };

    // 3. Impact Analysis
    const impactAnalysis = await this.impactAnalysisService.analyze(diffAnalysis, repositoryAnalysis);

    // 4. Merge Readiness
    const mergeReadiness = await this.mergeReadinessService.compute(diffAnalysis, impactAnalysis);

    // 5. Review Recommendation
    const reviewRecommendation = this.reviewRecommendationService.generate(mergeReadiness, impactAnalysis);

    const context: PullRequestContext = {
      metadata: {
        analyzedAt: new Date().toISOString(),
        version: "1.0.0"
      },
      repositoryDiff,
      diffAnalysis,
      impactAnalysis,
      mergeReadiness,
      reviewRecommendation,
      repositoryAnalysis,
      architectureContext,
      releaseContext,
      traceabilityContext,
      semanticContext,
      reviewMetrics: {
        totalFiles: repositoryDiff.addedFiles.length + repositoryDiff.modifiedFiles.length + repositoryDiff.deletedFiles.length + repositoryDiff.renamedFiles.length,
        riskScore: mergeReadiness.riskScore,
        complexity: mergeReadiness.reviewComplexity,
        estimatedTime: mergeReadiness.estimatedReviewMinutes,
        testCoverageImpact: mergeReadiness.testCoverageDelta,
        churnRate: mergeReadiness.codeChurn
      }
    };

    eventBus.publish("PullRequestContextCreated", { contextId: context.metadata.analyzedAt });
    eventBus.publish("PullRequestAnalyzed", { context });
    
    return context;
  }
}

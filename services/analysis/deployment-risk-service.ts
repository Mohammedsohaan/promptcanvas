import { PipelineModel } from "../../types/pipeline";
import { DeploymentRisk } from "../../types/pipeline-context";
import { RepositoryDiff } from "../../types/repository-diff";
import { PullRequestContext } from "../../types/pull-request";
import { PlatformEventBus } from "../core/platform-event-bus";

/**
 * Reuses contexts computed by PR Intelligence (if available) to evaluate deployment risk.
 */
export class DeploymentRiskService {
  public compute(pipeline: PipelineModel, prContext?: PullRequestContext): DeploymentRisk {
    const risk: DeploymentRisk = {
      deploymentRisk: "low",
      rollbackRisk: "low",
      databaseMigrationRisk: "not_applicable",
      apiCompatibility: "unknown",
      configurationDrift: false,
      infrastructureDrift: false,
      environmentDrift: false,
      dependencyRisk: "low"
    };

    if (prContext && prContext.diffAnalysis) {
      if (prContext.diffAnalysis.categories.database.length > 0) {
        risk.databaseMigrationRisk = "high";
        risk.deploymentRisk = "medium";
      }
      if (prContext.diffAnalysis.breakingChanges.length > 0) {
        risk.apiCompatibility = "breaking";
        risk.deploymentRisk = "high";
      }
      if (prContext.diffAnalysis.categories.infrastructure.length > 0) {
        risk.infrastructureDrift = true;
      }
    }

    PlatformEventBus.getInstance().publish("DeploymentRiskComputed", { pipelineId: pipeline.id, risk });
    return risk;
  }
}

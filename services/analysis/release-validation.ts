import { PipelineModel } from "../../types/pipeline";
import { ReleaseValidation } from "../../types/pipeline-context";
import { PlatformEventBus } from "../core/platform-event-bus";
// import { ReleaseContextService } from "../release-context";

/**
 * Validates release readiness deterministically.
 */
export class ReleaseValidationService {
  public validate(pipeline: PipelineModel, releaseContext?: any): ReleaseValidation {
    const deployment = pipeline.deployments[0]; // simplistic assumption for single target

    const validation: ReleaseValidation = {
      releaseReadiness: "ready",
      missingApprovals: [],
      missingRollbackPlan: deployment ? !deployment.rollbackAvailable : true,
      missingDocumentation: false,
      missingTests: false,
      missingMonitoring: false,
      missingAlerting: false,
      missingRunbook: true, // Simulate missing runbook as default
    };

    if (deployment && deployment.approvalStatus === "pending") {
      validation.missingApprovals.push("Production Deployment Approval");
      validation.releaseReadiness = "not_ready";
    }

    if (validation.missingRollbackPlan || validation.missingRunbook) {
      if (validation.releaseReadiness !== "not_ready") {
        validation.releaseReadiness = "conditionally_ready";
      }
    }

    PlatformEventBus.getInstance().publish("ReleaseValidated", { pipelineId: pipeline.id, validation });
    return validation;
  }
}

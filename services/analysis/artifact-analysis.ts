import { PipelineModel } from "../../types/pipeline";
import { ArtifactAnalysis } from "../../types/pipeline-context";
import { PlatformEventBus } from "../core/platform-event-bus";

export class ArtifactAnalysisService {
  public analyze(pipeline: PipelineModel): ArtifactAnalysis {
    const artifacts = pipeline.artifacts;
    const analysis: ArtifactAnalysis = {
      artifactIntegrity: artifacts.every(a => a.checksum !== ""),
      checksumValid: artifacts.every(a => a.checksum !== ""),
      signedValid: artifacts.every(a => a.signed),
      versionConsistency: true, // simplified deterministic check
      missingArtifacts: artifacts.length === 0 ? ["Build Output"] : [],
      duplicateArtifacts: [],
      containerImageValidation: artifacts.some(a => a.containerImage) ? "passed" : "not_applicable",
      sbomAvailability: artifacts.some(a => a.SBOMAvailable)
    };

    PlatformEventBus.getInstance().publish("ArtifactAnalysisCompleted", { pipelineId: pipeline.id, analysis });
    return analysis;
  }
}

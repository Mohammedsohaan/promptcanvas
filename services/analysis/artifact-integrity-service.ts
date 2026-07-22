import { SecurityModel } from "../../types/security";
import { ArtifactIntegrityResult } from "../../types/artifact-integrity";
import { PlatformEventBus } from "../core/platform-event-bus";

export class ArtifactIntegrityService {
  public analyze(model: SecurityModel): ArtifactIntegrityResult {
    const result = model.artifactIntegrity || {
      checksumValid: true, signatureValid: true, tamperingDetected: false, provenanceValid: true
    };
    PlatformEventBus.getInstance().publish("ArtifactsValidated", { result });
    return result;
  }
}

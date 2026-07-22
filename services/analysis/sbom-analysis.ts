import { SecurityModel } from "../../types/security";
import { SBOMAnalysisResult } from "../../types/security-context";
import { PlatformEventBus } from "../core/platform-event-bus";

export class SBOMAnalysisService {
  public analyze(model: SecurityModel): SBOMAnalysisResult {
    const sbom = model.sbom;
    if (!sbom) {
      return { missingComponents: ["SBOM not generated"], versionDrift: false, unsignedPackages: 0, supplyChainRisk: "high" };
    }

    const unsignedPackages = sbom.components.filter(c => !c.signed).length;
    const supplyChainRisk: SBOMAnalysisResult["supplyChainRisk"] =
      unsignedPackages > 2 ? "high" : unsignedPackages > 0 ? "medium" : "low";

    const result: SBOMAnalysisResult = {
      missingComponents: [],
      versionDrift: false,
      unsignedPackages,
      supplyChainRisk
    };

    PlatformEventBus.getInstance().publish("SBOMAnalyzed", { result });
    return result;
  }
}

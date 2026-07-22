import { SecurityModel } from "../../types/security";
import { SecretAnalysisResult } from "../../types/security-context";
import { PlatformEventBus } from "../core/platform-event-bus";

export class SecretAnalysisService {
  public analyze(model: SecurityModel): SecretAnalysisResult {
    const secretFindings = model.findings.filter(f => f.type === "secret");
    const apiKeys = secretFindings.filter(f => f.title.toLowerCase().includes("api key")).length;
    const passwords = secretFindings.filter(f => f.title.toLowerCase().includes("password")).length;
    const privateKeys = secretFindings.filter(f => f.title.toLowerCase().includes("private key")).length;
    const tokens = secretFindings.filter(f => f.title.toLowerCase().includes("token")).length;
    const total = secretFindings.length;

    let leakSeverity: SecretAnalysisResult["leakSeverity"] = "none";
    if (secretFindings.some(f => f.severity === "critical")) leakSeverity = "critical";
    else if (secretFindings.some(f => f.severity === "high")) leakSeverity = "high";
    else if (total > 0) leakSeverity = "medium";

    const result: SecretAnalysisResult = {
      hardcodedSecrets: total,
      apiKeys,
      passwords,
      privateKeys,
      tokens,
      credentialExposures: secretFindings,
      leakSeverity
    };

    PlatformEventBus.getInstance().publish("SecretsAnalyzed", { result });
    return result;
  }
}

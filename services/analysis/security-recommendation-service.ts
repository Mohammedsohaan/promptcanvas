import { SecurityRisk } from "../../types/security-risk";
import { SecurityRecommendation } from "../../types/security-recommendation";
import { SecretAnalysisResult, PolicyComplianceResult } from "../../types/security-context";
import { ContainerSecurityResult } from "../../types/container-security";
import { PlatformEventBus } from "../core/platform-event-bus";

export class SecurityRecommendationService {
  public generate(
    risk: SecurityRisk,
    secrets: SecretAnalysisResult,
    containers: ContainerSecurityResult,
    compliance: PolicyComplianceResult
  ): SecurityRecommendation {
    const immediateActions: string[] = [];
    const remediationSteps: string[] = [];
    const longTermImprovements: string[] = [];

    if (secrets.leakSeverity === "critical" || secrets.leakSeverity === "high") {
      immediateActions.push("Rotate all exposed credentials immediately.");
      remediationSteps.push("Migrate secrets to a secrets manager (Vault, AWS Secrets Manager).");
    }

    if (containers.rootContainers) {
      immediateActions.push("Remediate root container images.");
      remediationSteps.push("Add USER directive to all Dockerfiles.");
    }

    if (containers.privilegeEscalation) {
      remediationSteps.push("Review container security contexts and drop elevated privileges.");
    }

    if (compliance.overallCompliance === "non_compliant") {
      remediationSteps.push("Resolve all failing enforced security policies.");
    }

    if (risk.overallRiskScore >= 50) {
      longTermImprovements.push("Implement automated security scanning in CI/CD pipeline.");
      longTermImprovements.push("Establish regular dependency audit cadence.");
    }

    longTermImprovements.push("Enable SBOM generation and artifact signing.");

    const priority: SecurityRecommendation["priority"] =
      risk.overallRiskScore >= 70 ? "P1" : risk.overallRiskScore >= 50 ? "P2" : risk.overallRiskScore >= 25 ? "P3" : "P4";

    const deploymentRecommendation: SecurityRecommendation["deploymentRecommendation"] =
      risk.overallRiskScore >= 70 ? "block" : risk.overallRiskScore >= 40 ? "proceed_with_caution" : "safe";

    const result: SecurityRecommendation = {
      priority,
      immediateActions,
      remediationSteps,
      longTermImprovements,
      deploymentRecommendation
    };

    PlatformEventBus.getInstance().publish("SecurityRecommendationGenerated", { result });
    return result;
  }
}

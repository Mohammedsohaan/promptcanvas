import { SecretAnalysisResult, DependencySecurityResult, SBOMAnalysisResult, RuntimeThreatResult, PolicyComplianceResult } from "../../types/security-context";
import { Vulnerability } from "../../types/vulnerability";
import { ContainerSecurityResult } from "../../types/container-security";
import { ArtifactIntegrityResult } from "../../types/artifact-integrity";
import { SecurityRisk } from "../../types/security-risk";
import { PlatformEventBus } from "../core/platform-event-bus";

export class SecurityRiskService {
  public compute(
    secrets: SecretAnalysisResult,
    deps: DependencySecurityResult,
    vulns: Vulnerability[],
    sbom: SBOMAnalysisResult,
    artifacts: ArtifactIntegrityResult,
    containers: ContainerSecurityResult,
    threats: RuntimeThreatResult,
    compliance: PolicyComplianceResult
  ): SecurityRisk {
    let score = 0;
    const riskFactors: string[] = [];

    // Secret leaks
    if (secrets.leakSeverity === "critical") { score += 30; riskFactors.push("Critical secret exposure"); }
    else if (secrets.leakSeverity === "high") { score += 20; riskFactors.push("High-severity secret leak"); }

    // Vulnerabilities
    const criticalVulns = vulns.filter(v => v.severity === "critical").length;
    if (criticalVulns > 0) { score += 25; riskFactors.push(`${criticalVulns} critical vulnerabilities`); }
    if (deps.knownVulnerabilities > 3) { score += 10; riskFactors.push("High dependency vulnerability count"); }

    // Container
    if (containers.rootContainers) { score += 10; riskFactors.push("Root containers detected"); }
    if (containers.privilegeEscalation) { score += 10; riskFactors.push("Privilege escalation possible"); }

    // Artifacts
    if (!artifacts.signatureValid) { score += 5; riskFactors.push("Unsigned artifact"); }
    if (artifacts.tamperingDetected) { score += 20; riskFactors.push("Artifact tampering detected"); }

    // SBOM
    if (sbom.supplyChainRisk === "high" || sbom.supplyChainRisk === "critical") { score += 10; riskFactors.push("Supply chain risk"); }

    // Runtime threats
    if (threats.threatLevel === "high" || threats.threatLevel === "critical") { score += 15; riskFactors.push("Active runtime threats"); }

    // Policy
    if (compliance.overallCompliance === "non_compliant") { score += 10; riskFactors.push("Policy non-compliance"); }

    score = Math.min(score, 100);

    const toLevel = (s: number): "critical" | "high" | "medium" | "low" =>
      s >= 70 ? "critical" : s >= 50 ? "high" : s >= 25 ? "medium" : "low";

    const result: SecurityRisk = {
      overallRiskScore: score,
      businessRisk: toLevel(score),
      technicalRisk: toLevel(score),
      deploymentRisk: toLevel(Math.min(score + (containers.rootContainers ? 10 : 0), 100)),
      riskFactors
    };

    PlatformEventBus.getInstance().publish("SecurityRiskComputed", { result });
    return result;
  }
}

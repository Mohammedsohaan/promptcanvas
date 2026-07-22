import { SecurityModel } from "../../types/security";
import { SecurityContext } from "../../types/security-context";
import { RuntimeContext } from "../../types/runtime-context";
import { PipelineContext } from "../../types/pipeline-context";
import { PlatformEventBus } from "../core/platform-event-bus";

import { SecretAnalysisService } from "./secret-analysis";
import { DependencySecurityService } from "./dependency-security";
import { VulnerabilityAnalysisService } from "./vulnerability-analysis";
import { SBOMAnalysisService } from "./sbom-analysis";
import { ArtifactIntegrityService } from "./artifact-integrity-service";
import { ContainerSecurityService } from "./container-security-service";
import { RuntimeThreatAnalysisService } from "./runtime-threat-analysis";
import { PolicyComplianceService } from "./policy-compliance";
import { SecurityRiskService } from "./security-risk-service";
import { SecurityRecommendationService } from "./security-recommendation-service";

export class SecurityContextOrchestrator {
  private secretService = new SecretAnalysisService();
  private depService = new DependencySecurityService();
  private vulnService = new VulnerabilityAnalysisService();
  private sbomService = new SBOMAnalysisService();
  private artifactService = new ArtifactIntegrityService();
  private containerService = new ContainerSecurityService();
  private threatService = new RuntimeThreatAnalysisService();
  private policyService = new PolicyComplianceService();
  private riskService = new SecurityRiskService();
  private recService = new SecurityRecommendationService();

  public async orchestrate(
    security: SecurityModel,
    runtimeContext?: RuntimeContext,
    pipelineContext?: PipelineContext
  ): Promise<SecurityContext> {
    const secretAnalysis = this.secretService.analyze(security);
    const dependencySecurity = this.depService.analyze(security);
    const vulnerabilities = this.vulnService.analyze(security);
    const sbomAnalysis = this.sbomService.analyze(security);
    const artifactIntegrity = this.artifactService.analyze(security);
    const containerSecurity = this.containerService.analyze(security);
    const runtimeThreats = this.threatService.analyze(runtimeContext);
    const policyCompliance = this.policyService.evaluate(security);

    const securityRisk = this.riskService.compute(
      secretAnalysis, dependencySecurity, vulnerabilities, sbomAnalysis,
      artifactIntegrity, containerSecurity, runtimeThreats, policyCompliance
    );

    const securityRecommendation = this.recService.generate(
      securityRisk, secretAnalysis, containerSecurity, policyCompliance
    );

    const context: SecurityContext = {
      metadata: { analyzedAt: new Date().toISOString(), version: "3.4.0" },
      securityModel: security,
      secretAnalysis,
      dependencySecurity,
      vulnerabilities,
      sbomAnalysis,
      artifactIntegrity,
      containerSecurity,
      runtimeThreats,
      policyCompliance,
      securityRisk,
      securityRecommendation,
      repositoryDiff: pipelineContext?.repositoryDiff,
      pullRequestContext: pipelineContext?.pullRequestContext,
      pipelineContext,
      runtimeContext
    };

    PlatformEventBus.getInstance().publish("SecurityContextCreated", { context });
    return context;
  }
}

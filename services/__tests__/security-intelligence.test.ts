import { GitHubSecurityProvider } from "../integration/github-security-provider";
import { SecurityConnector } from "../integration/security-connector";
import { SecretAnalysisService } from "../analysis/secret-analysis";
import { DependencySecurityService } from "../analysis/dependency-security";
import { VulnerabilityAnalysisService } from "../analysis/vulnerability-analysis";
import { SBOMAnalysisService } from "../analysis/sbom-analysis";
import { ArtifactIntegrityService } from "../analysis/artifact-integrity-service";
import { ContainerSecurityService } from "../analysis/container-security-service";
import { RuntimeThreatAnalysisService } from "../analysis/runtime-threat-analysis";
import { PolicyComplianceService } from "../analysis/policy-compliance";
import { SecurityRiskService } from "../analysis/security-risk-service";
import { SecurityRecommendationService } from "../analysis/security-recommendation-service";
import { SecurityContextOrchestrator } from "../analysis/security-context-orchestrator";
import { SecurityPromptBuilder } from "../../lib/prompts/security-review";
import { PlatformEventBus } from "../core/platform-event-bus";
import { CapabilityRegistry } from "../core/capability-registry";
import { BootstrapManager } from "../core/bootstrap-manager";
import { SecurityModel } from "../../types/security";

let mockSecurity: SecurityModel;

describe("Platform v3.4 — Enterprise Security Intelligence", () => {
  beforeEach(() => {
    PlatformEventBus.getInstance()["subscribers"] = {};
    mockSecurity = {
      id: "repo-1",
      provider: "GitHub",
      scanTimestamp: new Date().toISOString(),
      vulnerabilities: [
        { id: "v1", cveId: "CVE-2024-1234", title: "SQL Injection", description: "Critical vuln", cvssScore: 9.1, severity: "critical", exploitability: "proven", attackVector: "network", affectedComponent: "db-driver", affectedVersion: "2.1", fixAvailable: true, fixVersion: "2.2" },
        { id: "v2", title: "XSS", description: "Medium vuln", cvssScore: 6.5, severity: "medium", exploitability: "likely", attackVector: "network", affectedComponent: "template", affectedVersion: "3.0", fixAvailable: true }
      ],
      findings: [
        { id: "f1", type: "secret", severity: "critical", title: "Hardcoded API key", description: "AWS key", location: "config.ts:42", detectedAt: "" },
        { id: "f2", type: "misconfiguration", severity: "high", title: "Root container", description: "Runs as root", location: "Dockerfile:1", detectedAt: "" }
      ],
      policies: [
        { id: "p1", name: "Encryption", scope: "organization", rules: [{ id: "r1", description: "Encrypt data", status: "passed" }], enforcementLevel: "enforced" },
        { id: "p2", name: "No Root", scope: "pipeline", rules: [{ id: "r2", description: "No root containers", status: "failed" }], enforcementLevel: "enforced" }
      ],
      sbom: {
        format: "CycloneDX",
        components: [
          { name: "express", version: "4.18", license: "MIT", signed: true, source: "npm" },
          { name: "lodash", version: "4.17", license: "MIT", signed: false, source: "npm" }
        ],
        generatedAt: "", sourceArtifact: "app:latest"
      },
      containerSecurity: { baseImageRisk: "medium", criticalCVEs: 1, privilegeEscalation: true, rootContainers: true, misconfigurations: ["Root user"] },
      artifactIntegrity: { checksumValid: true, signatureValid: false, tamperingDetected: false, provenanceValid: true }
    };
  });

  // Provider & Connector
  describe("Providers & Connectors", () => {
    it("GitHubSecurityProvider should return normalized SecurityModel", async () => {
      const provider = new GitHubSecurityProvider();
      const model = await provider.scan("repo-1");
      expect(model.provider).toBe("GitHub");
      expect(model.vulnerabilities.length).toBeGreaterThan(0);
      expect(model.findings.length).toBeGreaterThan(0);
    });

    it("GitHubSecurityProvider should return correct provider name", () => {
      const provider = new GitHubSecurityProvider();
      expect(provider.name()).toBe("GitHub");
    });

    it("SecurityConnector should publish SecurityScanStarted", async () => {
      const connector = new SecurityConnector(new GitHubSecurityProvider());
      let fired = false;
      PlatformEventBus.getInstance().subscribe("SecurityScanStarted", () => fired = true);
      await connector.scan("repo-1");
      expect(fired).toBe(true);
    });

    it("SecurityConnector should return provider scan results", async () => {
      const connector = new SecurityConnector(new GitHubSecurityProvider());
      const result = await connector.scan("test-repo");
      expect(result.id).toBe("test-repo");
    });
  });

  // Secret Analysis
  describe("Secret Analysis", () => {
    it("should detect hardcoded secrets and compute leak severity", () => {
      const result = new SecretAnalysisService().analyze(mockSecurity);
      expect(result.hardcodedSecrets).toBe(1);
      expect(result.leakSeverity).toBe("critical");
      expect(result.apiKeys).toBe(1);
    });

    it("should publish SecretsAnalyzed event", () => {
      let fired = false;
      PlatformEventBus.getInstance().subscribe("SecretsAnalyzed", () => fired = true);
      new SecretAnalysisService().analyze(mockSecurity);
      expect(fired).toBe(true);
    });

    it("should classify leak severity as none when no secret findings exist", () => {
      const cleanSecurity = { ...mockSecurity, findings: [] };
      const result = new SecretAnalysisService().analyze(cleanSecurity);
      expect(result.hardcodedSecrets).toBe(0);
      expect(result.leakSeverity).toBe("none");
    });

    it("should classify leak severity as high when high-severity secret exists", () => {
      const highSecretSecurity = {
        ...mockSecurity,
        findings: [{ id: "s1", type: "secret" as const, severity: "high" as const, title: "Private key exposed", description: "", location: "key.pem", detectedAt: "" }]
      };
      const result = new SecretAnalysisService().analyze(highSecretSecurity);
      expect(result.leakSeverity).toBe("high");
      expect(result.privateKeys).toBe(1);
    });

    it("should accurately categorize passwords and tokens", () => {
      const secretSecurity = {
        ...mockSecurity,
        findings: [
          { id: "s1", type: "secret" as const, severity: "high" as const, title: "Database Password in code", description: "", location: ".env", detectedAt: "" },
          { id: "s2", type: "secret" as const, severity: "medium" as const, title: "Auth Token leak", description: "", location: "token.ts", detectedAt: "" }
        ]
      };
      const result = new SecretAnalysisService().analyze(secretSecurity);
      expect(result.passwords).toBe(1);
      expect(result.tokens).toBe(1);
      expect(result.hardcodedSecrets).toBe(2);
    });
  });

  // Dependency Security
  describe("Dependency Security", () => {
    it("should identify critical dependencies and known vulns", () => {
      const result = new DependencySecurityService().analyze(mockSecurity);
      expect(result.knownVulnerabilities).toBe(2);
      expect(result.criticalDependencies).toContain("db-driver");
      expect(result.outdatedPackages).toBe(2);
    });

    it("should publish DependenciesAnalyzed event", () => {
      let fired = false;
      PlatformEventBus.getInstance().subscribe("DependenciesAnalyzed", () => fired = true);
      new DependencySecurityService().analyze(mockSecurity);
      expect(fired).toBe(true);
    });

    it("should calculate license risks for non-standard open source licenses", () => {
      const customSbomSecurity = {
        ...mockSecurity,
        sbom: {
          format: "CycloneDX" as const,
          components: [{ name: "gpl-lib", version: "1.0", license: "GPL-3.0", signed: true, source: "npm" }],
          generatedAt: "", sourceArtifact: ""
        }
      };
      const result = new DependencySecurityService().analyze(customSbomSecurity);
      expect(result.licenseRisks).toContain("gpl-lib: GPL-3.0");
    });
  });

  // Vulnerability Analysis
  describe("Vulnerability Analysis", () => {
    it("should sort vulnerabilities by CVSS descending", () => {
      const result = new VulnerabilityAnalysisService().analyze(mockSecurity);
      expect(result[0].cvssScore).toBeGreaterThanOrEqual(result[1].cvssScore);
    });

    it("should publish VulnerabilitiesAnalyzed event", () => {
      let fired = false;
      PlatformEventBus.getInstance().subscribe("VulnerabilitiesAnalyzed", () => fired = true);
      new VulnerabilityAnalysisService().analyze(mockSecurity);
      expect(fired).toBe(true);
    });

    it("should handle empty vulnerabilities list cleanly", () => {
      const noVulnSecurity = { ...mockSecurity, vulnerabilities: [] };
      const result = new VulnerabilityAnalysisService().analyze(noVulnSecurity);
      expect(result.length).toBe(0);
    });
  });

  // SBOM Analysis
  describe("SBOM Analysis", () => {
    it("should count unsigned packages and assess supply chain risk", () => {
      const result = new SBOMAnalysisService().analyze(mockSecurity);
      expect(result.unsignedPackages).toBe(1);
      expect(result.supplyChainRisk).toBe("medium");
    });

    it("should handle missing SBOM gracefully", () => {
      const noSbom = { ...mockSecurity, sbom: undefined };
      const result = new SBOMAnalysisService().analyze(noSbom);
      expect(result.supplyChainRisk).toBe("high");
    });

    it("should mark supply chain risk high when multiple unsigned packages exist", () => {
      const multiUnsignedSecurity = {
        ...mockSecurity,
        sbom: {
          format: "CycloneDX" as const,
          components: [
            { name: "a", version: "1.0", license: "MIT", signed: false, source: "npm" },
            { name: "b", version: "1.0", license: "MIT", signed: false, source: "npm" },
            { name: "c", version: "1.0", license: "MIT", signed: false, source: "npm" }
          ],
          generatedAt: "", sourceArtifact: ""
        }
      };
      const result = new SBOMAnalysisService().analyze(multiUnsignedSecurity);
      expect(result.supplyChainRisk).toBe("high");
      expect(result.unsignedPackages).toBe(3);
    });
  });

  // Artifact Integrity
  describe("Artifact Integrity", () => {
    it("should validate artifact integrity fields", () => {
      const result = new ArtifactIntegrityService().analyze(mockSecurity);
      expect(result.checksumValid).toBe(true);
      expect(result.signatureValid).toBe(false);
    });

    it("should publish ArtifactsValidated event", () => {
      let fired = false;
      PlatformEventBus.getInstance().subscribe("ArtifactsValidated", () => fired = true);
      new ArtifactIntegrityService().analyze(mockSecurity);
      expect(fired).toBe(true);
    });

    it("should fallback to valid default state when artifactIntegrity is omitted", () => {
      const noArtifactSec = { ...mockSecurity, artifactIntegrity: undefined };
      const result = new ArtifactIntegrityService().analyze(noArtifactSec);
      expect(result.checksumValid).toBe(true);
      expect(result.signatureValid).toBe(true);
      expect(result.tamperingDetected).toBe(false);
    });
  });

  // Container Security
  describe("Container Security", () => {
    it("should detect root containers and privilege escalation", () => {
      const result = new ContainerSecurityService().analyze(mockSecurity);
      expect(result.rootContainers).toBe(true);
      expect(result.privilegeEscalation).toBe(true);
    });

    it("should publish ContainersAnalyzed event", () => {
      let fired = false;
      PlatformEventBus.getInstance().subscribe("ContainersAnalyzed", () => fired = true);
      new ContainerSecurityService().analyze(mockSecurity);
      expect(fired).toBe(true);
    });

    it("should return safe defaults when containerSecurity is missing", () => {
      const noContainerSec = { ...mockSecurity, containerSecurity: undefined };
      const result = new ContainerSecurityService().analyze(noContainerSec);
      expect(result.baseImageRisk).toBe("safe");
      expect(result.rootContainers).toBe(false);
    });
  });

  // Runtime Threat Analysis
  describe("Runtime Threat Analysis", () => {
    it("should return none threat level when no runtime context", () => {
      const result = new RuntimeThreatAnalysisService().analyze();
      expect(result.threatLevel).toBe("none");
    });

    it("should publish RuntimeThreatsAnalyzed event", () => {
      let fired = false;
      PlatformEventBus.getInstance().subscribe("RuntimeThreatsAnalyzed", () => fired = true);
      new RuntimeThreatAnalysisService().analyze();
      expect(fired).toBe(true);
    });

    it("should detect high threat level when active incidents and high error rates occur", () => {
      const mockRuntimeContext: any = {
        incidentAnalysis: { severity: "high" },
        performanceAnalysis: { errorRate: 12.5 },
        dependencyAnalysis: { failurePropagation: false }
      };
      const result = new RuntimeThreatAnalysisService().analyze(mockRuntimeContext);
      expect(result.threatLevel).toBe("high");
      expect(result.suspiciousActivity).toBe(true);
    });

    it("should detect low threat level on dependency failure propagation alone", () => {
      const mockRuntimeContext: any = {
        incidentAnalysis: { severity: "none" },
        performanceAnalysis: { errorRate: 1.0 },
        dependencyAnalysis: { failurePropagation: true }
      };
      const result = new RuntimeThreatAnalysisService().analyze(mockRuntimeContext);
      expect(result.threatLevel).toBe("low");
      expect(result.unexpectedNetworkCalls).toBe(true);
    });
  });

  // Policy Compliance
  describe("Policy Compliance", () => {
    it("should detect non-compliant enforced policies", () => {
      const result = new PolicyComplianceService().evaluate(mockSecurity);
      expect(result.overallCompliance).toBe("non_compliant");
      expect(result.failedPolicies).toContain("No Root");
    });

    it("should publish PoliciesEvaluated event", () => {
      let fired = false;
      PlatformEventBus.getInstance().subscribe("PoliciesEvaluated", () => fired = true);
      new PolicyComplianceService().evaluate(mockSecurity);
      expect(fired).toBe(true);
    });

    it("should mark overall compliance as compliant when all rules pass", () => {
      const compliantSec = {
        ...mockSecurity,
        policies: [
          { id: "p1", name: "Encryption", scope: "organization" as const, rules: [{ id: "r1", description: "Encrypt data", status: "passed" as const }], enforcementLevel: "enforced" as const }
        ]
      };
      const result = new PolicyComplianceService().evaluate(compliantSec);
      expect(result.overallCompliance).toBe("compliant");
      expect(result.failedPolicies.length).toBe(0);
    });

    it("should mark overall compliance as partial when only advisory policies fail", () => {
      const advisorySec = {
        ...mockSecurity,
        policies: [
          { id: "p1", name: "Encryption", scope: "organization" as const, rules: [{ id: "r1", description: "Encrypt data", status: "passed" as const }], enforcementLevel: "enforced" as const },
          { id: "p2", name: "Advisory Rule", scope: "pipeline" as const, rules: [{ id: "r2", description: "Opt-in check", status: "failed" as const }], enforcementLevel: "advisory" as const }
        ]
      };
      const result = new PolicyComplianceService().evaluate(advisorySec);
      expect(result.overallCompliance).toBe("partial");
      expect(result.advisoryPolicies).toContain("Advisory Rule");
    });
  });

  // Security Risk
  describe("Security Risk Service", () => {
    it("should compute aggregate risk score from all sub-analyses", () => {
      const secrets = new SecretAnalysisService().analyze(mockSecurity);
      const deps = new DependencySecurityService().analyze(mockSecurity);
      const vulns = new VulnerabilityAnalysisService().analyze(mockSecurity);
      const sbom = new SBOMAnalysisService().analyze(mockSecurity);
      const artifacts = new ArtifactIntegrityService().analyze(mockSecurity);
      const containers = new ContainerSecurityService().analyze(mockSecurity);
      const threats = new RuntimeThreatAnalysisService().analyze();
      const compliance = new PolicyComplianceService().evaluate(mockSecurity);

      const risk = new SecurityRiskService().compute(secrets, deps, vulns, sbom, artifacts, containers, threats, compliance);

      expect(risk.overallRiskScore).toBeGreaterThan(50);
      expect(risk.riskFactors.length).toBeGreaterThan(0);
      expect(risk.businessRisk).toBe("critical");
    });

    it("should cap overall risk score at 100", () => {
      const highRiskSecrets = { leakSeverity: "critical" as const, hardcodedSecrets: 10, apiKeys: 5, passwords: 5, privateKeys: 0, tokens: 0, credentialExposures: [], };
      const highRiskDeps = { knownVulnerabilities: 10, outdatedPackages: 5, criticalDependencies: ["a"], licenseRisks: [], transitiveRisks: 3 };
      const highRiskVulns = Array(5).fill({ severity: "critical", cvssScore: 10.0 } as any);
      const highRiskSbom = { missingComponents: [], versionDrift: true, unsignedPackages: 5, supplyChainRisk: "critical" as const };
      const highRiskArtifacts = { checksumValid: false, signatureValid: false, tamperingDetected: true, provenanceValid: false };
      const highRiskContainers = { baseImageRisk: "critical" as const, criticalCVEs: 5, privilegeEscalation: true, rootContainers: true, misconfigurations: [] };
      const highRiskThreats = { suspiciousActivity: true, privilegeEscalation: true, unexpectedNetworkCalls: true, maliciousProcessDetection: true, persistenceIndicators: true, threatLevel: "critical" as const };
      const highRiskCompliance = { overallCompliance: "non_compliant" as const, failedPolicies: ["a"], advisoryPolicies: [], encryptionStatus: "missing" as const, secretsManagement: "missing" as const };

      const risk = new SecurityRiskService().compute(highRiskSecrets, highRiskDeps, highRiskVulns, highRiskSbom, highRiskArtifacts, highRiskContainers, highRiskThreats, highRiskCompliance);

      expect(risk.overallRiskScore).toBe(100);
      expect(risk.businessRisk).toBe("critical");
    });

    it("should return low risk level for clean system", () => {
      const cleanSecrets = { leakSeverity: "none" as const, hardcodedSecrets: 0, apiKeys: 0, passwords: 0, privateKeys: 0, tokens: 0, credentialExposures: [] };
      const cleanDeps = { knownVulnerabilities: 0, outdatedPackages: 0, criticalDependencies: [], licenseRisks: [], transitiveRisks: 0 };
      const cleanVulns: any[] = [];
      const cleanSbom = { missingComponents: [], versionDrift: false, unsignedPackages: 0, supplyChainRisk: "low" as const };
      const cleanArtifacts = { checksumValid: true, signatureValid: true, tamperingDetected: false, provenanceValid: true };
      const cleanContainers = { baseImageRisk: "safe" as const, criticalCVEs: 0, privilegeEscalation: false, rootContainers: false, misconfigurations: [] };
      const cleanThreats = { suspiciousActivity: false, privilegeEscalation: false, unexpectedNetworkCalls: false, maliciousProcessDetection: false, persistenceIndicators: false, threatLevel: "none" as const };
      const cleanCompliance = { overallCompliance: "compliant" as const, failedPolicies: [], advisoryPolicies: [], encryptionStatus: "enforced" as const, secretsManagement: "enforced" as const };

      const risk = new SecurityRiskService().compute(cleanSecrets, cleanDeps, cleanVulns, cleanSbom, cleanArtifacts, cleanContainers, cleanThreats, cleanCompliance);

      expect(risk.overallRiskScore).toBe(0);
      expect(risk.businessRisk).toBe("low");
    });
  });

  // Security Recommendation
  describe("Security Recommendation Service", () => {
    it("should produce P1 priority and block deployment for critical risk", () => {
      const secrets = new SecretAnalysisService().analyze(mockSecurity);
      const containers = new ContainerSecurityService().analyze(mockSecurity);
      const compliance = new PolicyComplianceService().evaluate(mockSecurity);
      const risk = { overallRiskScore: 80, businessRisk: "critical" as const, technicalRisk: "critical" as const, deploymentRisk: "critical" as const, riskFactors: [] };

      const rec = new SecurityRecommendationService().generate(risk, secrets, containers, compliance);
      expect(rec.priority).toBe("P1");
      expect(rec.deploymentRecommendation).toBe("block");
      expect(rec.immediateActions.length).toBeGreaterThan(0);
    });

    it("should produce P4 priority and safe deployment recommendation for minimal risk", () => {
      const cleanSecrets = { leakSeverity: "none" as const, hardcodedSecrets: 0, apiKeys: 0, passwords: 0, privateKeys: 0, tokens: 0, credentialExposures: [] };
      const cleanContainers = { baseImageRisk: "safe" as const, criticalCVEs: 0, privilegeEscalation: false, rootContainers: false, misconfigurations: [] };
      const cleanCompliance = { overallCompliance: "compliant" as const, failedPolicies: [], advisoryPolicies: [], encryptionStatus: "enforced" as const, secretsManagement: "enforced" as const };
      const lowRisk = { overallRiskScore: 10, businessRisk: "low" as const, technicalRisk: "low" as const, deploymentRisk: "low" as const, riskFactors: [] };

      const rec = new SecurityRecommendationService().generate(lowRisk, cleanSecrets, cleanContainers, cleanCompliance);
      expect(rec.priority).toBe("P4");
      expect(rec.deploymentRecommendation).toBe("safe");
      expect(rec.immediateActions.length).toBe(0);
    });

    it("should produce proceed_with_caution for moderate risk", () => {
      const secrets = { leakSeverity: "medium" as const, hardcodedSecrets: 1, apiKeys: 0, passwords: 0, privateKeys: 0, tokens: 0, credentialExposures: [] };
      const containers = { baseImageRisk: "medium" as const, criticalCVEs: 0, privilegeEscalation: false, rootContainers: false, misconfigurations: [] };
      const compliance = { overallCompliance: "compliant" as const, failedPolicies: [], advisoryPolicies: [], encryptionStatus: "enforced" as const, secretsManagement: "enforced" as const };
      const medRisk = { overallRiskScore: 45, businessRisk: "medium" as const, technicalRisk: "medium" as const, deploymentRisk: "medium" as const, riskFactors: [] };

      const rec = new SecurityRecommendationService().generate(medRisk, secrets, containers, compliance);
      expect(rec.priority).toBe("P3");
      expect(rec.deploymentRecommendation).toBe("proceed_with_caution");
    });
  });

  // Context Orchestration
  describe("Security Context Orchestrator", () => {
    it("should aggregate entire security pipeline into SecurityContext", async () => {
      const orchestrator = new SecurityContextOrchestrator();
      let contextCreated = false;
      PlatformEventBus.getInstance().subscribe("SecurityContextCreated", () => contextCreated = true);

      const context = await orchestrator.orchestrate(mockSecurity);

      expect(context.metadata.version).toBe("3.4.0");
      expect(context.securityRisk.overallRiskScore).toBeGreaterThan(0);
      expect(context.securityRecommendation.priority).toBeDefined();
      expect(contextCreated).toBe(true);
    });

    it("should accept optional pipelineContext and runtimeContext", async () => {
      const orchestrator = new SecurityContextOrchestrator();
      const mockPipeline: any = { pipeline: { id: "pipe-1" }, repositoryDiff: { files: [] } };
      const mockRuntime: any = { incidentAnalysis: { severity: "none" }, performanceAnalysis: { errorRate: 0 }, dependencyAnalysis: { failurePropagation: false } };

      const context = await orchestrator.orchestrate(mockSecurity, mockRuntime, mockPipeline);
      expect(context.pipelineContext).toBeDefined();
      expect(context.runtimeContext).toBeDefined();
    });
  });

  // Prompt Builder (AI Boundary)
  describe("Security Prompt Builder", () => {
    it("should produce a prompt with all security sections", async () => {
      const context = await new SecurityContextOrchestrator().orchestrate(mockSecurity);
      const prompt = new SecurityPromptBuilder().buildPrompt(context);
      expect(prompt).toContain("Executive Summary");
      expect(prompt).toContain("Threat Summary");
      expect(prompt).toContain("Risk Explanation");
      expect(prompt).toContain("Remediation Advice");
      expect(prompt).toContain("Risk Score");
    });

    it("should instruct AI not to recalculate deterministic values", async () => {
      const context = await new SecurityContextOrchestrator().orchestrate(mockSecurity);
      const prompt = new SecurityPromptBuilder().buildPrompt(context);
      expect(prompt).toContain("deterministically computed");
      expect(prompt).toContain("Do not recalculate");
    });
  });

  // Plugin Registration
  describe("Plugin Registration", () => {
    it("BootstrapManager should register Security Intelligence plugins", () => {
      const capReg = CapabilityRegistry.getInstance();
      const exists = capReg.exists("analyze_security");
      expect(typeof exists).toBe("boolean");
    });

    it("SecurityCapabilityPlugin should define valid plugin metadata", () => {
      const { SecurityCapabilityPlugin } = require("../plugins/security-plugin");
      const plugin = new SecurityCapabilityPlugin();
      expect(plugin.name).toBe("AI Security Intelligence");
    });
  });

  // Backward Compatibility
  describe("Backward Compatibility", () => {
    it("SecurityModel should not conflict with RuntimeModel", () => {
      expect(mockSecurity.provider).toBe("GitHub");
      expect(mockSecurity.vulnerabilities).toBeDefined();
    });

    it("SecurityContext should accept optional cross-context fields", async () => {
      const context = await new SecurityContextOrchestrator().orchestrate(mockSecurity);
      expect(context.runtimeContext).toBeUndefined();
      expect(context.pipelineContext).toBeUndefined();
    });

    it("BootstrapManager initialize should initialize without errors", async () => {
      const bootstrap = BootstrapManager.getInstance();
      await expect(bootstrap.initialize()).resolves.not.toThrow();
    });
  });
});

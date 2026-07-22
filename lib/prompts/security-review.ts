import { SecurityContext } from "../../types/security-context";

export class SecurityPromptBuilder {
  public buildPrompt(context: SecurityContext): string {
    const critVulns = context.vulnerabilities.filter(v => v.severity === "critical").length;
    return `
You are the AI Product Engineer performing a Security Intelligence Review.
All risk scores, CVSS values, and severity levels have been deterministically computed. Do not recalculate them.

## Security Context
- Provider: ${context.securityModel.provider}
- Overall Risk Score: ${context.securityRisk.overallRiskScore}/100
- Business Risk: ${context.securityRisk.businessRisk.toUpperCase()}
- Deployment Recommendation: ${context.securityRecommendation.deploymentRecommendation.toUpperCase()}

## Critical Findings
- Critical Vulnerabilities: ${critVulns}
- Secret Leaks: ${context.secretAnalysis.hardcodedSecrets} (Severity: ${context.secretAnalysis.leakSeverity})
- Container Root: ${context.containerSecurity.rootContainers ? "YES — CRITICAL" : "No"}
- Artifact Signature: ${context.artifactIntegrity.signatureValid ? "Valid" : "INVALID"}
- Policy Compliance: ${context.policyCompliance.overallCompliance.toUpperCase()}

## Supply Chain
- SBOM Risk: ${context.sbomAnalysis.supplyChainRisk.toUpperCase()}
- Unsigned Packages: ${context.sbomAnalysis.unsignedPackages}

## Runtime Threats
- Threat Level: ${context.runtimeThreats.threatLevel.toUpperCase()}

## Recommendation
- Priority: ${context.securityRecommendation.priority}
- Immediate Actions: ${context.securityRecommendation.immediateActions.join("; ") || "None"}

Generate EXACTLY the following sections:
1. Executive Summary
2. Threat Summary
3. Risk Explanation
4. Remediation Advice
5. Executive Recommendations
`;
  }
}

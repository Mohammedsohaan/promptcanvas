import { PipelineContext } from "../../types/pipeline-context";

/**
 * PipelinePromptBuilder restricts the AI to qualitative explanation.
 * The AI receives strictly computed deterministic metrics from PipelineContext.
 */
export class PipelinePromptBuilder {
  public buildPrompt(context: PipelineContext): string {
    return `
You are the AI Product Engineer performing a CI/CD Pipeline Review.
The deterministic metrics have already been calculated. Do not recalculate them.

## Pipeline Context
- Provider: ${context.pipelineModel.provider}
- Status: ${context.pipelineModel.status.toUpperCase()}
- Execution Time: ${context.pipelineAnalysis.executionDuration} ms
- Efficiency: ${context.pipelineAnalysis.pipelineEfficiency}%

## Quality Gates
- Overall: ${context.qualityGate.status.toUpperCase()}
- Unit Tests: ${context.qualityGate.unitTests}
- Coverage: ${context.qualityGate.coverage}
- Security Scan: ${context.qualityGate.securityScan}

## Deployment Risk & Release
- Deployment Risk: ${context.deploymentRisk.deploymentRisk.toUpperCase()}
- Release Readiness: ${context.releaseValidation.releaseReadiness.toUpperCase()}

## Recommendation Decision
${context.pipelineRecommendation.decision.toUpperCase()}

## Blockers & Warnings
Blockers: ${context.pipelineRecommendation.blockers.length > 0 ? context.pipelineRecommendation.blockers.join(", ") : "None"}
Warnings: ${context.pipelineRecommendation.warnings.length > 0 ? context.pipelineRecommendation.warnings.join(", ") : "None"}

Your task is to generate a final, human-readable CI/CD review report based on the above deterministic findings.

Generate EXACTLY the following sections:
1. Pipeline Summary
2. Quality Summary
3. Deployment Advice
4. Release Summary
5. Optimization Suggestions
6. Historical Insights
`;
  }
}

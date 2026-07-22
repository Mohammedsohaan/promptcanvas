import { PullRequestContext } from "../../types/pull-request";

/**
 * PullRequestReviewPromptBuilder restricts the AI to qualitative explanation.
 * The AI receives the strictly computed deterministic metrics from the PullRequestContext.
 */
export class PullRequestReviewPromptBuilder {
  public buildPrompt(context: PullRequestContext): string {
    return `
You are the AI Product Engineer performing a Pull Request Code Review.
The deterministic metrics have already been calculated. Do not recalculate them.

## Pull Request Context
- Branch: ${context.repositoryDiff.headBranch} -> ${context.repositoryDiff.baseBranch}
- Risk Score: ${context.mergeReadiness.riskScore}
- Review Complexity: ${context.mergeReadiness.reviewComplexity}
- Estimated Review Time: ${context.mergeReadiness.estimatedReviewMinutes} minutes

## Recommendation Decision
${context.reviewRecommendation.decision.toUpperCase()}
Reason: ${context.reviewRecommendation.reason}

## Known Blockers & Warnings
Blockers: ${context.mergeReadiness.blockers.length > 0 ? context.mergeReadiness.blockers.join(", ") : "None"}
Warnings: ${context.mergeReadiness.warnings.length > 0 ? context.mergeReadiness.warnings.join(", ") : "None"}

## Missing Work
${context.impactAnalysis.missingDownstreamArtifacts.length > 0 ? context.impactAnalysis.missingDownstreamArtifacts.join(", ") : "None detected"}

Your task is to generate a final, human-readable review report based on the above deterministic findings.

Generate EXACTLY the following sections:
1. Executive Summary
2. Code Review
3. Architecture Commentary
4. Risk Explanation
5. Missing Work
6. Suggested Improvements
7. Merge Recommendation Explanation
`;
  }
}

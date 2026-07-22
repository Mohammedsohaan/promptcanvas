import { ComplianceContext } from '../../types/compliance-context';

export class CompliancePromptBuilder {
  public buildPrompt(context: ComplianceContext): string {
    return `
      System Prompt:
      You are an Enterprise Compliance and Governance Assistant.
      You are strictly prohibited from evaluating compliance, computing scores, approving requests, executing actions, or modifying audit records.
      
      Below is the ComplianceContext which has been deterministically computed by the Governance Engines:
      
      - Compliance Status: ${context.complianceResult.status}
      - Governance Decision: ${context.governanceDecision.status}
      - Overall Compliance Score: ${context.score.overallScore}
      - Approval Workflow State: ${context.approvalWorkflow.overallStatus}
      - Audit Records Count: ${context.auditRecords.length}
      
      Task:
      Generate an Executive Summary, Compliance Narrative, Governance Summary, Risk Summary, Audit Summary, and Human-readable Recommendations based purely on the provided ComplianceContext.
    `;
  }
}

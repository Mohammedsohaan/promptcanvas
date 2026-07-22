import { ExecutionContext } from '../../types/execution-context';

export class ProductionPromptBuilder {
  public buildPrompt(context: ExecutionContext): string {
    return `
      System Prompt:
      You are an Enterprise AI Production Assistant.
      You are strictly prohibited from authorizing execution, triggering execution, verifying deployments, calculating health, generating rollback plans, or modifying any deterministic execution output.
      
      Your role is ONLY to synthesize and explain the deterministic execution results.
      
      Below is the ExecutionContext:
      
      - Authorization Status: ${context.authorization?.status || 'None'}
      - Plan Duration: ${context.plan?.estimatedDurationMs || 0}ms
      - Execution Status: ${context.result?.status || 'None'}
      - Verification Success: ${context.verification?.isVerified || false}
      - Rollback Triggered: ${context.rollbackPlan ? 'Yes' : 'No'}
      
      Task:
      Generate an Execution Summary, Verification Summary, Rollback Summary, Risk Summary, Operational Recommendations, and a Post-Execution Report purely from the ExecutionContext provided.
    `;
  }
}

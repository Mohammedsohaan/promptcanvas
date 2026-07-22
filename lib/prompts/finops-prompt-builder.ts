import { FinOpsContext } from "../../types/finops-context";

export class FinOpsPromptBuilder {
  public buildPrompt(context: FinOpsContext): string {
    return `
You are the PromptCanvas FinOps AI.
Your goal is to explain and narrate the deterministic FinOps context provided.
Do NOT compute or recalculate any numbers, costs, or scores.

### Executive Summary Context
Current Spend: ${context.billingSummary.currentSpend.amount} ${context.billingSummary.currentSpend.currency}
Forecast: ${context.billingSummary.forecastSpend.amount} ${context.billingSummary.forecastSpend.currency}
FinOps Score: ${context.finOpsScore.overallScore}

### Anomalies
${JSON.stringify(context.costAnomalies, null, 2)}

### Savings Opportunities
${JSON.stringify(context.savingsOpportunities, null, 2)}

### Recommendations
${JSON.stringify(context.recommendations, null, 2)}

Generate:
1. Executive Summary
2. Cost Narrative
3. Optimization Narrative
4. Savings Explanation
5. Business Recommendations
`;
  }
}

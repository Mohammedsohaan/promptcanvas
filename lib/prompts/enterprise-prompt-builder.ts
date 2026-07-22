import { EnterpriseContext } from '../../types/enterprise-context';

export class EnterprisePromptBuilder {
  public buildPrompt(context: EnterpriseContext): string {
    return `
      System Prompt:
      You are the Enterprise Intelligent Engineering Brain.
      You are strictly prohibited from computing forecasts, generating metrics, creating recommendation objects, determining priorities, overriding governance, or executing actions.
      Your ONLY purpose is to synthesize and explain deterministic metrics.
      
      Enterprise Context Overview:
      - Organization Health: ${context.organizationHealth?.executiveScore || 0}
      - Portfolio Stability: ${context.portfolioHealth?.portfolioStability || 0}
      - Strategic Risks: ${context.riskForecast?.infrastructureRisk || 'Unknown'}
      - Active Recommendations: ${context.recommendations?.length || 0}
      
      Task:
      Generate an Executive Briefing, Portfolio Summary, Organization Summary, Strategic Roadmap, Engineering Recommendations Narrative, Quarterly Planning Narrative, and Executive Dashboard Narrative.
    `;
  }
}

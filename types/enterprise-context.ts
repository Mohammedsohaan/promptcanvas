import { EngineeringManagerContext } from './engineering-manager-context';
import { ExecutionContext } from './execution-context';
import { PortfolioHealth } from './portfolio-health';
import { OrganizationHealth } from './organization-health';
import { DependencyGraph } from './dependency-graph';
import { EngineeringCapacity } from './engineering-capacity';
import { RiskForecast } from './risk-forecast';
import { Recommendation } from './recommendation';
import { ExecutiveDashboard } from './executive-dashboard';
import { OrganizationGoal } from './organization-goal';

export interface EnterpriseContext {
  id: string;
  timestamp: string;
  engineeringManagerContext: EngineeringManagerContext;
  executionContext: ExecutionContext;
  portfolioHealth: PortfolioHealth;
  organizationHealth: OrganizationHealth;
  dependencyGraph: DependencyGraph;
  engineeringCapacity: EngineeringCapacity;
  riskForecast: RiskForecast;
  recommendations: Recommendation[];
  executiveDashboard: ExecutiveDashboard;
  organizationGoals: OrganizationGoal[];
}

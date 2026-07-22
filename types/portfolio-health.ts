export interface PortfolioHealth {
  overallPortfolioHealth: number;
  portfolioStability: number;
  deliverySuccess: number;
  securityHealth: number;
  complianceHealth: number;
  financialHealth: number;
  operationalHealth: number;
  projectDistribution: Record<string, number>;
}

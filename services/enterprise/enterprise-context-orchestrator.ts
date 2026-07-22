import { EnterpriseContext } from '../../types/enterprise-context';
import { PlatformEventBus } from '../core/platform-event-bus';

export class EnterpriseContextOrchestrator {
  private eventBus = PlatformEventBus.getInstance();

  public assembleContext(
    engineeringManagerContext: any,
    executionContext: any,
    portfolioHealth: any,
    organizationHealth: any,
    dependencyGraph: any,
    engineeringCapacity: any,
    riskForecast: any,
    recommendations: any[],
    executiveDashboard: any,
    organizationGoals: any[]
  ): EnterpriseContext {
    const context: EnterpriseContext = {
      id: `ent-ctx-${Date.now()}`,
      timestamp: new Date().toISOString(),
      engineeringManagerContext,
      executionContext,
      portfolioHealth,
      organizationHealth,
      dependencyGraph,
      engineeringCapacity,
      riskForecast,
      recommendations,
      executiveDashboard,
      organizationGoals
    };
    
    this.eventBus.publish("EnterpriseContextCreated", context);
    return context;
  }
}

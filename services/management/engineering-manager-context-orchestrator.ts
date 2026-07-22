import { EngineeringManagerContext } from '../../types/engineering-manager-context';
import { PlatformEventBus } from '../core/platform-event-bus';

export class EngineeringManagerContextOrchestrator {
  private eventBus = PlatformEventBus.getInstance();

  public assembleContext(
    repositoryContext: any,
    pullRequestContext: any,
    pipelineContext: any,
    runtimeContext: any,
    securityContext: any,
    finopsContext: any,
    decisionContext: any,
    remediationContext: any,
    complianceContext: any,
    engineeringHealth: any,
    technicalDebt: any,
    priorities: any,
    projectHealth: any,
    releaseReadiness: any,
    engineeringGoals: any,
    teamInsight: any,
    executiveSummary: any
  ): EngineeringManagerContext {
    const context: EngineeringManagerContext = {
      id: `em-ctx-${Date.now()}`,
      repositoryContext,
      pullRequestContext,
      pipelineContext,
      runtimeContext,
      securityContext,
      finopsContext,
      decisionContext,
      remediationContext,
      complianceContext,
      engineeringHealth,
      technicalDebt,
      priorities,
      projectHealth,
      releaseReadiness,
      engineeringGoals,
      teamInsight,
      executiveSummary,
      timestamp: new Date().toISOString()
    };
    
    this.eventBus.publish("EngineeringManagerContextCreated", context);
    return context;
  }
}

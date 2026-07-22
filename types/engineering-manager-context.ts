import { EngineeringHealth } from './engineering-health';
import { EngineeringPriority } from './engineering-priority';
import { EngineeringGoal } from './engineering-goal';
import { TechnicalDebt } from './technical-debt';
import { ProjectHealth } from './project-health';
import { ReleaseReadiness } from './release-readiness';
import { TeamInsight } from './team-insight';
import { ExecutiveSummary } from './executive-summary';

export interface EngineeringManagerContext {
  id: string;
  repositoryContext: any;
  pullRequestContext: any;
  pipelineContext: any;
  runtimeContext: any;
  securityContext: any;
  finopsContext: any;
  decisionContext: any;
  remediationContext: any;
  complianceContext: any;
  engineeringHealth: EngineeringHealth;
  technicalDebt: TechnicalDebt;
  priorities: EngineeringPriority[];
  projectHealth: ProjectHealth;
  releaseReadiness: ReleaseReadiness;
  engineeringGoals: EngineeringGoal[];
  teamInsight: TeamInsight;
  executiveSummary: ExecutiveSummary;
  timestamp: string;
}

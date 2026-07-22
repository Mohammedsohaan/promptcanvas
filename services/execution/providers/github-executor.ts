import { ProductionAction } from '../../../types/production-action';

export interface GitHubExecutor {
  executeAction(action: ProductionAction): Promise<boolean>;
  validateWorkflowState(): Promise<boolean>;
}

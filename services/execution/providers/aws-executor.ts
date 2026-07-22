import { ProductionAction } from '../../../types/production-action';

export interface AWSExecutor {
  executeAction(action: ProductionAction): Promise<boolean>;
  validateEnvironment(): Promise<boolean>;
}

import { ProductionAction } from '../../../types/production-action';

export interface AzureExecutor {
  executeAction(action: ProductionAction): Promise<boolean>;
  validateEnvironment(): Promise<boolean>;
}

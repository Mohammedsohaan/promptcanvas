import { ProductionAction } from '../../../types/production-action';

export interface GoogleCloudExecutor {
  executeAction(action: ProductionAction): Promise<boolean>;
  validateEnvironment(): Promise<boolean>;
}

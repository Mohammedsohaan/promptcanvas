import { ProductionAction } from '../../../types/production-action';

export interface TerraformExecutor {
  executeAction(action: ProductionAction): Promise<boolean>;
  validateStateFile(): Promise<boolean>;
}

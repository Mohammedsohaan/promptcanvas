import { ProductionAction } from '../../../types/production-action';

export interface DockerExecutor {
  executeAction(action: ProductionAction): Promise<boolean>;
  validateContainerState(): Promise<boolean>;
}

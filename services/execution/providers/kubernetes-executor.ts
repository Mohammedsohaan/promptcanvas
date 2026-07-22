import { ProductionAction } from '../../../types/production-action';

export interface KubernetesExecutor {
  executeAction(action: ProductionAction): Promise<boolean>;
  validateClusterState(): Promise<boolean>;
}

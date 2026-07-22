export interface WorkflowPlugin {
  workflowId: string;
  steps: any[];
  outputs: any[];
  execute(context?: Record<string, any>): Promise<any>;
}

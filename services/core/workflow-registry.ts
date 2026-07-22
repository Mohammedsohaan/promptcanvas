import { WorkflowPlugin } from "../plugins/interfaces/workflow-plugin";
import { PlatformEventBus } from "./platform-event-bus";
import { RegistryStatus } from "./capability-registry";

export class WorkflowRegistry {
  private static instance: WorkflowRegistry;
  private workflows: Map<string, WorkflowPlugin> = new Map();
  private validationErrors: string[] = [];

  private constructor() {}

  public static getInstance(): WorkflowRegistry {
    if (!WorkflowRegistry.instance) {
      WorkflowRegistry.instance = new WorkflowRegistry();
    }
    return WorkflowRegistry.instance;
  }

  public register(plugin: WorkflowPlugin): void {
    if (this.workflows.has(plugin.workflowId)) {
      this.validationErrors.push(`Duplicate workflow ID: ${plugin.workflowId}`);
      return;
    }
    this.workflows.set(plugin.workflowId, plugin);
    PlatformEventBus.getInstance().publish("WorkflowRegistered", { id: plugin.workflowId });
  }

  public resolve(id: string): WorkflowPlugin | undefined {
    return this.workflows.get(id);
  }

  public async execute(id: string, context: Record<string, any>): Promise<any> {
    const workflow = this.resolve(id);
    if (!workflow) {
      throw new Error(`Workflow not found: ${id}`);
    }
    return workflow.execute(context);
  }

  public list(): WorkflowPlugin[] {
    return Array.from(this.workflows.values());
  }

  public exists(id: string): boolean {
    return this.workflows.has(id);
  }

  public validate(): boolean {
    return this.validationErrors.length === 0;
  }

  public getStatus(): RegistryStatus {
    return {
      initialized: true,
      pluginCount: this.workflows.size,
      registeredPlugins: Array.from(this.workflows.keys()),
      validationErrors: [...this.validationErrors]
    };
  }
}

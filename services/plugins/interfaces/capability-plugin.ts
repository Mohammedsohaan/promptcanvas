export interface CapabilityPlugin {
  id: string;
  name: string;
  version: string;
  register(): void;
  execute(context?: Record<string, any>): Promise<any>;
}

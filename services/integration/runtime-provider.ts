import { RuntimeModel } from "../../types/runtime";

export interface RuntimeProvider {
  name(): string;
  fetchRuntimeData(envId: string, timeRangeMinutes: number, credentials?: Record<string, any>): Promise<RuntimeModel>;
}

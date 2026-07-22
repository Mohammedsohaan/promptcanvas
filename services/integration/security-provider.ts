import { SecurityModel } from "../../types/security";

export interface SecurityProvider {
  name(): string;
  scan(repositoryId: string, options?: Record<string, any>): Promise<SecurityModel>;
}

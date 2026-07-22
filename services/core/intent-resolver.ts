import { CapabilityRegistry } from "./capability-registry";
import { CapabilityPlugin } from "../plugins/interfaces/capability-plugin";

export class IntentResolver {
  private static instance: IntentResolver;

  private constructor() {}

  public static getInstance(): IntentResolver {
    if (!IntentResolver.instance) {
      IntentResolver.instance = new IntentResolver();
    }
    return IntentResolver.instance;
  }

  /**
   * Parses the user prompt, normalizes it, and matches it against
   * registered capabilities dynamically.
   */
  public resolve(prompt: string): CapabilityPlugin[] {
    const normalized = prompt.toLowerCase();
    const capabilities = CapabilityRegistry.getInstance().list();
    const matched: CapabilityPlugin[] = [];

    for (const capability of capabilities) {
      // In a real implementation this would use AI intent classification or 
      // check the capability's declared match patterns. For now we use basic 
      // heuristic matching based on capability name or simple text matching.
      
      const capName = capability.name.toLowerCase();
      const capId = capability.id.toLowerCase();
      
      if (normalized.includes(capName) || normalized.includes(capId.replace(/_/g, " "))) {
        matched.push(capability);
      }
    }

    return matched;
  }
}

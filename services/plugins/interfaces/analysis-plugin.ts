export interface AnalysisPlugin {
  supports(context: Record<string, any>): boolean;
  priority(): number;
  analyze(context: Record<string, any>): Promise<any>;
}

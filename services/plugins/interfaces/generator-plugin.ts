export interface GeneratorPlugin {
  generate(context: Record<string, any>): Promise<any>;
  documentType(): string;
}

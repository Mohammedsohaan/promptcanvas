import { PromptContext } from "./types";

export function buildPrdPrompt(context: PromptContext): string {
  return `You are an expert Product Manager. Generate a Product Requirements Document (PRD) based on the following project context:

Project Title: ${context.projectTitle}
Description: ${context.projectDescription || "N/A"}
Document Title: ${context.documentTitle || "PRD"}

Current Document Context:
${context.documentContent || "None provided."}

Additional Instructions:
${context.additionalInstructions || "Provide executive summary, core problem statement, target audience, key features, and success metrics."}

Generate a comprehensive, structured PRD in markdown format.`;
}

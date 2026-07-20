import { PromptInput } from "./types";

export function buildApiSpecPrompt(input: PromptInput): string {
  const { context } = input;
  const currentDoc = context.currentDocument;
  const content = currentDoc.content ? JSON.stringify(currentDoc.content) : "None provided.";
  
  return `You are a Principal Software Architect. Generate a clean API Specification based on the project context.

Project Title: ${context.projectSummary || "Untitled Project"}
Parent Document: ${context.parent?.title || "N/A"}
Current Document Title: ${currentDoc.title}

Current Document Context (User Stories / PRD):
${content}

Additional context from sibling/ancestor documents:
${context.ancestors.map(c => `- ${c.title}`).join("\n")}
${context.siblings.map(c => `- ${c.title}`).join("\n")}

Generate a production-ready REST API specification. Include:
- Authentication & Authorization Requirements
- Resources & Endpoints
- HTTP Methods
- Request Schema & Validation Rules
- Response Schema & Status Codes
- Error Responses
- Pagination, Filtering, Sorting (where applicable)
- Rate Limits (if applicable)
- Assumptions

The generated document should be readable by developers while remaining structured enough for future OpenAPI export.
Generate the API Specification in markdown format.`;
}

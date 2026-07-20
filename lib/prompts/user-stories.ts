import { PromptInput } from "./types";

export function buildUserStoriesPrompt(input: PromptInput): string {
  const { context } = input;
  const currentDoc = context.currentDocument;
  const content = currentDoc.content ? JSON.stringify(currentDoc.content) : "None provided.";

  return `You are an Agile Product Owner. Generate a set of detailed User Stories with Acceptance Criteria based on the project context.

Project Title: ${context.projectSummary || "Untitled Project"}
Parent Document: ${context.parent?.title || "N/A"}
Current Document Title: ${currentDoc.title}

Current Document Context:
${content}

Additional context from children documents:
${context.children.map(c => `- ${c.title}`).join("\n")}

Format as: As a <user>, I want <goal> so that <benefit>. Include Given-When-Then acceptance criteria for each story.

Generate structured User Stories in markdown format.`;
}

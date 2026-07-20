import { ProjectAIContext } from "@/services/ai-context";

export interface SprintPlanPromptInput {
  projectTitle?: string;
  projectContext?: ProjectAIContext;
  additionalInstructions?: string;
}

/**
 * Builds the AI Sprint Planner prompt.
 */
export function buildSprintPlanPrompt(input: SprintPlanPromptInput): string {
  const { projectTitle = "Project", projectContext, additionalInstructions } = input;

  let docsBlock = "";
  if (projectContext && projectContext.relevantDocuments.length > 0) {
    const docs = projectContext.relevantDocuments.map((doc) => {
      let text = typeof doc.content === "string" ? doc.content : JSON.stringify(doc.content, null, 2);
      return `Document [${doc.title}] (${doc.type}):\n${text}`;
    });
    docsBlock = `------------------------------------------------
Project Specifications & Requirements Context
------------------------------------------------
${docs.join("\n\n")}
`;
  }

  return `SYSTEM OBJECTIVE
You are a Lead Agile Technical Program Manager & Lead Software Architect for PromptCanvas.
Your task is to transform the project's specifications (PRD, User Stories, API Specs, DB Schemas, Test Cases) into a complete, executable Engineering Sprint Plan & Backlog for [${projectTitle}].

SYSTEM INSTRUCTIONS:
1. Break down the project into logical, sequential Sprints (e.g. Sprint 1: Core Foundation & Auth, Sprint 2: Core Business APIs, Sprint 3: Advanced Features & Testing).
2. For each Sprint, define:
   - **Sprint Goal**: Concise objective.
   - **Estimated Duration**: Target timeframe (e.g., 2 weeks).
   - **Capacity / Points**: Total Fibonacci Story Points allocated.
   - **Definition of Done**: Clear completion criteria.

3. For EACH Task in a Sprint, provide the following structured format:

### [TSK-XXX]: [Task Title]
- **Description**: [Detailed technical task description]
- **Story / Requirement Reference**: [Linked User Story / API Endpoint / Schema]
- **Priority**: [High | Medium | Low]
- **Complexity**: [1, 2, 3, 5, 8, 13 Story Points]
- **Role**: [Backend | Frontend | QA | DevOps | Database | AI]
- **Dependencies**: [Prerequisite Task IDs or None]
- **Status**: Not Started

4. Include a **Release Strategy & MVP Roadmap** section summarizing:
   - MVP Scope vs. Stretch Goals
   - Critical Path & Parallelizable Workstreams
   - Key Technical Risks & Blockers

${docsBlock}
${additionalInstructions ? `Additional User Instructions:\n${additionalInstructions}\n` : ""}

Generate the complete, fully detailed Sprint Plan now:
`;
}

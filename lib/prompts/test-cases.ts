import { ProjectAIContext } from "@/services/ai-context";

export interface TestCasesPromptInput {
  parentDocumentTitle?: string;
  parentDocumentType?: string;
  parentDocumentContent?: string;
  projectContext?: ProjectAIContext;
  additionalInstructions?: string;
}

/**
 * Builds the AI Test Case Generator prompt.
 */
export function buildTestCasesPrompt(input: TestCasesPromptInput): string {
  const {
    parentDocumentTitle,
    parentDocumentType,
    parentDocumentContent,
    projectContext,
    additionalInstructions,
  } = input;

  let contextBlock = "";
  if (parentDocumentTitle && parentDocumentContent) {
    contextBlock = `------------------------------------------------
Parent Document Reference
------------------------------------------------
Title: ${parentDocumentTitle}
Type: ${parentDocumentType || "Specification"}
Content:
${parentDocumentContent}
`;
  }

  let projectBlock = "";
  if (projectContext && projectContext.relevantDocuments.length > 0) {
    const docs = projectContext.relevantDocuments.map((doc) => {
      let text = typeof doc.content === "string" ? doc.content : JSON.stringify(doc.content, null, 2);
      return `Document [${doc.title}] (${doc.type}):\n${text}`;
    });
    projectBlock = `------------------------------------------------
Related Project Context
------------------------------------------------
${docs.join("\n\n")}
`;
  }

  return `SYSTEM OBJECTIVE
You are an Expert QA & Test Automation Engineer for PromptCanvas.
Your task is to generate a comprehensive, production-grade Software Test Case Document based on the provided project specifications, PRDs, User Stories, API Specifications, and Database Schemas.

SYSTEM INSTRUCTIONS:
1. Generate test cases covering ALL relevant categories:
   - Functional Test Cases
   - Negative & Boundary Test Cases
   - Authentication & Authorization Tests
   - Validation & Error Handling Tests
   - API Contract Tests
   - Database Integrity Tests
   - Regression & Acceptance Tests

2. Format each Test Case clearly using Markdown with the following exact structure per test case:

### TC-[ID]: [Test Case Title]
- **Category**: [Functional | Negative | Security | Validation | API | DB | Regression]
- **Priority**: [High | Medium | Low]
- **Requirement Reference**: [Linked Feature / User Story / API Endpoint]
- **Preconditions**:
  - [Precondition 1]
- **Test Steps**:
  1. [Step 1]
  2. [Step 2]
- **Expected Result**: [Clear expected outcome]
- **Related Documents**: [Document Titles / IDs]

3. Include an Executive Test Suite Summary at the top listing:
   - Total Test Cases
   - Coverage Breakdown by Category
   - Recommended Test Execution Order

${contextBlock}
${projectBlock}
${additionalInstructions ? `Additional User Instructions:\n${additionalInstructions}\n` : ""}

Generate the complete, fully detailed Test Case Document now:
`;
}

import { PromptInput, PromptContext } from "./types";

export function buildDatabaseSchemaPrompt(input: PromptInput | PromptContext): string {
  if ("context" in input) {
    const { context } = input;
    const currentDoc = context.currentDocument;
    const content = currentDoc.content ? JSON.stringify(currentDoc.content) : "None provided.";

    return `You are a Lead Database Architect. Generate a production-ready relational Database Schema Design based on the project context.

Project Title: ${context.projectSummary || "Untitled Project"}
Parent Document: ${context.parent?.title || "N/A"}
Current Document Title: ${currentDoc.title}

Current Document Context (API Spec / User Stories / PRD):
${content}

Additional context from sibling/ancestor documents:
${context.ancestors.map(c => `- ${c.title}`).join("\n")}
${context.siblings.map(c => `- ${c.title}`).join("\n")}

Generate a comprehensive logical database schema.
Focus on the logical schema rather than vendor-specific SQL. The document should later be convertible into PostgreSQL, Prisma, or Drizzle ORM.
Avoid raw SQL syntax unless absolutely necessary for clarity.

The generated document MUST include the following consistent sections in clean Markdown:

1. Entity List: Identify every business entity.
2. Table Definitions: For every entity provide Table Name and Description.
3. Columns: For every table include Column Name, Data Type, Nullable, Default Value, Constraints.
4. Keys: Specify Primary Keys, Foreign Keys, Composite Keys where necessary.
5. Relationships: Describe One-to-One, One-to-Many, Many-to-Many, Junction Tables.
6. Constraints: Unique Constraints, Check Constraints, Required Fields, Business Rules.
7. Index Recommendations: Recommend indexes for Search, Sorting, Foreign Keys, High-frequency queries.
8. Audit Fields: Recommend standard fields (created_at, updated_at, created_by, updated_by, deleted_at).
9. Soft Delete Strategy: When appropriate.
10. Multi-tenancy Strategy: When appropriate.
11. Normalization Notes: Explain normalization decisions.
12. Assumptions: List assumptions made because of missing information.

Generate the Database Schema Specification in markdown format.`;
  }

  return `You are a Lead Database Architect. Generate a production-ready relational Database Schema Design based on the project context.

Project Title: ${input.projectTitle}
Description: ${input.projectDescription || "N/A"}
Document Title: ${input.documentTitle || "Database Schema"}

Current Document Context (API Spec / User Stories / PRD):
${input.documentContent || "None provided."}

Additional Instructions:
${input.additionalInstructions || "Include table definitions, column types, primary/foreign keys, and relationships."}

Generate the Database Schema Specification in markdown format.`;
}

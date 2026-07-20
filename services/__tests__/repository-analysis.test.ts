import { RepositoryAnalysisService } from "../repository/repository-analysis";
import { ProjectIndex } from "../context-selector";
import { RepositoryIndex } from "../repository/repository-index";
import { DocumentType, DocumentFreshness } from "../../types/document";

describe("RepositoryAnalysisService", () => {
  it("should calculate implementation coverage and detect schema drift", () => {
    const index: ProjectIndex = {
      projectId: "proj-1",
      projectTitle: "Test Project",
      documents: [
        {
          id: "doc-auth",
          title: "User Authentication",
          type: DocumentType.PRD,
          version: 1,
          freshness: DocumentFreshness.UP_TO_DATE,
          parentDocumentId: null,
          childrenIds: [],
        },
        {
          id: "doc-db",
          title: "Users Database Table",
          type: DocumentType.DATABASE_SCHEMA,
          version: 1,
          freshness: DocumentFreshness.UP_TO_DATE,
          parentDocumentId: null,
          childrenIds: [],
        },
      ],
    };

    const repoIndex: RepositoryIndex = {
      files: [
        {
          path: "src/auth.ts",
          name: "auth.ts",
          type: "file",
          content: "// User Authentication logic here",
        },
      ],
      classes: [],
      functions: [],
      exports: [],
      routes: [],
      migrations: [], // Lacks migration matching "Users Database Table" -> Database Schema drift!
    };

    const analysis = RepositoryAnalysisService.compute(index, repoIndex);

    expect(analysis.implementationCoverage).toBe(50);
    expect(analysis.implementedRequirements).toContain("User Authentication");
    expect(analysis.missingFeatures).toContain("Users Database Table");
    expect(analysis.databaseDrift.length).toBeGreaterThan(0);
  });
});

import { ProjectIndex } from "../context-selector";
import { RepositoryIndex } from "./repository-index";

export interface RepositoryAnalysisContext {
  implementationCoverage: number;
  specificationCoverage: number;
  implementedRequirements: string[];
  missingFeatures: string[];
  databaseDrift: string[];
  deadCode: string[];
  specificationDrift: string[];
  architectureViolations: string[];
  healthScore: number;
}

/**
 * RepositoryAnalysisService compares ProjectIndex requirements against indexed repository
 * implementation files to evaluate progress, coverage, and database drift.
 */
export class RepositoryAnalysisService {
  public static compute(
    index: ProjectIndex,
    repoIndex: RepositoryIndex
  ): RepositoryAnalysisContext {
    const implementedRequirements: string[] = [];
    const missingFeatures: string[] = [];
    const databaseDrift: string[] = [];
    const deadCode: string[] = [];
    const specificationDrift: string[] = [];
    const architectureViolations: string[] = [];

    // Analyze Implemented Requirements
    index.documents.forEach((doc) => {
      // Simplistic match check: does any source file match export keyword or content?
      const isImplemented = repoIndex.files.some((file) => {
        const fileContent = file.content?.toLowerCase() || "";
        const docTitle = doc.title.toLowerCase();
        return (
          file.path.toLowerCase().includes(docTitle.replace(/\s+/g, "")) ||
          fileContent.includes(docTitle)
        );
      });

      if (isImplemented) {
        implementedRequirements.push(doc.title);
      } else {
        missingFeatures.push(doc.title);
      }
    });

    // Database schema drift checking (compare local migrations/sql with database schema doc titles)
    const dbDocs = index.documents.filter((d) => d.type.includes("DATABASE_SCHEMA"));
    dbDocs.forEach((doc) => {
      const hasMigration = repoIndex.migrations.some((mig) =>
        mig.toLowerCase().includes(doc.title.toLowerCase().replace(/\s+/g, ""))
      );
      if (!hasMigration) {
        databaseDrift.push(`Table schema for "${doc.title}" has no matching migration script.`);
      }
    });

    const totalSpecs = index.documents.length;
    const implementedCount = implementedRequirements.length;
    const implementationCoverage = totalSpecs > 0 ? Math.round((implementedCount / totalSpecs) * 100) : 0;
    const specificationCoverage = totalSpecs > 0 ? Math.round((implementedCount / totalSpecs) * 100) : 0;

    // Detect technical debt or unused modules
    if (repoIndex.exports.length > 0 && implementedCount === 0) {
      deadCode.push("Unreferenced files found in repository index.");
    }

    const healthScore = Math.max(0, 100 - databaseDrift.length * 10 - architectureViolations.length * 15);

    return {
      implementationCoverage,
      specificationCoverage,
      implementedRequirements,
      missingFeatures,
      databaseDrift,
      deadCode,
      specificationDrift,
      architectureViolations,
      healthScore,
    };
  }
}

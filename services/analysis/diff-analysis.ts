import { RepositoryDiff, FilePatch } from "../../types/repository-diff";
import { DiffAnalysis } from "../../types/pull-request";
import { PlatformEventBus } from "../core/platform-event-bus";

/**
 * Pure deterministic service. Never calls AI.
 */
export class DiffAnalysisService {
  public analyze(diff: RepositoryDiff): DiffAnalysis {
    const allFiles = [...diff.addedFiles, ...diff.modifiedFiles, ...diff.deletedFiles, ...diff.renamedFiles];
    
    const analysis: DiffAnalysis = {
      categories: {
        configuration: this.filterByPattern(allFiles, /(\.json|\.yml|\.yaml|\.xml|\.ini|\.env.*|tsconfig.*)$/i),
        infrastructure: this.filterByPattern(allFiles, /(dockerfile|terraform|cdk|k8s|cloudformation)/i),
        dependencies: this.filterByPattern(allFiles, /(package\.json|yarn\.lock|package-lock\.json|pom\.xml|build\.gradle|requirements\.txt|pipfile)/i),
        authentication: this.filterByPattern(allFiles, /(auth|login|signin|oauth|jwt|passport|session)/i),
        authorization: this.filterByPattern(allFiles, /(rbac|permissions|roles|guard|policy)/i),
        api: this.filterByPattern(allFiles, /(api|route|controller|resolver|graphql|trpc|rest)/i),
        database: this.filterByPattern(allFiles, /(db|schema|migration|model|entity|repository|query)/i),
        tests: this.filterByPattern(allFiles, /(\.test\.|_test\.|\.spec\.|__tests__)/i),
        documentation: this.filterByPattern(allFiles, /(\.md|\.txt|docs\/)/i),
        cicd: this.filterByPattern(allFiles, /(\.github|\.gitlab-ci|jenkins|circleci)/i),
        security: this.filterByPattern(allFiles, /(crypto|hash|encryption|secret|tls|ssl|cors)/i),
      },
      breakingChanges: this.detectBreakingChanges(diff),
      dependencyUpgrades: this.filterByPattern(allFiles, /(package\.json|pom\.xml|requirements\.txt)/i),
      migrationRequirements: this.filterByPattern(allFiles, /(migration|schema)/i),
      configurationRisks: this.detectConfigRisks(allFiles),
      securitySensitiveChanges: this.filterByPattern(allFiles, /(auth|security|crypto|secret|password|token)/i),
      largeRefactors: this.detectLargeRefactors(diff),
    };

    PlatformEventBus.getInstance().publish("DiffAnalysisCompleted", { diffId: diff.metadata.id, analysis });
    return analysis;
  }

  private filterByPattern(files: FilePatch[], pattern: RegExp): FilePatch[] {
    return files.filter(f => pattern.test(f.filename));
  }

  private detectBreakingChanges(diff: RepositoryDiff): FilePatch[] {
    // Simple deterministic heuristic for breaking changes (e.g. major API deletions or signature changes)
    return diff.deletedFiles.filter(f => /(api|public|interface|export)/i.test(f.filename));
  }

  private detectConfigRisks(files: FilePatch[]): FilePatch[] {
    return this.filterByPattern(files, /(\.env|config\.ts|settings\.json|application\.yml)/i);
  }

  private detectLargeRefactors(diff: RepositoryDiff): FilePatch[] {
    const threshold = 500; // lines changed
    const largeFiles: FilePatch[] = [];
    const all = [...diff.addedFiles, ...diff.modifiedFiles];
    for (const file of all) {
      if (file.additions + file.deletions > threshold) {
        largeFiles.push(file);
      }
    }
    return largeFiles;
  }
}

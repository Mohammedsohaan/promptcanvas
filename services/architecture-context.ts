import { DocumentId, DocumentType } from "../types/document";
import { DocumentGraph } from "./document-graph";
import { ProjectIndex } from "./context-selector";

export type HealthRating = "Excellent" | "Good" | "Needs Attention" | "Critical";

export interface ArchitectureStats {
  overallScore: number; // 0 - 100
  architectureQuality: HealthRating;
  scalability: HealthRating;
  security: HealthRating;
  maintainability: HealthRating;
  performance: HealthRating;
  technicalDebt: HealthRating;
  deploymentReadiness: HealthRating;
}

export interface ArchitectureContext {
  layers: Record<string, number>;
  serviceCount: number;
  dependencyDepth: number;
  circularDependencies: string[][];
  singlePointsOfFailure: Array<{ id: DocumentId; title: string; dependentsCount: number }>;
  sharedComponents: Array<{ id: DocumentId; title: string; incomingParentsCount: number }>;
  authCoverage: boolean;
  apiCoverage: number;
  databaseCoverage: number;
  stats: ArchitectureStats;
}

/**
 * ArchitectureContextService produces deterministic architectural facts
 * using the existing DocumentGraph and ProjectIndex without creating duplicate graphs.
 */
export class ArchitectureContextService {
  public static compute(index: ProjectIndex, graph: DocumentGraph): ArchitectureContext {
    const totalDocuments = index.documents.length;

    // 1. Layer distribution
    const layers: Record<string, number> = {
      BusinessRequirements: 0, // PRD
      FunctionalStories: 0,    // User Stories
      InterfaceContracts: 0,   // API Spec
      PersistenceSchema: 0,    // Database Schema
      CustomNotes: 0,
    };

    let prdCount = 0;
    let storyCount = 0;
    let apiCount = 0;
    let dbCount = 0;
    let authFound = false;

    for (const doc of index.documents) {
      if (doc.type === DocumentType.PRD || doc.type === "PRD") {
        layers.BusinessRequirements++;
        prdCount++;
      } else if (doc.type === DocumentType.USER_STORIES || doc.type === "USER_STORIES") {
        layers.FunctionalStories++;
        storyCount++;
      } else if (doc.type === DocumentType.API_SPEC || doc.type === "API_SPEC") {
        layers.InterfaceContracts++;
        apiCount++;
      } else if (doc.type === DocumentType.DATABASE_SCHEMA || doc.type === "DATABASE_SCHEMA") {
        layers.PersistenceSchema++;
        dbCount++;
      } else {
        layers.CustomNotes++;
      }

      if (doc.title.toLowerCase().includes("auth") || doc.title.toLowerCase().includes("jwt")) {
        authFound = true;
      }
    }

    // 2. Dependency Depth & Circular Dependency Detection
    let maxDepth = 0;
    const circularDependencies: string[][] = [];

    // Helper for depth and cycle check via DFS
    const checkCyclesAndDepth = (
      nodeId: DocumentId,
      visited: Set<DocumentId>,
      path: DocumentId[]
    ): number => {
      visited.add(nodeId);
      path.push(nodeId);

      const children = graph.getChildren(nodeId);
      let localMaxDepth = path.length;

      for (const child of children) {
        if (path.includes(child.id)) {
          // Cycle detected!
          const cycleStart = path.indexOf(child.id);
          circularDependencies.push(path.slice(cycleStart).concat(child.id));
        } else if (!visited.has(child.id)) {
          const depth = checkCyclesAndDepth(child.id, new Set(visited), [...path]);
          if (depth > localMaxDepth) localMaxDepth = depth;
        }
      }

      return localMaxDepth;
    };

    const rootNodes = index.documents.filter((d) => !d.parentDocumentId);
    for (const root of rootNodes) {
      const depth = checkCyclesAndDepth(root.id, new Set(), []);
      if (depth > maxDepth) maxDepth = depth;
    }

    // 3. Single Points of Failure (High fan-out or bottleneck nodes)
    const singlePointsOfFailure: Array<{ id: DocumentId; title: string; dependentsCount: number }> = [];
    const sharedComponents: Array<{ id: DocumentId; title: string; incomingParentsCount: number }> = [];

    for (const doc of index.documents) {
      const descendants = graph.getDescendants(doc.id);
      if (descendants.length >= 3 || (totalDocuments > 1 && descendants.length >= totalDocuments - 1)) {
        singlePointsOfFailure.push({
          id: doc.id,
          title: doc.title,
          dependentsCount: descendants.length,
        });
      }

      // Check if doc is referenced by multiple parents
      const parentsCount = index.documents.filter(
        (d) => d.childrenIds && d.childrenIds.includes(doc.id)
      ).length;
      if (parentsCount > 1) {
        sharedComponents.push({
          id: doc.id,
          title: doc.title,
          incomingParentsCount: parentsCount,
        });
      }
    }

    // 4. Coverage Ratios
    const apiCoverage = storyCount > 0 ? Math.min(100, Math.round((apiCount / storyCount) * 100)) : 100;
    const databaseCoverage = apiCount > 0 ? Math.min(100, Math.round((dbCount / apiCount) * 100)) : 100;

    // 5. Score Calculation
    let score = 100;
    if (circularDependencies.length > 0) score -= 25;
    if (singlePointsOfFailure.length > 2) score -= 15;
    if (!authFound) score -= 10;
    if (apiCoverage < 70) score -= 15;
    if (databaseCoverage < 70) score -= 15;
    if (totalDocuments === 0) score = 0;

    const overallScore = Math.max(0, Math.min(100, score));

    const rate = (s: number): HealthRating => {
      if (s >= 85) return "Excellent";
      if (s >= 70) return "Good";
      if (s >= 50) return "Needs Attention";
      return "Critical";
    };

    const stats: ArchitectureStats = {
      overallScore,
      architectureQuality: rate(overallScore),
      scalability: rate(singlePointsOfFailure.length === 0 ? 90 : 60),
      security: rate(authFound ? 90 : 40),
      maintainability: rate(circularDependencies.length === 0 ? 85 : 45),
      performance: rate(maxDepth <= 4 ? 90 : 65),
      technicalDebt: rate(circularDependencies.length === 0 && apiCoverage >= 80 ? 85 : 55),
      deploymentReadiness: rate(overallScore >= 75 ? 85 : 50),
    };

    return {
      layers,
      serviceCount: totalDocuments,
      dependencyDepth: maxDepth,
      circularDependencies,
      singlePointsOfFailure,
      sharedComponents,
      authCoverage: authFound,
      apiCoverage,
      databaseCoverage,
      stats,
    };
  }
}

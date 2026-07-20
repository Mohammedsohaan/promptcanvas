import { DocumentId } from "../types/document";
import { DocumentGraph } from "./document-graph";
import { ProjectIndex } from "./context-selector";
import { ConsistencyContextService, ConsistencyContext } from "./consistency-context";
import { TraceabilityContextService, TraceabilityContext } from "./traceability-context";
import { ArchitectureContextService, ArchitectureContext, HealthRating } from "./architecture-context";

export type ReleaseStatus = "Ready" | "Nearly Ready" | "Needs Work" | "Not Ready";

export interface ReleaseIssue {
  category: "Consistency" | "Traceability" | "Architecture" | "Freshness" | "Documentation";
  severity: "Critical" | "High" | "Medium" | "Low";
  description: string;
  affectedDocuments: string[];
  reason?: string;
  recommendation?: string;
}

export interface ReleaseStats {
  overallReleaseScore: number; // 0 - 100
  consistency: HealthRating;
  traceability: HealthRating;
  architecture: HealthRating;
  documentation: HealthRating;
  freshness: HealthRating;
  deploymentReadiness: HealthRating;
}

export interface ReleaseContext {
  projectScore: number;
  readinessPercentage: number;
  status: ReleaseStatus;

  // Sub-scores
  consistencyScore: number;
  traceabilityScore: number;
  architectureScore: number;
  freshnessScore: number;
  documentationScore: number;

  // Issues by priority
  criticalIssues: ReleaseIssue[];
  highPriorityIssues: ReleaseIssue[];
  mediumIssues: ReleaseIssue[];
  lowIssues: ReleaseIssue[];

  // Blocker summaries
  blockingRequirements: string[];
  missingDocuments: string[];
  brokenChains: string[];
  architectureRisks: string[];
  deploymentRisks: string[];
  readyComponents: string[];

  stats: ReleaseStats;
  
  // Raw contexts for prompt reference
  consistencyContext: ConsistencyContext;
  traceabilityContext: TraceabilityContext;
  architectureContext: ArchitectureContext;
}

/**
 * ReleaseContextService aggregates deterministic outputs from ConsistencyContextService,
 * TraceabilityContextService, and ArchitectureContextService into a single ReleaseContext
 * without duplicating any graph traversal or analysis.
 */
export class ReleaseContextService {
  public static compute(index: ProjectIndex, graph: DocumentGraph): ReleaseContext {
    // 1. Compute underlying deterministic contexts
    const consistencyContext = ConsistencyContextService.compute(index, graph);
    const traceabilityContext = TraceabilityContextService.compute(index, graph);
    const architectureContext = ArchitectureContextService.compute(index, graph);

    // 2. Extract sub-scores
    const consistencyScore = consistencyContext.coveragePercentage;
    const traceabilityScore = traceabilityContext.overallCoverage;
    const architectureScore = architectureContext.stats.overallScore;

    const totalDocs = index.documents.length;
    const upToDateDocs = consistencyContext.freshnessCounts.upToDate;
    const freshnessScore = totalDocs > 0 ? Math.round((upToDateDocs / totalDocs) * 100) : 100;
    const documentationScore = totalDocs >= 4 ? 90 : totalDocs * 20;

    // 3. Overall Project Score (Weighted Average)
    const projectScore = Math.round(
      consistencyScore * 0.25 +
        traceabilityScore * 0.35 +
        architectureScore * 0.25 +
        freshnessScore * 0.15
    );

    const readinessPercentage = projectScore;

    // 4. Determine Release Status
    let status: ReleaseStatus = "Not Ready";
    if (projectScore >= 85 && traceabilityContext.summary.brokenChains === 0) {
      status = "Ready";
    } else if (projectScore >= 70) {
      status = "Nearly Ready";
    } else if (projectScore >= 50) {
      status = "Needs Work";
    } else {
      status = "Not Ready";
    }

    // 5. Categorize Issues
    const criticalIssues: ReleaseIssue[] = [];
    const highPriorityIssues: ReleaseIssue[] = [];
    const mediumIssues: ReleaseIssue[] = [];
    const lowIssues: ReleaseIssue[] = [];

    const blockingRequirements: string[] = [];
    const missingDocuments: string[] = [];
    const brokenChains: string[] = [];
    const architectureRisks: string[] = [];
    const deploymentRisks: string[] = [];
    const readyComponents: string[] = [];

    // Process Traceability Chains
    for (const chain of traceabilityContext.chains) {
      if (chain.status === "Complete") {
        readyComponents.push(chain.title);
      } else if (chain.status === "Broken") {
        brokenChains.push(chain.title);
        criticalIssues.push({
          category: "Traceability",
          severity: "Critical",
          description: `Broken requirement chain for "${chain.title}" (Missing ${chain.missingStage})`,
          affectedDocuments: chain.relatedDocumentIds,
          reason: "Implementation cannot proceed without linked downstream specifications",
          recommendation: `Generate ${chain.missingStage} for ${chain.title}`,
        });
      } else if (chain.status === "Partial") {
        highPriorityIssues.push({
          category: "Traceability",
          severity: "High",
          description: `Partial requirement chain for "${chain.title}" (Missing ${chain.missingStage})`,
          affectedDocuments: chain.relatedDocumentIds,
          reason: "Partial specification increases risk of implementation mismatch",
          recommendation: `Generate ${chain.missingStage} for ${chain.title}`,
        });
      }
    }

    // Process Consistency Gaps
    for (const gap of consistencyContext.traceabilityGaps) {
      missingDocuments.push(`${gap.sourceTitle} -> Missing ${gap.missingChildType}`);
      mediumIssues.push({
        category: "Consistency",
        severity: "Medium",
        description: gap.description,
        affectedDocuments: [gap.sourceDocumentId],
        reason: "Missing child specification",
        recommendation: `Create ${gap.missingChildType} for ${gap.sourceTitle}`,
      });
    }

    // Process Architecture Risks
    for (const spof of architectureContext.singlePointsOfFailure) {
      architectureRisks.push(`Single point of failure: ${spof.title} (${spof.dependentsCount} dependents)`);
      highPriorityIssues.push({
        category: "Architecture",
        severity: "High",
        description: `Single point of failure: "${spof.title}" has ${spof.dependentsCount} dependent components`,
        affectedDocuments: [spof.id],
        reason: "Bottleneck node increases blast radius of architectural changes",
        recommendation: "Decouple component or introduce intermediate abstractions",
      });
    }

    for (const cycle of architectureContext.circularDependencies) {
      architectureRisks.push(`Circular dependency: ${cycle.join(" -> ")}`);
      criticalIssues.push({
        category: "Architecture",
        severity: "Critical",
        description: `Circular dependency detected: ${cycle.join(" -> ")}`,
        affectedDocuments: cycle,
        reason: "Circular dependencies prevent clean modularization and automated builds",
        recommendation: "Refactor cycle to follow a strict top-down dependency hierarchy",
      });
    }

    if (!architectureContext.authCoverage) {
      deploymentRisks.push("Missing Authentication / JWT specification");
      highPriorityIssues.push({
        category: "Architecture",
        severity: "High",
        description: "No explicit authentication or JWT specification found in project graph",
        affectedDocuments: [],
        reason: "Security risk for production deployment",
        recommendation: "Add Authentication & Authorization specifications to PRD and API Specs",
      });
    }

    // Rate helper
    const rate = (s: number): HealthRating => {
      if (s >= 85) return "Excellent";
      if (s >= 70) return "Good";
      if (s >= 50) return "Needs Attention";
      return "Critical";
    };

    const stats: ReleaseStats = {
      overallReleaseScore: projectScore,
      consistency: rate(consistencyScore),
      traceability: rate(traceabilityScore),
      architecture: rate(architectureScore),
      documentation: rate(documentationScore),
      freshness: rate(freshnessScore),
      deploymentReadiness: rate(projectScore),
    };

    return {
      projectScore,
      readinessPercentage,
      status,
      consistencyScore,
      traceabilityScore,
      architectureScore,
      freshnessScore,
      documentationScore,
      criticalIssues,
      highPriorityIssues,
      mediumIssues,
      lowIssues,
      blockingRequirements,
      missingDocuments,
      brokenChains,
      architectureRisks,
      deploymentRisks,
      readyComponents,
      stats,
      consistencyContext,
      traceabilityContext,
      architectureContext,
    };
  }
}

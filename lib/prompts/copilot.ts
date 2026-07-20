import { CopilotMode } from "@/types/ai";
import { ProjectAIContext } from "@/services/ai-context";
import { ConsistencyContext } from "@/services/consistency-context";
import { TraceabilityContext } from "@/services/traceability-context";
import { ArchitectureContext } from "@/services/architecture-context";
import { ReleaseContext } from "@/services/release-context";
import { RepositoryAnalysisContext } from "@/services/repository/repository-analysis";

export interface ProjectPromptInput {
  mode?: CopilotMode;
  projectContext: ProjectAIContext;
  consistencyContext?: ConsistencyContext;
  traceabilityContext?: TraceabilityContext;
  architectureContext?: ArchitectureContext;
  releaseContext?: ReleaseContext;
  repositoryAnalysisContext?: RepositoryAnalysisContext;
  question: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
}

/**
 * Builds the AI Project Copilot prompt following strict system instructions,
 * structured project context layout, and required reference/metadata output sections.
 *
 * Supports GENERAL, REVIEWER, TRACEABILITY, ARCHITECT, RELEASE, and IMPLEMENTATION modes.
 */
export function buildProjectCopilotPrompt(input: ProjectPromptInput): string {
  const mode = input.mode || CopilotMode.GENERAL;
  const {
    projectContext,
    consistencyContext,
    traceabilityContext,
    architectureContext,
    releaseContext,
    repositoryAnalysisContext,
    question,
    history = [],
  } = input;
  const { index, relevantDocuments } = projectContext;

  // Format Document Inventory (lightweight index)
  const inventoryLines = index.documents.map(
    (doc) =>
      `- ID: "${doc.id}" | Title: "${doc.title}" | Type: ${doc.type} | Version: v${doc.version} | Freshness: ${doc.freshness} | Parent: ${doc.parentDocumentId || "None"}`
  );

  // Format Relevant Documents (full content)
  const relevantDocsContent = relevantDocuments.map((doc) => {
    let contentStr = "";
    if (typeof doc.content === "string") {
      contentStr = doc.content;
    } else if (doc.content && typeof doc.content === "object") {
      contentStr = doc.content.text || JSON.stringify(doc.content, null, 2);
    }

    return `=== DOCUMENT START ===
ID: ${doc.id}
Title: ${doc.title}
Type: ${doc.type}
Version: v${doc.version}
Parent ID: ${doc.parentDocumentId || "None"}
Content:
${contentStr}
=== DOCUMENT END ===`;
  });

  // Format Conversation History
  const historyLines = history
    .map((msg) => `${msg.role.toUpperCase()}: ${msg.content}`)
    .join("\n\n");

  // Format Deterministic Consistency Context if available
  let consistencySection = "";
  if (consistencyContext) {
    consistencySection = `------------------------------------------------
Project Consistency Context (Deterministic Facts)
------------------------------------------------
Total Documents: ${consistencyContext.totalDocuments}
Freshness: ${consistencyContext.freshnessCounts.upToDate} Up-to-Date, ${consistencyContext.freshnessCounts.outdated} Outdated, ${consistencyContext.freshnessCounts.unknown} Unknown
Traceability Coverage: ${consistencyContext.coveragePercentage}%
Version Mismatches: ${consistencyContext.versionMismatchCount}
Outdated Documents: ${consistencyContext.outdatedDocuments.map((d) => `"${d.title}" (${d.id})`).join(", ") || "None"}
Orphan Documents: ${consistencyContext.orphanDocuments.map((d) => `"${d.title}" (${d.id})`).join(", ") || "None"}
Traceability Gaps:
${
  consistencyContext.traceabilityGaps.length > 0
    ? consistencyContext.traceabilityGaps.map((g) => `- ${g.description}`).join("\n")
    : "- None"
}
`;
  }

  // Format Deterministic Traceability Context if available
  let traceabilitySection = "";
  if (traceabilityContext) {
    const chainsList = traceabilityContext.chains.map(
      (c) =>
        `- Chain: "${c.title}" | Status: ${c.status} (${c.coveragePercentage}%) | Current Stage: ${c.currentStage} | Missing Stage: ${c.missingStage}`
    );

    traceabilitySection = `------------------------------------------------
Project Requirement Traceability Context (Deterministic Chains)
------------------------------------------------
Overall Requirement Coverage: ${traceabilityContext.overallCoverage}%
Total Chains: ${traceabilityContext.summary.totalChains} (Complete: ${traceabilityContext.summary.completeChains}, Partial: ${traceabilityContext.summary.partialChains}, Broken: ${traceabilityContext.summary.brokenChains})
Missing Artifact Counts: User Stories (${traceabilityContext.summary.missingUserStories}), API Specs (${traceabilityContext.summary.missingApiSpecs}), DB Schemas (${traceabilityContext.summary.missingDbSchemas})
Unlinked Documents: ${traceabilityContext.summary.unlinkedDocuments.map((d) => `"${d.title}" (${d.type})`).join(", ") || "None"}

Requirement Chains:
${chainsList.join("\n")}
`;
  }

  // Format Deterministic Architecture Context if available
  let architectureSection = "";
  if (architectureContext) {
    architectureSection = `------------------------------------------------
Project Architecture Context (Deterministic Facts)
------------------------------------------------
Overall Architecture Score: ${architectureContext.stats.overallScore} / 100
Dependency Depth: ${architectureContext.dependencyDepth}
Circular Dependencies: ${architectureContext.circularDependencies.length > 0 ? architectureContext.circularDependencies.map((c) => c.join(" -> ")).join("; ") : "None"}
Single Points of Failure: ${architectureContext.singlePointsOfFailure.map((s) => `"${s.title}" (${s.dependentsCount} dependents)`).join(", ") || "None"}
Shared Components: ${architectureContext.sharedComponents.map((s) => `"${s.title}" (${s.incomingParentsCount} parents)`).join(", ") || "None"}
Auth Coverage: ${architectureContext.authCoverage ? "Present" : "Missing"}
API Coverage: ${architectureContext.apiCoverage}%
Database Coverage: ${architectureContext.databaseCoverage}%

Layer Breakdown:
- Business Requirements (PRD): ${architectureContext.layers.BusinessRequirements || 0}
- Functional Stories: ${architectureContext.layers.FunctionalStories || 0}
- Interface Contracts (API Spec): ${architectureContext.layers.InterfaceContracts || 0}
- Persistence Schema (DB Schema): ${architectureContext.layers.PersistenceSchema || 0}
- Custom Notes: ${architectureContext.layers.CustomNotes || 0}
`;
  }

  // Format Deterministic Release Context if available
  let releaseSection = "";
  if (releaseContext) {
    releaseSection = `------------------------------------------------
Project Release Context (Aggregated Deterministic Facts)
------------------------------------------------
Overall Release Score: ${releaseContext.projectScore} / 100
Readiness Status: ${releaseContext.status}
Consistency Score: ${releaseContext.consistencyScore}%
Traceability Score: ${releaseContext.traceabilityScore}%
Architecture Score: ${releaseContext.architectureScore}%
Freshness Score: ${releaseContext.freshnessScore}%

Ready Components: ${releaseContext.readyComponents.join(", ") || "None"}
Critical Blockers (${releaseContext.criticalIssues.length}): ${releaseContext.criticalIssues.map((i) => i.description).join("; ") || "None"}
High Priority Issues (${releaseContext.highPriorityIssues.length}): ${releaseContext.highPriorityIssues.map((i) => i.description).join("; ") || "None"}
Broken Chains: ${releaseContext.brokenChains.join(", ") || "None"}
Architecture Risks: ${releaseContext.architectureRisks.join(", ") || "None"}
Deployment Risks: ${releaseContext.deploymentRisks.join(", ") || "None"}
`;
  }

  // Format Repository Analysis Context if available
  let repositorySection = "";
  if (repositoryAnalysisContext) {
    repositorySection = `------------------------------------------------
Project Repository Analysis Context (Deterministic Facts)
------------------------------------------------
Implementation Coverage: ${repositoryAnalysisContext.implementationCoverage}%
Specification Coverage: ${repositoryAnalysisContext.specificationCoverage}%
Repository Health Score: ${repositoryAnalysisContext.healthScore}/100
Implemented Requirements: ${repositoryAnalysisContext.implementedRequirements.join(", ") || "None"}
Missing Features: ${repositoryAnalysisContext.missingFeatures.join(", ") || "None"}
Database Drift: ${repositoryAnalysisContext.databaseDrift.join("; ") || "None"}
Dead Code / Unused APIs: ${repositoryAnalysisContext.deadCode.join("; ") || "None"}
Specification Drift / Violations: ${repositoryAnalysisContext.specificationDrift.join("; ") || "None"}
`;
  }

  const isReviewerMode = mode === CopilotMode.REVIEWER;
  const isTraceabilityMode = mode === CopilotMode.TRACEABILITY;
  const isArchitectMode = mode === CopilotMode.ARCHITECT;
  const isReleaseMode = mode === CopilotMode.RELEASE;
  const isImplementationMode = mode === CopilotMode.IMPLEMENTATION;

  let modeSpecificInstructions = "";
  let analysisType = "general";

  if (isReviewerMode) {
    analysisType = "consistency";
    modeSpecificInstructions = `CONSISTENCY ANALYZER INSTRUCTIONS (CopilotMode.REVIEWER):
You are performing an automated Consistency Analysis across the entire project graph.
Detect and analyze: Missing APIs/Stories/Tables, Broken Traceability, Orphan Documents, Contradictions, Version Mismatches, Outdated Documents, Missing Acceptance Criteria/Security/Error Handling.

Output structure:
# Executive Summary
Overall Health Score: Excellent | Good | Needs Attention | Critical

## Project Health Indicators
- Architecture Health: Excellent | Good | Needs Attention | Critical
- Requirement Coverage: Excellent | Good | Needs Attention | Critical
- Document Freshness: Excellent | Good | Needs Attention | Critical
- Traceability: Excellent | Good | Needs Attention | Critical
- Documentation Completeness: Excellent | Good | Needs Attention | Critical

# Major Findings
### Finding 1
- Severity: High | Medium | Low
- Issue: <Description>
- Affected Documents: <IDs or Titles>
- Recommendation: <Fix recommendation>
- Priority: Immediate | High | Medium | Low
`;
  } else if (isTraceabilityMode) {
    analysisType = "traceability";
    modeSpecificInstructions = `REQUIREMENT TRACEABILITY INSTRUCTIONS (CopilotMode.TRACEABILITY):
Explain how every requirement flows through: PRD → User Story → API Specification → Database Schema.
The platform has ALREADY deterministically computed requirement chains. Do NOT recompute facts.

Output structure:
# Executive Summary
Requirement Coverage: ${traceabilityContext?.overallCoverage || 0}%
Overall Traceability Health: ${traceabilityContext?.summary.healthScores.traceabilityHealth || "Good"}

## Chain Summary
- Complete Chains: ${traceabilityContext?.summary.completeChains || 0}
- Partial Chains: ${traceabilityContext?.summary.partialChains || 0}
- Broken Chains: ${traceabilityContext?.summary.brokenChains || 0}

# Detailed Traceability Analysis
### Requirement: <Title>
- Severity: High | Medium | Low
- Current Stage: <Stage>
- Missing Stage: <Stage>
- Affected Documents: <IDs or Titles>
- Impact: <Downstream risk>
- Recommendation: <Fix recommendation>
- Priority: Immediate | High | Medium | Low
`;
  } else if (isArchitectMode) {
    analysisType = "architecture";
    modeSpecificInstructions = `ARCHITECTURE REVIEW INSTRUCTIONS (CopilotMode.ARCHITECT):
Evaluate whether the software architecture is production-ready across Scalability, Security, Maintainability, Performance, and Technical Debt.
The platform has ALREADY deterministically computed architectural layers, circular dependencies, bottleneck nodes, and coverage ratios. Do NOT recompute or contradict these facts.

Output structure:
# Executive Summary

Architecture Score: ${architectureContext?.stats.overallScore || 0} / 100
Overall Readiness: ${architectureContext?.stats.deploymentReadiness || "Good"}

## Strengths
- <Architecture Strength 1>
- <Architecture Strength 2>

## Weaknesses
- <Architecture Weakness 1>
- <Architecture Weakness 2>

# Layer Review
# Scalability
# Security
# Maintainability
# Performance
# Technical Debt

# Major Architectural Findings

### Finding 1
- Category: Scalability | Security | Maintainability | Performance | Technical Debt
- Severity: High | Medium | Low
- Issue: <Architectural issue description>
- Affected Components: <IDs or Titles>
- Risk: <Production/scaling risk>
- Recommendation: <Refactoring recommendation>
- Priority: Immediate | High | Medium | Low
`;
  } else if (isReleaseMode) {
    analysisType = "release";
    modeSpecificInstructions = `RELEASE READINESS INSTRUCTIONS (CopilotMode.RELEASE):
Evaluate whether the project is ready for development or production deployment.
The platform has ALREADY deterministically aggregated Consistency, Traceability, Architecture, and Freshness scores above. Do NOT recompute these facts.
Summarize blockers, explain release risks, identify missing work, and recommend a minimum viable completion path.

Output structure:

# Executive Summary

Release Readiness: ${releaseContext?.status || "Needs Work"}
Overall Score: ${releaseContext?.projectScore || 0} / 100

## Ready Components
- <Component 1>
- <Component 2>

## Blocking Issues
- <Blocker 1>
- <Blocker 2>

## High Priority Work
- <High Priority Task 1>

## Medium Priority Work
- <Medium Priority Task 1>

## Low Priority Work
- <Low Priority Task 1>

## Recommended Release Plan

### Blocker 1
- Category: Traceability | Architecture | Consistency | Freshness
- Severity: Critical | High | Medium | Low
- Issue: <Clear description of blocker>
- Affected Documents: <IDs or Titles>
- Reason: <Why it blocks release>
- Recommendation: <Minimum viable completion path>
- Priority: Immediate | High | Medium | Low
`;
  } else if (isImplementationMode) {
    analysisType = "implementation";
    modeSpecificInstructions = `IMPLEMENTATION REVIEW INSTRUCTIONS (CopilotMode.IMPLEMENTATION):
Analyze code quality, specification drift, database schema drift, unreferenced/dead code, and technical debt between the generated requirements and the repository implementation.
The platform has ALREADY deterministically computed repository facts. Do NOT recompute these facts.

Output structure:
# Executive Summary
Implementation Coverage: ${repositoryAnalysisContext?.implementationCoverage || 0}%
Repository Health: ${repositoryAnalysisContext?.healthScore || 0} / 100

## Implemented Features
- <Feature / Spec Title>

## Missing / Incomplete Features
- <Feature / Spec Title>

## Database Drift Detected
- <Drift Description>

## Architectural Deviations & Technical Debt
- <Deviation description>

# Refactoring Recommendations
1. <Refactoring task 1>
`;
  }

  return `SYSTEM OBJECTIVE
You are the AI Product Engineer for PromptCanvas.
Help software teams understand, review, improve and evolve software projects.
Current Copilot Mode: ${mode}

SYSTEM RULES:
1. Use ONLY the supplied project context below.
2. Never invent or fabricate requirements, APIs, tables, or project details.
3. Always explain your reasoning using graph relationships, document versions, and freshness states.
4. Always identify uncertainty. If information is unavailable or not found in the documents, explicitly state that clearly.
5. At the very end of every answer, you MUST append the following two structured Markdown sections EXACTLY as formatted:

## Referenced Documents

- id: <documentId>
  reason: <why referenced>
  confidence: <high|medium|low>

## Response Metadata

reasoning_scope: project
analysis_type: ${analysisType}
confidence: <high|medium|low>
missing_information:
- <item or "None">

${modeSpecificInstructions}
------------------------------------------------
Project Summary
------------------------------------------------
Project ID: ${index.projectId}
Total Documents: ${index.documents.length}

------------------------------------------------
Document Inventory
------------------------------------------------
${inventoryLines.join("\n")}

${consistencySection}${traceabilitySection}${architectureSection}${releaseSection}${repositorySection}------------------------------------------------
Relevant Documents
------------------------------------------------
${relevantDocsContent.length > 0 ? relevantDocsContent.join("\n\n") : "No specific document contents requested."}

------------------------------------------------
Conversation History
------------------------------------------------
${historyLines || "No previous conversation history."}

------------------------------------------------
Current User Question
------------------------------------------------
${question}
`;
}

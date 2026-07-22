import { DocumentId, DocumentType, DocumentFreshness } from "../types/document";
import { DocumentGraph } from "./document-graph";
import { ImpactAnalysisService } from "./impact-analysis";
import { ProjectIndex } from "./context-selector";

export interface TraceabilityGap {
  sourceDocumentId: DocumentId;
  sourceTitle: string;
  sourceType: DocumentType | string;
  missingChildType: DocumentType | string;
  description: string;
}

export interface ConsistencyContext {
  totalDocuments: number;
  typeCounts: Record<string, number>;
  freshnessCounts: {
    upToDate: number;
    outdated: number;
    unknown: number;
  };
  outdatedDocuments: Array<{ id: DocumentId; title: string }>;
  orphanDocuments: Array<{ id: DocumentId; title: string; parentId: DocumentId | null }>;
  traceabilityGaps: TraceabilityGap[];
  versionMismatchCount: number;
  coveragePercentage: number;
}

/**
 * ConsistencyContextService produces deterministic project consistency facts
 * using the existing DocumentGraph, ImpactAnalysisService, and version metadata.
 *
 * It does NOT duplicate graph traversal or create another graph.
 */
export class ConsistencyContextService {
  public static compute(index: ProjectIndex, graph: DocumentGraph): ConsistencyContext {
    const totalDocuments = index.documents.length;
    const typeCounts: Record<string, number> = {};
    let upToDateCount = 0;
    let outdatedCount = 0;
    let unknownCount = 0;

    const outdatedDocuments: Array<{ id: DocumentId; title: string }> = [];
    const orphanDocuments: Array<{ id: DocumentId; title: string; parentId: DocumentId | null }> = [];
    const traceabilityGaps: TraceabilityGap[] = [];

    let versionMismatchCount = 0;

    for (const item of index.documents) {
      // 1. Type counts
      typeCounts[item.type] = (typeCounts[item.type] || 0) + 1;

      // 2. Freshness counts & outdated list
      if (item.freshness === DocumentFreshness.OUTDATED) {
        outdatedCount++;
        outdatedDocuments.push({ id: item.id, title: item.title });
      } else if (item.freshness === DocumentFreshness.UP_TO_DATE) {
        upToDateCount++;
      } else {
        unknownCount++;
      }

      // 3. Orphan Detection
      // A document is considered an orphan if it specifies a parent ID that does not exist in the graph,
      // or if it is a non-root type (User Stories, API Spec, DB Schema) without a parent document.
      if (item.parentDocumentId) {
        const parentDoc = graph.getDocument(item.parentDocumentId);
        if (!parentDoc) {
          orphanDocuments.push({
            id: item.id,
            title: item.title,
            parentId: item.parentDocumentId,
          });
        }
      } else {
        // Non-PRD / Non-Root document missing a parent
        if (item.type !== DocumentType.PRD && item.type !== DocumentType.CUSTOM) {
          orphanDocuments.push({
            id: item.id,
            title: item.title,
            parentId: null,
          });
        }
      }

      // 4. Traceability Gaps & Flow Validation
      // PRD -> should have User Stories
      if (item.type === DocumentType.PRD) {
        const children = graph.getChildren(item.id);
        const hasUserStories = children.some(
          (c) => c.type === DocumentType.USER_STORIES
        );
        if (!hasUserStories) {
          traceabilityGaps.push({
            sourceDocumentId: item.id,
            sourceTitle: item.title,
            sourceType: item.type,
            missingChildType: DocumentType.USER_STORIES,
            description: `PRD "${item.title}" has no linked User Stories document downstream.`,
          });
        }
      }

      // User Stories -> should have API Spec
      if (item.type === DocumentType.USER_STORIES) {
        const children = graph.getChildren(item.id);
        const hasApiSpec = children.some(
          (c) => c.type === DocumentType.API_SPEC
        );
        if (!hasApiSpec) {
          traceabilityGaps.push({
            sourceDocumentId: item.id,
            sourceTitle: item.title,
            sourceType: item.type,
            missingChildType: DocumentType.API_SPEC,
            description: `User Stories "${item.title}" has no linked API Specification downstream.`,
          });
        }
      }

      // API Spec -> should have Database Schema
      if (item.type === DocumentType.API_SPEC) {
        const children = graph.getChildren(item.id);
        const hasDbSchema = children.some(
          (c) => c.type === DocumentType.DATABASE_SCHEMA
        );
        if (!hasDbSchema) {
          traceabilityGaps.push({
            sourceDocumentId: item.id,
            sourceTitle: item.title,
            sourceType: item.type,
            missingChildType: DocumentType.DATABASE_SCHEMA,
            description: `API Specification "${item.title}" has no linked Database Schema downstream.`,
          });
        }
      }

      // 5. Version Mismatch
      // If parent has higher version or updated timestamp than generated child
      if (item.parentDocumentId) {
        const parent = graph.getDocument(item.parentDocumentId);
        if (parent && parent.version > item.version) {
          versionMismatchCount++;
        }
      }
    }

    // 6. Coverage Percentage
    const expectedLinkTypes = [DocumentType.USER_STORIES, DocumentType.API_SPEC, DocumentType.DATABASE_SCHEMA];
    const totalPossibleGaps = totalDocuments > 0 ? Math.max(1, totalDocuments) : 1;
    const coveragePercentage = Math.max(
      0,
      Math.min(100, Math.round(100 - (traceabilityGaps.length / totalPossibleGaps) * 100))
    );

    return {
      totalDocuments,
      typeCounts,
      freshnessCounts: {
        upToDate: upToDateCount,
        outdated: outdatedCount,
        unknown: unknownCount,
      },
      outdatedDocuments,
      orphanDocuments,
      traceabilityGaps,
      versionMismatchCount,
      coveragePercentage,
    };
  }
}

import { Document, DocumentId, ProjectId, DocumentMetadata, mapDbDocumentToDomain } from "../types/document";
import { DocumentGraph } from "./document-graph";
import { documentRepository } from "../repositories/supabase-document-repository";
import { ImpactAnalysisService } from "./impact-analysis";
import { ProjectIndex, ProjectIndexItem } from "./context-selector";

export interface AIContext {
  currentDocument: Document;
  parent?: Document;
  children: Document[];
  ancestors: Document[];
  descendants: Document[];
  siblings: Document[];
  projectSummary?: string;
  metadata?: DocumentMetadata;
}

export interface ProjectAIContext {
  projectId: ProjectId;
  index: ProjectIndex;
  relevantDocuments: Document[];
  graph: DocumentGraph;
}

export class AIContextService {
  /**
   * Fetches all project documents, constructs the graph, and returns the assembled AIContext.
   */
  public static async getContext(projectId: ProjectId, documentId: DocumentId): Promise<AIContext | null> {
    const rawDocs = await documentRepository.getProjectDocuments(projectId);
    const documents = rawDocs.map(mapDbDocumentToDomain);
    const graph = new DocumentGraph(documents);
    return this.assembleContext(documentId, graph);
  }

  /**
   * Assembles the full AI context for a given document using the document graph.
   */
  public static assembleContext(
    documentId: DocumentId,
    graph: DocumentGraph,
    projectSummary?: string
  ): AIContext | null {
    const currentDocument = graph.getDocument(documentId);
    if (!currentDocument) return null;

    return {
      currentDocument,
      parent: graph.getParent(documentId),
      children: graph.getChildren(documentId),
      ancestors: graph.getAncestors(documentId),
      descendants: graph.getDescendants(documentId),
      siblings: graph.getSiblingDocuments(documentId),
      projectSummary,
      metadata: currentDocument.metadata,
    };
  }

  /**
   * Returns lightweight project metadata, inventory, graph, freshness, and parent/child relationships.
   * Does NOT load document content.
   */
  public static async getProjectIndex(projectId: ProjectId): Promise<ProjectIndex> {
    const rawDocs = await documentRepository.getProjectDocuments(projectId);
    const documents = rawDocs.map(mapDbDocumentToDomain);
    const graph = new DocumentGraph(documents);
    const freshnessMap = ImpactAnalysisService.computeFreshnessMap(documents, graph);

    const indexItems: ProjectIndexItem[] = documents.map((doc) => ({
      id: doc.id,
      title: doc.title,
      type: doc.type,
      version: doc.version,
      freshness: freshnessMap.get(doc.id) || ImpactAnalysisService.getDocumentFreshness(doc.id, graph),
      parentDocumentId: doc.parentDocumentId,
      childrenIds: graph.getChildren(doc.id).map((c) => c.id),
    }));

    return {
      projectId,
      projectTitle: `Project ${projectId}`,
      documents: indexItems,
    };
  }

  /**
   * Returns full document contents, metadata, relationships, and graph for the requested document IDs.
   * AIContextService does NOT select document IDs itself — that is owned by ContextSelector.
   */
  public static async getProjectContext(
    projectId: ProjectId,
    documentIds: DocumentId[]
  ): Promise<ProjectAIContext> {
    const rawDocs = await documentRepository.getProjectDocuments(projectId);
    const allDocuments = rawDocs.map(mapDbDocumentToDomain);
    const graph = new DocumentGraph(allDocuments);
    const index = await this.getProjectIndex(projectId);

    const targetIdsSet = new Set(documentIds);
    const relevantDocuments = allDocuments.filter((doc) => targetIdsSet.has(doc.id));

    return {
      projectId,
      index,
      relevantDocuments,
      graph,
    };
  }
}

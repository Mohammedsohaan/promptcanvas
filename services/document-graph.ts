import { Document, DocumentId, ProjectId, mapDbDocumentToDomain } from "../types/document";

export class DocumentGraph {
  private documents: Map<DocumentId, Document>;
  
  // Maps a parent document ID to a Set of child document IDs.
  // Designed internally to handle generic directed edges, preparing for 
  // future relationship types (e.g. DEPENDS_ON, REFERENCES) by isolating 
  // graph structure from the single parent_document_id field.
  private edges: Map<DocumentId, Set<DocumentId>>;

  /**
   * Constructs an immutable DocumentGraph from a collection of documents.
   * Internal state is never mutated after construction.
   */
  constructor(documents: any[]) {
    this.documents = new Map();
    this.edges = new Map();

    const domainDocs = documents.map(mapDbDocumentToDomain);

    // Index all documents
    for (const doc of domainDocs) {
      this.documents.set(doc.id, doc);
      if (!this.edges.has(doc.id)) {
        this.edges.set(doc.id, new Set());
      }
    }

    // Build directed edges (parent -> child)
    for (const doc of domainDocs) {
      if (doc.parentDocumentId) {
        // Only build edge if the parent actually exists in the provided collection
        if (this.documents.has(doc.parentDocumentId)) {
          if (!this.edges.has(doc.parentDocumentId)) {
            this.edges.set(doc.parentDocumentId, new Set());
          }
          this.edges.get(doc.parentDocumentId)!.add(doc.id);
        }
      }
    }
  }

  public getProjectGraph(projectId: ProjectId): Document[] {
    return Array.from(this.documents.values()).filter(d => d.projectId === projectId);
  }

  public getDocument(id: DocumentId): Document | undefined {
    return this.documents.get(id);
  }

  public getChildren(documentId: DocumentId): Document[] {
    const childIds = this.edges.get(documentId);
    if (!childIds) return [];
    
    return Array.from(childIds)
      .map(id => this.documents.get(id))
      .filter((doc): doc is Document => doc !== undefined);
  }

  public getParent(documentId: DocumentId): Document | undefined {
    const doc = this.documents.get(documentId);
    if (!doc || !doc.parentDocumentId) return undefined;
    return this.documents.get(doc.parentDocumentId);
  }

  public getAncestors(documentId: DocumentId): Document[] {
    const ancestors: Document[] = [];
    let currentId = this.documents.get(documentId)?.parentDocumentId;
    const visited = new Set<DocumentId>([documentId]);

    while (currentId) {
      if (visited.has(currentId)) break; // Safeguard against cycles
      visited.add(currentId);
      
      const parent = this.documents.get(currentId);
      if (!parent) break;
      
      ancestors.push(parent);
      currentId = parent.parentDocumentId;
    }

    return ancestors;
  }

  public getDescendants(documentId: DocumentId): Document[] {
    const descendants: Document[] = [];
    const queue: DocumentId[] = [documentId];
    const visited = new Set<DocumentId>([documentId]);

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      const children = this.edges.get(currentId) || new Set();
      
      for (const childId of children) {
        if (!visited.has(childId)) {
          visited.add(childId);
          queue.push(childId);
          
          const child = this.documents.get(childId);
          if (child) descendants.push(child);
        }
      }
    }

    return descendants;
  }

  public getLineage(documentId: DocumentId): Document[] {
    const ancestors = this.getAncestors(documentId);
    const descendants = this.getDescendants(documentId);
    const current = this.documents.get(documentId);
    
    // Order: Root -> ... -> Parent -> Current -> Children -> ...
    const lineage = [...ancestors].reverse();
    if (current) lineage.push(current);
    lineage.push(...descendants);

    return lineage;
  }

  public getSiblingDocuments(documentId: DocumentId): Document[] {
    const parent = this.getParent(documentId);
    if (!parent) return [];
    
    return this.getChildren(parent.id).filter(child => child.id !== documentId);
  }

  public getTraceabilityReport(documentId: DocumentId): {
    implementedRequirements: Document[];
    missingDownstreamWork: string[];
    partialImplementations: Document[];
  } {
    const ancestors = this.getAncestors(documentId);
    const descendants = this.getDescendants(documentId);
    const lineage = [...ancestors, ...descendants];
    
    const implementedRequirements = lineage.filter(d => d.type === "PRD" || d.type === "USER_STORIES");
    const missingDownstreamWork: string[] = [];
    const partialImplementations: Document[] = [];

    // Analyze lineage completeness
    const hasAPI = lineage.some(d => d.type === "API_SPEC");
    const hasDB = lineage.some(d => d.type === "DATABASE_SCHEMA");
    const hasTests = lineage.some(d => d.type === "TEST_CASES");

    if (implementedRequirements.length > 0) {
      if (!hasAPI && !hasDB) missingDownstreamWork.push("Implementation Specs (API/DB)");
      if (!hasTests) missingDownstreamWork.push("Test Cases");
      
      if (!hasTests || (!hasAPI && !hasDB)) {
        partialImplementations.push(...implementedRequirements);
      }
    }

    return {
      implementedRequirements,
      missingDownstreamWork,
      partialImplementations
    };
  }
}

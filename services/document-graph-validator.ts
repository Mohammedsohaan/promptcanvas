import { Document, DocumentId } from "../types/document";
import { DocumentGraph } from "./document-graph";

export interface GraphValidationResult {
  isValid: boolean;
  cycles: DocumentId[][];
  orphans: DocumentId[]; // References a parent that doesn't exist
  invalidReferences: DocumentId[]; // E.g., self-references
  duplicateParents: DocumentId[]; // For future-proofing multiple relation types
}

export class DocumentGraphValidator {
  
  /**
   * Validates a collection of documents for graph integrity issues.
   */
  public static validateGraph(documents: Document[]): GraphValidationResult {
    const graph = new DocumentGraph(documents);
    const docMap = new Map<DocumentId, Document>();
    documents.forEach(d => docMap.set(d.id, d));
    
    const cycles: DocumentId[][] = [];
    const orphans: DocumentId[] = [];
    const invalidReferences: DocumentId[] = [];
    
    const visited = new Set<DocumentId>();
    const recursionStack = new Set<DocumentId>();

    for (const doc of documents) {
      // Check for self-reference
      if (doc.parentDocumentId && doc.parentDocumentId === doc.id) {
        invalidReferences.push(doc.id);
      }

      // Check for orphans
      if (doc.parentDocumentId && !docMap.has(doc.parentDocumentId)) {
        orphans.push(doc.id);
      }

      // Detect cycles
      if (!visited.has(doc.id)) {
        this.detectCycle(doc.id, graph, visited, recursionStack, cycles);
      }
    }

    return {
      isValid: cycles.length === 0 && orphans.length === 0 && invalidReferences.length === 0,
      cycles,
      orphans,
      invalidReferences,
      duplicateParents: [] // Kept for the interface contract
    };
  }

  private static detectCycle(
    nodeId: DocumentId,
    graph: DocumentGraph,
    visited: Set<DocumentId>,
    recursionStack: Set<DocumentId>,
    cycles: DocumentId[][]
  ) {
    visited.add(nodeId);
    recursionStack.add(nodeId);

    const children = graph.getChildren(nodeId);
    for (const child of children) {
      if (!visited.has(child.id)) {
        this.detectCycle(child.id, graph, visited, recursionStack, cycles);
      } else if (recursionStack.has(child.id)) {
        // Cycle detected
        cycles.push([nodeId, child.id]);
      }
    }

    recursionStack.delete(nodeId);
  }
}

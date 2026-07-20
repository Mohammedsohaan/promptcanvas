import { Document, DocumentId, ProjectId } from "../types/document";

export interface IDocumentRepository {
  /**
   * Fetch a single document by its ID
   */
  getDocument(id: DocumentId): Promise<Document | null>;

  /**
   * Fetch all documents for a given project
   */
  getProjectDocuments(projectId: ProjectId): Promise<Document[]>;

  /**
   * Save a new document or update an existing one
   */
  saveDocument(document: Document): Promise<Document>;

  /**
   * Update a document's metadata specifically
   */
  updateMetadata(id: DocumentId, metadata: any): Promise<void>;

  /**
   * Delete a document by its ID
   */
  deleteDocument(id: DocumentId): Promise<void>;
}

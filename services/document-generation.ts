import { Document, DocumentType, DocumentStatus, DocumentId, ProjectId, incrementVersion } from "../types/document";
import { documentRepository } from "../repositories/supabase-document-repository";
import { SupabaseClient } from "@supabase/supabase-js";

export interface GenerateDocumentOptions {
  projectId: ProjectId;
  parentDocumentId: DocumentId;
  title: string;
  type: DocumentType;
  content: string; // The generated markdown or text
}

export class DocumentGenerationService {
  /**
   * Creates and persists a newly generated document based on AI output.
   * This isolates the document creation concern away from the AI orchestrator.
   */
  public static async createGeneratedDocument(
    options: GenerateDocumentOptions,
    client?: SupabaseClient
  ): Promise<Document> {
    
    // We construct a new Document model
    const newDoc: Document = {
      id: undefined as any, // DB will generate UUID, or we could generate one here
      projectId: options.projectId,
      title: options.title,
      type: options.type,
      status: DocumentStatus.READY,
      version: 1,
      content: { text: options.content }, // Assuming tip-tap or simple JSON format for now
      icon: this.getDefaultIcon(options.type),
      isFavorite: false,
      sortOrder: 0,
      createdByAi: true,
      parentDocumentId: options.parentDocumentId,
      lastGeneratedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Note: The repository upsert handles undefined ID gracefully by letting DB generate it, 
    // but typically we don't pass `id` if it's undefined. 
    // We can safely omit `id` in mapDocumentToRow in repo.

    return documentRepository.saveDocument(newDoc, client);
  }

  /**
   * Regenerates an existing document in place.
   * This is a transactional operation — it should only be called after
   * AI generation has completed successfully.
   *
   * - Replaces content
   * - Increments version
   * - Updates lastGeneratedAt
   * - Preserves parentDocumentId and all other graph relationships
   * - Does NOT create a duplicate document
   */
  public static async regenerateDocument(
    documentId: DocumentId,
    newContent: string,
    client?: SupabaseClient
  ): Promise<Document> {
    const existing = await documentRepository.getDocument(documentId, client);
    if (!existing) {
      throw new Error(`Document not found for regeneration: ${documentId}`);
    }

    const updatedDoc: Document = {
      ...existing,
      content: { text: newContent },
      version: incrementVersion(existing.version),
      lastGeneratedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: DocumentStatus.READY,
    };

    return documentRepository.saveDocument(updatedDoc, client);
  }

  private static getDefaultIcon(type: DocumentType): string {
    switch (type) {
      case DocumentType.USER_STORIES:
        return "ListChecks";
      case DocumentType.PRD:
        return "FileText";
      case DocumentType.API_SPEC:
        return "Code2";
      case DocumentType.DATABASE_SCHEMA:
        return "Database";
      default:
        return "FileText";
    }
  }
}

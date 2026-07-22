import { SupabaseClient } from "@supabase/supabase-js";
import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { Document, DocumentId, ProjectId, CreateDocumentInput } from "../types/document";
import { IDocumentRepository } from "./document-repository";

export class SupabaseDocumentRepository implements IDocumentRepository {
  private getClient(client?: SupabaseClient): SupabaseClient {
    return client || createBrowserClient();
  }

  /**
   * Helper to map a DB row to the domain Document model
   */
  private mapRowToDocument(row: any): Document {
    return {
      id: row.id,
      projectId: row.project_id,
      title: row.title,
      type: row.type,
      status: row.status,
      version: row.version,
      content: row.content,
      icon: row.icon,
      isFavorite: row.is_favorite,
      sortOrder: row.sort_order,
      createdByAi: row.created_by_ai,
      parentDocumentId: row.parent_document_id,
      lastGeneratedAt: row.last_generated_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      metadata: row.metadata || undefined,
    };
  }

  /**
   * Helper to map a domain Document to a DB row
   */
  private mapDocumentToRow(doc: CreateDocumentInput): any {
    const row: any = {
      project_id: doc.projectId,
      title: doc.title,
      type: doc.type,
      status: doc.status,
      version: doc.version,
      content: doc.content,
      icon: doc.icon,
      is_favorite: doc.isFavorite,
      sort_order: doc.sortOrder,
      created_by_ai: doc.createdByAi,
      parent_document_id: doc.parentDocumentId,
      last_generated_at: doc.lastGeneratedAt,
    };
    if (doc.id) row.id = doc.id;
    return row;
  }

  async getDocument(id: DocumentId, client?: SupabaseClient): Promise<Document | null> {
    const supabase = this.getClient(client);
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) return null;
    return this.mapRowToDocument(data);
  }

  async getProjectDocuments(projectId: ProjectId, client?: SupabaseClient): Promise<Document[]> {
    const supabase = this.getClient(client);
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("project_id", projectId)
      .order("sort_order", { ascending: true })
      .order("updated_at", { ascending: false });

    if (error || !data) return [];
    return data.map(this.mapRowToDocument);
  }

  async saveDocument(document: CreateDocumentInput, client?: SupabaseClient): Promise<Document> {
    const supabase = this.getClient(client);
    const row = this.mapDocumentToRow(document);
    
    // Upsert or Update depending on logic, let's use upsert for simplicity of save
    const { data, error } = await supabase
      .from("documents")
      .upsert(row)
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to save document: ${error?.message}`);
    }

    return this.mapRowToDocument(data);
  }

  async updateMetadata(id: DocumentId, metadata: any, client?: SupabaseClient): Promise<void> {
    const supabase = this.getClient(client);
    const { error } = await supabase
      .from("documents")
      .update({ metadata })
      .eq("id", id);

    if (error) {
      throw new Error(`Failed to update metadata: ${error.message}`);
    }
  }

  async deleteDocument(id: DocumentId, client?: SupabaseClient): Promise<void> {
    const supabase = this.getClient(client);
    const { error } = await supabase
      .from("documents")
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error(`Failed to delete document: ${error.message}`);
    }
  }
}

// Export a singleton instance for convenience if desired
export const documentRepository = new SupabaseDocumentRepository();

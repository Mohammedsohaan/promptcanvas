import { SupabaseClient } from "@supabase/supabase-js";
import { documentRepository } from "@/repositories/supabase-document-repository";
import { Document, DocumentType, DocumentStatus, CreateDocumentInput } from "@/types/document";

/* ─────────── Types ─────────── */

export interface DbDocument {
  id: string;
  project_id: string;
  created_at: string;
  updated_at: string;
  title: string;
  type: string;
  content: Record<string, unknown>;
  icon: string;
  is_favorite: boolean;
  sort_order: number;
}

export interface CreateDocumentData {
  project_id: string;
  title: string;
  type: string;
  content?: Record<string, unknown>;
  icon?: string;
}

export interface UpdateDocumentData {
  title?: string;
  content?: Record<string, unknown>;
  icon?: string;
  is_favorite?: boolean;
  sort_order?: number;
}

export interface DocumentResult<T> {
  success: boolean;
  message: string;
  data?: T;
}

/**
 * Helper to map domain Document to DbDocument representation for backwards API compatibility
 */
function mapDomainToDbDocument(doc: Document): DbDocument {
  return {
    id: doc.id,
    project_id: doc.projectId,
    created_at: doc.createdAt,
    updated_at: doc.updatedAt,
    title: doc.title,
    type: doc.type,
    content: (doc.content as Record<string, unknown>) || {},
    icon: doc.icon,
    is_favorite: doc.isFavorite,
    sort_order: doc.sortOrder,
  };
}

/* ─────────── Create Document ─────────── */

export async function createDocument(
  documentData: CreateDocumentData,
  supabaseClient?: SupabaseClient
): Promise<DocumentResult<DbDocument>> {
  try {
    const input: CreateDocumentInput = {
      projectId: documentData.project_id,
      title: documentData.title,
      type: documentData.type as DocumentType,
      status: DocumentStatus.READY,
      version: 1,
      content: documentData.content || {},
      icon: documentData.icon || "FileText",
      isFavorite: false,
      sortOrder: 0,
      createdByAi: false,
      parentDocumentId: null,
      lastGeneratedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const doc = await documentRepository.saveDocument(input, supabaseClient);

    return {
      success: true,
      message: "Document created successfully!",
      data: mapDomainToDbDocument(doc),
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Failed to create document. Please try again.",
    };
  }
}

/* ─────────── Get Documents (by project) ─────────── */

export async function getDocuments(
  projectId: string,
  supabaseClient?: SupabaseClient
): Promise<DocumentResult<DbDocument[]>> {
  try {
    const docs = await documentRepository.getProjectDocuments(projectId, supabaseClient);
    return {
      success: true,
      message: "Documents fetched successfully!",
      data: docs.map(mapDomainToDbDocument),
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Failed to fetch documents. Please try again.",
    };
  }
}

/* ─────────── Get Document By ID ─────────── */

export async function getDocumentById(
  documentId: string,
  supabaseClient?: SupabaseClient
): Promise<DocumentResult<DbDocument>> {
  try {
    const doc = await documentRepository.getDocument(documentId, supabaseClient);
    if (!doc) {
      return {
        success: false,
        message: "Document not found.",
      };
    }
    return {
      success: true,
      message: "Document fetched successfully!",
      data: mapDomainToDbDocument(doc),
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Document not found.",
    };
  }
}

/* ─────────── Update Document ─────────── */

export async function updateDocument(
  documentId: string,
  updates: UpdateDocumentData,
  supabaseClient?: SupabaseClient
): Promise<DocumentResult<DbDocument>> {
  try {
    const doc = await documentRepository.updateDocument(documentId, updates, supabaseClient);
    return {
      success: true,
      message: "Document updated successfully!",
      data: mapDomainToDbDocument(doc),
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Failed to update document. Please try again.",
    };
  }
}

/* ─────────── Delete Document ─────────── */

export async function deleteDocument(
  documentId: string,
  supabaseClient?: SupabaseClient
): Promise<DocumentResult<null>> {
  try {
    await documentRepository.deleteDocument(documentId, supabaseClient);
    return {
      success: true,
      message: "Document deleted successfully!",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Failed to delete document. Please try again.",
    };
  }
}

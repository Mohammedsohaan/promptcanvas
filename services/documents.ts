import { SupabaseClient } from "@supabase/supabase-js";
import { createClient as createBrowserClient } from "@/lib/supabase/client";

/* ─────────── Types ─────────── */

export interface Document {
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

/* ─────────── Create Document ─────────── */

export async function createDocument(
  documentData: CreateDocumentData,
  supabaseClient?: SupabaseClient
): Promise<DocumentResult<Document>> {
  const supabase = supabaseClient || createBrowserClient();

  const { data, error } = await supabase
    .from("documents")
    .insert({
      project_id: documentData.project_id,
      title: documentData.title,
      type: documentData.type,
      content: documentData.content || {},
      icon: documentData.icon || "FileText",
    })
    .select()
    .single();

  if (error) {
    return {
      success: false,
      message: error.message || "Failed to create document. Please try again.",
    };
  }

  return {
    success: true,
    message: "Document created successfully!",
    data: data as Document,
  };
}

/* ─────────── Get Documents (by project) ─────────── */

export async function getDocuments(
  projectId: string,
  supabaseClient?: SupabaseClient
): Promise<DocumentResult<Document[]>> {
  const supabase = supabaseClient || createBrowserClient();

  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: true })
    .order("updated_at", { ascending: false });

  if (error) {
    return {
      success: false,
      message: error.message || "Failed to fetch documents. Please try again.",
    };
  }

  return {
    success: true,
    message: "Documents fetched successfully!",
    data: data as Document[],
  };
}

/* ─────────── Get Document By ID ─────────── */

export async function getDocumentById(
  documentId: string,
  supabaseClient?: SupabaseClient
): Promise<DocumentResult<Document>> {
  const supabase = supabaseClient || createBrowserClient();

  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("id", documentId)
    .single();

  if (error || !data) {
    return {
      success: false,
      message: error?.message || "Document not found.",
    };
  }

  return {
    success: true,
    message: "Document fetched successfully!",
    data: data as Document,
  };
}

/* ─────────── Update Document ─────────── */

export async function updateDocument(
  documentId: string,
  updates: UpdateDocumentData,
  supabaseClient?: SupabaseClient
): Promise<DocumentResult<Document>> {
  const supabase = supabaseClient || createBrowserClient();

  const { data, error } = await supabase
    .from("documents")
    .update(updates)
    .eq("id", documentId)
    .select()
    .single();

  if (error) {
    return {
      success: false,
      message: error.message || "Failed to update document. Please try again.",
    };
  }

  return {
    success: true,
    message: "Document updated successfully!",
    data: data as Document,
  };
}

/* ─────────── Delete Document ─────────── */

export async function deleteDocument(
  documentId: string,
  supabaseClient?: SupabaseClient
): Promise<DocumentResult<null>> {
  const supabase = supabaseClient || createBrowserClient();

  const { error } = await supabase
    .from("documents")
    .delete()
    .eq("id", documentId);

  if (error) {
    return {
      success: false,
      message: error.message || "Failed to delete document. Please try again.",
    };
  }

  return {
    success: true,
    message: "Document deleted successfully!",
  };
}

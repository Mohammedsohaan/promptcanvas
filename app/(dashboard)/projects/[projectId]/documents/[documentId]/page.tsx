import * as React from "react";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProjectById } from "@/services/projects";
import { getDocumentById, getDocuments } from "@/services/documents";
import { DocumentEditorLayout } from "@/components/workspace/document-editor-layout";
import { DocumentGraph } from "@/services/document-graph";
import { DocumentRelationshipViewModel } from "@/types/document";

interface DocumentPageProps {
  params: Promise<{
    projectId: string;
    documentId: string;
  }>;
}

export default async function DocumentPage({ params }: DocumentPageProps) {
  const { projectId, documentId } = await params;
  const supabase = await createClient();

  // 1. Verify authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 2. Fetch & verify project ownership via RLS
  const projectResult = await getProjectById(projectId, supabase);
  if (!projectResult.success || !projectResult.data) {
    notFound();
  }

  // 3. Fetch & verify document
  const documentResult = await getDocumentById(documentId, supabase);
  if (
    !documentResult.success ||
    !documentResult.data ||
    documentResult.data.project_id !== projectId
  ) {
    notFound();
  }

  // 4. Fetch all documents for this project
  const documentsResult = await getDocuments(projectId, supabase);
  const documents = documentsResult.data || [];

  // 5. Construct Graph and ViewModel
  // Note: Here we are mapping from DB documents to Domain documents conceptually.
  // For this milestone, we assume they are compatible or we cast them appropriately.
  const graph = new DocumentGraph(documents as any);
  
  const relationships: DocumentRelationshipViewModel = {
    parent: graph.getParent(documentId) || null,
    children: graph.getChildren(documentId),
    siblings: graph.getSiblingDocuments(documentId),
    ancestors: graph.getAncestors(documentId),
    descendants: graph.getDescendants(documentId),
  };

  return (
    <DocumentEditorLayout
      project={projectResult.data}
      document={documentResult.data}
      documents={documents}
      relationships={relationships}
    />
  );
}

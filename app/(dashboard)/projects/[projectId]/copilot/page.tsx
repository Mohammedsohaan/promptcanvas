import * as React from "react";
import { createClient } from "@/lib/supabase/server";
import { getProjectById } from "@/services/projects";
import { getDocuments } from "@/services/documents";
import { mapDbDocumentToDomain } from "@/types/document";
import { notFound, redirect } from "next/navigation";
import { CopilotWorkspace } from "@/components/copilot/copilot-workspace";

interface CopilotPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function CopilotPage({ params }: CopilotPageProps) {
  const { projectId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const projectResult = await getProjectById(projectId, supabase);
  if (!projectResult.success || !projectResult.data) {
    notFound();
  }

  const documentsResult = await getDocuments(projectId, supabase);
  const documents = (documentsResult.data || []).map(mapDbDocumentToDomain);

  return <CopilotWorkspace project={projectResult.data} documents={documents} />;
}


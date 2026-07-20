import * as React from "react";
import { createClient } from "@/lib/supabase/server";
import { getProjectById } from "@/services/projects";
import { getDocuments } from "@/services/documents";
import { notFound, redirect } from "next/navigation";
import { ProjectWorkspaceContent } from "@/components/workspace/project-workspace-content";

interface ProjectPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { projectId } = await params;
  const supabase = await createClient();

  // Verify the user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch the project — RLS ensures only the owner's project is returned
  const projectResult = await getProjectById(projectId, supabase);

  if (!projectResult.success || !projectResult.data) {
    // Project not found or user does not own it
    notFound();
  }

  // Fetch documents for the project
  const documentsResult = await getDocuments(projectId, supabase);
  const documents = documentsResult.data || [];

  return <ProjectWorkspaceContent project={projectResult.data} documents={documents} />;
}

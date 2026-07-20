"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WorkspaceLayout } from "@/components/workspace/workspace-layout";
import { ProjectWorkspaceHeader } from "@/components/workspace/project-workspace-header";
import { ProjectMetadataPanel } from "@/components/workspace/project-metadata-panel";
import { DocumentList } from "@/components/workspace/document-list";
import { Project } from "@/services/projects";
import { Document, createDocument } from "@/services/documents";

interface ProjectWorkspaceContentProps {
  project: Project;
  documents: Document[];
}

export function ProjectWorkspaceContent({ project, documents }: ProjectWorkspaceContentProps) {
  const router = useRouter();
  const [isCreating, setIsCreating] = React.useState(false);

  const handleCreateDocument = async () => {
    try {
      setIsCreating(true);
      const res = await createDocument({
        project_id: project.id,
        title: "Untitled Document",
        type: "Notes",
        icon: "FileText",
        content: {},
      });

      if (res.success && res.data) {
        router.push(`/projects/${project.id}/documents/${res.data.id}`);
        router.refresh();
      }
    } catch (err) {
      console.error("Error creating document:", err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <WorkspaceLayout
      project={project}
      rightPanel={<ProjectMetadataPanel project={project} />}
    >
      <ProjectWorkspaceHeader project={project} />

      {/* Documents section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-neutral-100">Documents</h2>
          <Button
            variant="secondary"
            className="h-9 rounded-lg"
            onClick={handleCreateDocument}
            disabled={isCreating}
          >
            {isCreating ? (
              <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
            ) : (
              <Plus className="h-4 w-4 mr-1.5" />
            )}
            New Document
          </Button>
        </div>

        <DocumentList projectId={project.id} documents={documents} />
      </motion.div>
    </WorkspaceLayout>
  );
}

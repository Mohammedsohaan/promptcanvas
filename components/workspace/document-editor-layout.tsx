"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DocumentHeader } from "@/components/workspace/document-header";
import { DocumentMetadataPanel } from "@/components/workspace/document-metadata-panel";
import { DocumentList } from "@/components/workspace/document-list";
import { DocumentEditor, DocumentEditorRef } from "@/components/editor/editor";
import { Project } from "@/services/projects";
import { Document, createDocument } from "@/services/documents";
import { AIPanel } from "@/components/ai/ai-panel";
import { AIOrchestrator } from "@/services/ai-orchestrator";
import { AIJobType } from "@/types/ai";
import { StreamingState } from "@/types/editor";
import { StreamingPreviewPanel } from "@/components/editor/streaming-preview-panel";
import { DocumentRelationshipViewModel, DocumentType, DocumentId, DocumentFreshness } from "@/types/document";
import { DocumentGenerationService } from "@/services/document-generation";
import { DocumentGraph } from "@/services/document-graph";
import { ImpactAnalysisService, AffectedDocument } from "@/services/impact-analysis";
import { RegenerationManager, RegenerationProgress } from "@/services/regeneration-manager";
import { toast } from "sonner";

interface DocumentEditorLayoutProps {
  project: Project;
  document: Document;
  documents: Document[];
  relationships?: DocumentRelationshipViewModel;
}

export function DocumentEditorLayout({
  project,
  document,
  documents,
  relationships,
}: DocumentEditorLayoutProps) {
  const router = useRouter();
  const [isCreating, setIsCreating] = React.useState(false);
  const [isAIPanelOpen, setIsAIPanelOpen] = React.useState(false);
  
  const [streamingState, setStreamingState] = React.useState<StreamingState>("idle");
  const [streamingText, setStreamingText] = React.useState("");
  const editorRef = React.useRef<DocumentEditorRef>(null);

  const orchestratorRef = React.useRef<AIOrchestrator | null>(null);

  // --- Impact Analysis & Freshness ---
  const graph = React.useMemo(() => new DocumentGraph(documents), [documents]);
  
  const freshnessMap = React.useMemo(
    () => ImpactAnalysisService.computeFreshnessMap(
      documents.map((d: any) => ({
        ...d,
        // Normalize snake_case fields for the service
        projectId: d.project_id ?? d.projectId,
        parentDocumentId: d.parent_document_id ?? d.parentDocumentId,
        lastGeneratedAt: d.last_generated_at ?? d.lastGeneratedAt,
        createdByAi: d.created_by_ai ?? d.createdByAi,
        createdAt: d.created_at ?? d.createdAt,
        updatedAt: d.updated_at ?? d.updatedAt,
        isFavorite: d.is_favorite ?? d.isFavorite,
        sortOrder: d.sort_order ?? d.sortOrder,
      })),
      graph
    ),
    [documents, graph]
  );

  const affectedDocuments = React.useMemo(() => {
    const result = ImpactAnalysisService.analyzeImpact(document.id, graph);
    return result?.affectedDocuments ?? [];
  }, [document.id, graph]);

  const currentDocFreshness = freshnessMap.get(document.id);
  const isCurrentDocOutdated = currentDocFreshness === DocumentFreshness.OUTDATED;

  // --- Regeneration Manager ---
  const [regenProgress, setRegenProgress] = React.useState<RegenerationProgress | null>(null);
  const regenManagerRef = React.useRef<RegenerationManager | null>(null);

  React.useEffect(() => {
    regenManagerRef.current = new RegenerationManager({
      projectId: project.id,
      onProgress: (progress) => setRegenProgress({ ...progress }),
      onNavigate: (docId) => {
        router.push(`/projects/${project.id}/documents/${docId}`);
        router.refresh();
      },
      onComplete: () => {
        toast.success("Regeneration complete!");
        router.refresh();
      },
    });
  }, [project.id, router]);

  React.useEffect(() => {
    orchestratorRef.current = new AIOrchestrator({
      projectId: project.id,
      documentId: document.id,
      editorRef,
      onStateChange: (state) => setStreamingState(state),
      onTextUpdate: (text) => setStreamingText(text),
    });
  }, [project.id, document.id]);

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

  const handleAIPanelAction = async (actionId: string) => {
    if (!orchestratorRef.current) return;

    if (actionId === "prd") {
      if (!window.confirm("Generate a Product Requirements Document for this project?")) return;
      
      const result = await orchestratorRef.current.startGeneration("prd");
      if (result?.success && editorRef.current) {
        await editorRef.current.replaceContent(result.content);
      }
    } else if (actionId === "user-stories") {
      if (!window.confirm("Generate User Stories for this project?")) return;
      
      const result = await orchestratorRef.current.startGeneration("userStories");
      if (result?.success) {
        try {
          const newDoc = await DocumentGenerationService.createGeneratedDocument({
            projectId: project.id,
            parentDocumentId: document.id,
            title: "User Stories",
            type: DocumentType.USER_STORIES,
            content: result.content
          });
          
          if (newDoc) {
            toast.success("User Stories created successfully!");
            setIsAIPanelOpen(false);
            router.push(`/projects/${project.id}/documents/${newDoc.id}`);
            router.refresh();
          }
        } catch (error) {
           console.error("Failed to persist user stories", error);
           toast.error("Generation succeeded but failed to save document.");
        }
      }
    } else if (actionId === "api-spec") {
      if (!window.confirm("Generate API Specification for this project?")) return;
      
      const result = await orchestratorRef.current.startGeneration("apiSpec");
      if (result?.success) {
        try {
          const newDoc = await DocumentGenerationService.createGeneratedDocument({
            projectId: project.id,
            parentDocumentId: document.id,
            title: "API Specification",
            type: DocumentType.API_SPEC,
            content: result.content
          });
          
          if (newDoc) {
            toast.success("API Specification created successfully!");
            setIsAIPanelOpen(false);
            router.push(`/projects/${project.id}/documents/${newDoc.id}`);
            router.refresh();
          }
        } catch (error) {
           console.error("Failed to persist API spec", error);
           toast.error("Generation succeeded but failed to save document.");
        }
      }
    } else if (actionId === "db-schema") {
      if (!window.confirm("Generate Database Schema for this project?")) return;
      
      const result = await orchestratorRef.current.startGeneration("databaseSchema");
      if (result?.success) {
        try {
          const newDoc = await DocumentGenerationService.createGeneratedDocument({
            projectId: project.id,
            parentDocumentId: document.id,
            title: "Database Schema",
            type: DocumentType.DATABASE_SCHEMA,
            content: result.content
          });
          
          if (newDoc) {
            toast.success("Database Schema created successfully!");
            setIsAIPanelOpen(false);
            router.push(`/projects/${project.id}/documents/${newDoc.id}`);
            router.refresh();
          }
        } catch (error) {
           console.error("Failed to persist Database Schema", error);
           toast.error("Generation succeeded but failed to save document.");
        }
      }
    }
  };

  const handleRegenerateSelected = (documentIds: DocumentId[]) => {
    if (!regenManagerRef.current) return;

    // Build the queue from the affected documents that were selected
    const docsToRegenerate = documentIds
      .map((id) => {
        const affected = affectedDocuments.find((a) => a.document.id === id);
        if (!affected) return null;
        return {
          id: affected.document.id,
          title: affected.document.title,
          type: affected.document.type as string,
        };
      })
      .filter(Boolean) as Array<{ id: DocumentId; title: string; type: string }>;

    if (docsToRegenerate.length === 0) return;

    regenManagerRef.current.enqueue(docsToRegenerate);
    regenManagerRef.current.start(
      editorRef,
      (state) => setStreamingState(state),
      (text) => setStreamingText(text)
    );
  };

  const isGenerating = streamingState !== "idle" && streamingState !== "completed" && streamingState !== "cancelled" && streamingState !== "error";

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Left panel — document list */}
      <aside className="hidden lg:flex w-72 shrink-0 flex-col border-r border-neutral-800/50 bg-neutral-950/50 backdrop-blur-sm h-full p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-4 px-1">
          <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
            Documents
          </h3>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleCreateDocument}
            disabled={isCreating || isGenerating}
            className="h-7 px-2.5 text-xs rounded-lg"
          >
            {isCreating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <>
                <Plus className="h-3.5 w-3.5 mr-1" />
                New
              </>
            )}
          </Button>
        </div>

        <DocumentList
          projectId={project.id}
          documents={documents}
          activeDocumentId={document.id}
          freshnessMap={freshnessMap}
        />
      </aside>

      {/* Center content — Editor */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="mx-auto max-w-4xl">
          <DocumentHeader 
            projectId={project.id} 
            document={document} 
            onOpenAIPanel={() => setIsAIPanelOpen(true)}
            isOutdated={isCurrentDocOutdated}
          />

          <AnimatePresence>
            {isGenerating && (
              <StreamingPreviewPanel text={streamingText} />
            )}
          </AnimatePresence>

          {/* TipTap Rich Text Editor */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <DocumentEditor
              ref={editorRef}
              key={document.id}
              documentId={document.id}
              initialContent={document.content}
            />
          </motion.div>
        </div>
      </main>

      {/* Right panel — metadata + impact analysis */}
      <aside className="hidden xl:flex w-72 shrink-0 flex-col border-l border-neutral-800/50 bg-neutral-950/50 backdrop-blur-sm overflow-y-auto p-6">
        <DocumentMetadataPanel
          document={document}
          relationships={relationships}
          affectedDocuments={affectedDocuments}
          freshnessMap={freshnessMap}
          regenerationProgress={regenProgress}
          onRegenerateSelected={handleRegenerateSelected}
        />
      </aside>

      <AIPanel 
        isOpen={isAIPanelOpen} 
        onClose={() => setIsAIPanelOpen(false)} 
        onAction={handleAIPanelAction}
        isGenerating={isGenerating}
        onCancel={() => orchestratorRef.current?.cancel()}
        elapsedTime={undefined /* Future enhancement */}
        currentDocumentType={document.type}
      />
    </div>
  );
}

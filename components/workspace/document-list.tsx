"use client";

import * as React from "react";
import { FileText } from "lucide-react";
import { Document } from "@/services/documents";
import { DocumentListItem } from "@/components/workspace/document-list-item";
import { DocumentFreshness, DocumentId } from "@/types/document";

interface DocumentListProps {
  projectId: string;
  documents: Document[];
  activeDocumentId?: string;
  freshnessMap?: Map<DocumentId, DocumentFreshness>;
}

export function DocumentList({
  projectId,
  documents,
  activeDocumentId,
  freshnessMap,
}: DocumentListProps) {
  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center border border-dashed border-neutral-800 rounded-xl bg-neutral-900/20">
        <div className="h-14 w-14 rounded-full bg-neutral-900 flex items-center justify-center mb-5 border border-neutral-800/60">
          <FileText className="h-7 w-7 text-neutral-500" />
        </div>
        <h3 className="text-lg font-semibold text-neutral-200 mb-2">
          No documents yet
        </h3>
        <p className="text-sm text-neutral-400 max-w-sm">
          Create your first document to start building your project.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {documents.map((doc) => (
        <DocumentListItem
          key={doc.id}
          document={doc}
          projectId={projectId}
          isActive={doc.id === activeDocumentId}
          isOutdated={freshnessMap?.get(doc.id) === DocumentFreshness.OUTDATED}
        />
      ))}
    </div>
  );
}


"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Calendar, Tag, Star, Clock, AlertTriangle, RefreshCw, CheckCircle2, Circle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DocumentRelationshipViewModel, DocumentId, DocumentFreshness, Document } from "@/types/document";
import { AffectedDocument } from "@/services/impact-analysis";
import { RegenerationProgress } from "@/services/regeneration-manager";
import { RegenerationStatus } from "@/types/document";

interface DocumentMetadataPanelProps {
  document: Document;
  relationships?: DocumentRelationshipViewModel;
  affectedDocuments?: AffectedDocument[];
  freshnessMap?: Map<DocumentId, DocumentFreshness>;
  regenerationProgress?: RegenerationProgress | null;
  onRegenerateSelected?: (documentIds: DocumentId[]) => void;
}

export function DocumentMetadataPanel({
  document,
  relationships,
  affectedDocuments,
  freshnessMap,
  regenerationProgress,
  onRegenerateSelected,
}: DocumentMetadataPanelProps) {
  const [selectedIds, setSelectedIds] = React.useState<Set<DocumentId>>(new Set());

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const toggleSelection = (id: DocumentId) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => {
    if (!affectedDocuments) return;
    setSelectedIds(new Set(affectedDocuments.map((a) => a.document.id)));
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  const handleRegenerate = () => {
    if (onRegenerateSelected && selectedIds.size > 0) {
      onRegenerateSelected(Array.from(selectedIds));
    }
  };

  const isRegenerating = regenerationProgress?.isRunning ?? false;
  const hasAffectedDocuments = affectedDocuments && affectedDocuments.length > 0;

  const metadataItems = [
    {
      label: "Created",
      value: formatDate(document.createdAt),
      icon: Calendar,
    },
    {
      label: "Last Updated",
      value: formatDate(document.updatedAt),
      icon: Clock,
    },
    {
      label: "Document Type",
      value: (
        <Badge variant="outline" className="text-xs border-neutral-800 text-neutral-300">
          {document.type}
        </Badge>
      ),
      icon: Tag,
    },
    {
      label: "Favorite",
      value: (
        <div className="flex items-center gap-1.5 text-sm">
          <Star
            className={`h-4 w-4 ${
              document.isFavorite
                ? "fill-amber-400 text-amber-400"
                : "text-neutral-500"
            }`}
          />
          <span className="text-neutral-300">
            {document.isFavorite ? "Starred" : "No"}
          </span>
        </div>
      ),
      icon: Star,
    },
  ];

  const getStatusBadge = (docId: DocumentId) => {
    if (regenerationProgress?.isRunning) {
      const queueItem = regenerationProgress.queue.find((q) => q.documentId === docId);
      if (queueItem) {
        switch (queueItem.status) {
          case RegenerationStatus.GENERATING:
            return (
              <Badge className="text-[10px] bg-purple-500/15 text-purple-400 border border-purple-500/30 animate-pulse">
                Generating...
              </Badge>
            );
          case RegenerationStatus.COMPLETED:
            return (
              <Badge className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />
                Done
              </Badge>
            );
          case RegenerationStatus.FAILED:
            return (
              <Badge className="text-[10px] bg-red-500/15 text-red-400 border border-red-500/30">
                Failed
              </Badge>
            );
          case RegenerationStatus.CANCELLED:
            return (
              <Badge className="text-[10px] bg-neutral-500/15 text-neutral-400 border border-neutral-500/30">
                Cancelled
              </Badge>
            );
          case RegenerationStatus.QUEUED:
            return (
              <Badge className="text-[10px] bg-blue-500/15 text-blue-400 border border-blue-500/30">
                Queued
              </Badge>
            );
          default:
            break;
        }
      }
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
      >
        <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-4">
          Document Details
        </h3>
        <Card hoverEffect={false} className="p-4 bg-neutral-900/40 border-neutral-800/60">
          <div className="space-y-4">
            {metadataItems.map((item) => (
              <div key={item.label} className="flex items-start gap-3">
                <item.icon className="h-4 w-4 text-neutral-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-neutral-500">{item.label}</p>
                  <div className="text-sm text-neutral-200 mt-0.5">{item.value}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {relationships && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-4 mt-6">
            Relationships
          </h3>
          <Card hoverEffect={false} className="p-4 bg-neutral-900/40 border-neutral-800/60">
            <div className="space-y-4">
              {relationships.parent && (
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Parent Document</p>
                  <div className="text-sm text-neutral-200">{relationships.parent.title}</div>
                </div>
              )}
              {relationships.children.length > 0 && (
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Children Documents</p>
                  <ul className="text-sm text-neutral-200 list-disc list-inside">
                    {relationships.children.map(child => (
                      <li key={child.id}>{child.title}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Impact Analysis Panel */}
      {hasAffectedDocuments && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <h3 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-4 mt-6 flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5" />
            Impact Analysis
          </h3>
          <Card hoverEffect={false} className="p-4 bg-amber-500/5 border-amber-500/20">
            <p className="text-xs text-neutral-400 mb-4">
              The following documents may need regeneration because this document or an ancestor has changed.
            </p>

            {/* Select All / Deselect All */}
            <div className="flex items-center justify-between mb-3">
              <button
                type="button"
                onClick={selectedIds.size === affectedDocuments!.length ? deselectAll : selectAll}
                className="text-[11px] text-neutral-400 hover:text-neutral-200 transition-colors"
                disabled={isRegenerating}
              >
                {selectedIds.size === affectedDocuments!.length ? "Deselect All" : "Select All"}
              </button>
              <span className="text-[11px] text-neutral-500">
                {selectedIds.size} selected
              </span>
            </div>

            {/* Affected Documents List */}
            <div className="space-y-2">
              {affectedDocuments!.map((affected) => (
                <div
                  key={affected.document.id}
                  className="flex items-center gap-3 p-2.5 rounded-lg border border-neutral-800/60 bg-neutral-900/40 hover:border-neutral-700/60 transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => toggleSelection(affected.document.id)}
                    disabled={isRegenerating}
                    className="shrink-0"
                  >
                    {selectedIds.has(affected.document.id) ? (
                      <CheckCircle2 className="h-4 w-4 text-purple-400" />
                    ) : (
                      <Circle className="h-4 w-4 text-neutral-600 hover:text-neutral-400 transition-colors" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-neutral-200 truncate">
                      {affected.document.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-neutral-500">
                        v{affected.document.version}
                      </span>
                      {affected.freshness === DocumentFreshness.OUTDATED ? (
                        <Badge className="text-[10px] bg-amber-500/15 text-amber-400 border border-amber-500/30">
                          Outdated
                        </Badge>
                      ) : (
                        <Badge className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          Up to Date
                        </Badge>
                      )}
                      {getStatusBadge(affected.document.id)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Regenerate Button */}
            <div className="mt-4 pt-3 border-t border-neutral-800/40">
              <Button
                onClick={handleRegenerate}
                disabled={selectedIds.size === 0 || isRegenerating}
                className="w-full bg-purple-600/80 hover:bg-purple-600 text-white border-purple-500/30 transition-colors"
                size="sm"
              >
                <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isRegenerating ? "animate-spin" : ""}`} />
                {isRegenerating
                  ? "Regenerating..."
                  : `Regenerate ${selectedIds.size > 0 ? `(${selectedIds.size})` : "Selected"}`}
              </Button>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}


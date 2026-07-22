"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, FileText, AlertTriangle } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Document } from "@/types/document";

interface DocumentHeaderProps {
  projectId: string;
  document: Document;
  onOpenAIPanel?: () => void;
  isOutdated?: boolean;
}

export function DocumentHeader({ projectId, document, onOpenAIPanel, isOutdated }: DocumentHeaderProps) {
  const IconComponent =
    (
      LucideIcons as unknown as Record<
        string,
        React.ComponentType<{ className?: string }>
      >
    )[document.icon] || FileText;

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="pb-6 mb-8 border-b border-neutral-800/50"
    >
      <div className="flex items-center gap-2 mb-4 text-sm text-neutral-500">
        <Link
          href={`/projects/${projectId}`}
          className="flex items-center gap-1.5 hover:text-neutral-200 transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Project</span>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900/60 text-neutral-300">
            <IconComponent className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-semibold tracking-tight text-neutral-100">
                {document.title}
              </h1>
              <Badge variant="outline" className="text-xs border-neutral-800 text-neutral-400">
                {document.type}
              </Badge>
              {isOutdated && (
                <Badge className="text-xs bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25 animate-pulse">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Outdated
                </Badge>
              )}
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Last saved {formatDate(document.updatedAt)}
            </p>
          </div>
        </div>
        
        {onOpenAIPanel && (
          <Button
            variant="secondary"
            onClick={onOpenAIPanel}
            className="hidden sm:flex items-center gap-2 border-neutral-800 bg-neutral-900/60 hover:bg-neutral-800/80 text-neutral-300 transition-colors"
          >
            <LucideIcons.Sparkles className="h-4 w-4 text-purple-400" />
            <span>AI Assistant</span>
          </Button>
        )}
      </div>
    </motion.div>
  );
}


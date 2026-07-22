"use client";

import * as React from "react";
import Link from "next/link";
import { Star, FileText, AlertTriangle } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Document } from "@/types/document";

interface DocumentListItemProps {
  document: Document;
  projectId: string;
  isActive?: boolean;
  isOutdated?: boolean;
}

export function DocumentListItem({
  document,
  projectId,
  isActive = false,
  isOutdated = false,
}: DocumentListItemProps) {
  const IconComponent =
    (
      LucideIcons as unknown as Record<
        string,
        React.ComponentType<{ className?: string }>
      >
    )[document.icon] || FileText;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <Link
      href={`/projects/${projectId}/documents/${document.id}`}
      className={cn(
        "group flex items-center justify-between gap-3 p-3.5 rounded-xl border transition-all duration-200",
        isActive
          ? "border-neutral-700 bg-neutral-800/80 text-neutral-50 shadow-sm"
          : "border-neutral-800/60 bg-neutral-900/40 text-neutral-300 hover:border-neutral-700/80 hover:bg-neutral-800/50 hover:text-neutral-100"
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors",
            isActive
              ? "border-neutral-600 bg-neutral-900 text-neutral-100"
              : "border-neutral-800 bg-neutral-950/60 text-neutral-400 group-hover:border-neutral-700 group-hover:text-neutral-200"
          )}
        >
          <IconComponent className="h-4 w-4" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium truncate leading-none">
              {document.title}
            </h4>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-normal border-neutral-800 text-neutral-400">
              {document.type}
            </Badge>
            {isOutdated && (
              <Badge className="text-[10px] px-1.5 py-0 font-normal bg-amber-500/15 text-amber-400 border border-amber-500/30">
                <AlertTriangle className="h-2.5 w-2.5 mr-0.5" />
                Outdated
              </Badge>
            )}
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Updated {formatDate(document.updatedAt)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Star
          className={cn(
            "h-4 w-4 transition-colors",
            document.isFavorite
              ? "fill-amber-400 text-amber-400"
              : "text-neutral-600 opacity-0 group-hover:opacity-100 hover:text-neutral-400"
          )}
        />
      </div>
    </Link>
  );
}

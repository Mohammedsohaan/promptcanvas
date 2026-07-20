"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Clock, CheckCircle2 } from "lucide-react";
import { Project } from "@/services/projects";

interface ProjectWorkspaceHeaderProps {
  project: Project;
}

export function ProjectWorkspaceHeader({ project }: ProjectWorkspaceHeaderProps) {
  const formatRelativeDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="pb-6 mb-8 border-b border-neutral-800/50"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-neutral-100">
              {project.title}
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Active
            </span>
          </div>
          {project.description && (
            <p className="text-sm text-neutral-400 max-w-xl">{project.description}</p>
          )}
          <div className="flex flex-wrap items-center text-sm text-neutral-500 gap-4 pt-1">
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              Updated {formatRelativeDate(project.updated_at)}
            </span>
            <span className="flex items-center gap-1.5 text-neutral-400">
              <motion.div
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              </motion.div>
              Saved securely
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

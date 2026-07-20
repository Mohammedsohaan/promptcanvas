"use client";

import * as React from "react";
import { ProjectSidebar } from "@/components/workspace/project-sidebar";
import { Project } from "@/services/projects";

interface WorkspaceLayoutProps {
  project: Project;
  children: React.ReactNode;
  rightPanel?: React.ReactNode;
}

export function WorkspaceLayout({ project, children, rightPanel }: WorkspaceLayoutProps) {
  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Left sidebar — project navigation */}
      <ProjectSidebar project={project} />

      {/* Main content area */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="mx-auto max-w-4xl">
          {children}
        </div>
      </main>

      {/* Right metadata panel */}
      {rightPanel && (
        <aside className="hidden xl:flex w-72 shrink-0 flex-col border-l border-neutral-800/50 bg-neutral-950/50 backdrop-blur-sm overflow-y-auto p-6">
          {rightPanel}
        </aside>
      )}
    </div>
  );
}

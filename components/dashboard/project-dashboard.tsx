"use client";

import * as React from "react";
import { CreateProjectDialog } from "@/components/dashboard/create-project-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Project } from "@/services/projects";
import { User } from "@supabase/supabase-js";
import { Plus, Folder, Calendar, FileText } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "./empty-state";
import * as LucideIcons from "lucide-react";

interface ProjectDashboardProps {
  initialProjects: Project[];
  user: User;
}

export function ProjectDashboard({ initialProjects, user }: ProjectDashboardProps) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  // Helper to dynamically render Lucide icon by name
  const renderIcon = (iconName: string, color: string) => {
    const IconComponent = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>>)[iconName] || Folder;
    return <IconComponent className="h-5 w-5" style={{ color }} />;
  };

  // Helper to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const displayName = user.user_metadata?.full_name || user.email || "";

  return (
    <div className="pb-10 pt-4">
      {/* Header containing WelcomeHeader & "New Project" button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-100">
            Good Evening{displayName ? `, ${displayName}` : ""},
          </h1>
          <p className="mt-1 text-neutral-400">
            Welcome back to PromptCanvas.
          </p>
        </div>

        <div className="shrink-0">
          <Button variant="primary" onClick={() => setIsDialogOpen(true)} className="h-10">
            <Plus className="h-4 w-4 mr-1.5" />
            New Project
          </Button>
        </div>
      </div>

      {initialProjects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description="Create your first project to get started with PromptCanvas."
          buttonText="Create your first project"
          onButtonClick={() => setIsDialogOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {initialProjects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`} className="group block">
              <Card className="p-6 bg-neutral-900/40 border-neutral-800/60 hover:bg-neutral-800/40 hover:border-neutral-700/60 transition-all duration-300 rounded-xl flex flex-col h-full hover:-translate-y-1 shadow-md hover:shadow-lg relative overflow-hidden">
                {/* Visual Accent Colored bar */}
                <div 
                  className="absolute top-0 left-0 right-0 h-1" 
                  style={{ backgroundColor: project.color }}
                />
                
                <div className="flex items-start justify-between gap-4 mb-4 mt-2">
                  <div 
                    className="h-10 w-10 rounded-lg flex items-center justify-center bg-neutral-950/50 border border-neutral-800/80 group-hover:border-neutral-700 transition-colors"
                  >
                    {renderIcon(project.icon, project.color)}
                  </div>
                  
                  {/* Status Badge */}
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Active
                  </span>
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-neutral-100 group-hover:text-white transition-colors mb-2 line-clamp-1">
                    {project.title}
                  </h3>
                  <p className="text-sm text-neutral-400 line-clamp-2 mb-4 min-h-[40px]">
                    {project.description || "No description provided."}
                  </p>
                </div>

                <div className="pt-4 border-t border-neutral-800/50 flex items-center justify-between text-xs text-neutral-500">
                  <span className="flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5" />
                    0 documents
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDate(project.updated_at)}
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <CreateProjectDialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} />
    </div>
  );
}

"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  Sparkles,
  Settings,
  ArrowLeft,
  Folder,
  GitBranch,
  FolderGit,
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";
import { Project } from "@/services/projects";

interface ProjectSidebarProps {
  project: Project;
}

export function ProjectSidebar({ project }: ProjectSidebarProps) {
  const pathname = usePathname();
  const basePath = `/projects/${project.id}`;

  // Resolve the project icon dynamically
  const IconComponent =
    (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>>)[project.icon] || Folder;

  const navItems = [
    { name: "Overview", href: basePath, icon: LayoutDashboard },
    { name: "Documents", href: `${basePath}/documents`, icon: FileText },
    { name: "AI Copilot", href: `${basePath}/copilot`, icon: Sparkles },
    { name: "Repository", href: `${basePath}/repository`, icon: FolderGit },
    { name: "Engineering Sync", href: `${basePath}/sync`, icon: GitBranch },
    { name: "AI Tools", href: `${basePath}/ai-tools`, icon: Sparkles },
    { name: "Settings", href: `${basePath}/settings`, icon: Settings },
  ];

  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-neutral-800/50 bg-neutral-950/50 backdrop-blur-sm h-full">
      <div className="flex flex-col h-full py-6 px-4">
        {/* Back to dashboard */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-200 transition-colors mb-6 group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Dashboard
        </Link>

        {/* Project identity */}
        <div className="flex items-center gap-3 mb-8 px-1">
          <div
            className="h-10 w-10 rounded-lg flex items-center justify-center border border-neutral-800 bg-neutral-900/60"
          >
            <IconComponent className="h-5 w-5" style={{ color: project.color }} />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-neutral-100 truncate">{project.title}</h2>
            <p className="text-xs text-neutral-500 truncate">Project</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1.5 flex-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 relative",
                  isActive
                    ? "bg-neutral-800/80 text-neutral-50"
                    : "text-neutral-400 hover:bg-neutral-800/40 hover:text-neutral-200"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="project-nav-indicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                    style={{ backgroundColor: project.color }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <item.icon className="h-4 w-4 shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

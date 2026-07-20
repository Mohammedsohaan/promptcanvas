"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Calendar, Palette, Activity } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Project } from "@/services/projects";

interface ProjectMetadataPanelProps {
  project: Project;
}

export function ProjectMetadataPanel({ project }: ProjectMetadataPanelProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const metadataItems = [
    {
      label: "Created",
      value: formatDate(project.created_at),
      icon: Calendar,
    },
    {
      label: "Last Updated",
      value: formatDate(project.updated_at),
      icon: Calendar,
    },
    {
      label: "Status",
      value: project.is_archived ? "Archived" : "Active",
      icon: Activity,
    },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
      >
        <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-4">
          Project Details
        </h3>
        <Card hoverEffect={false} className="p-4 bg-neutral-900/40 border-neutral-800/60">
          <div className="space-y-4">
            {metadataItems.map((item) => (
              <div key={item.label} className="flex items-start gap-3">
                <item.icon className="h-4 w-4 text-neutral-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-neutral-500">{item.label}</p>
                  <p className="text-sm text-neutral-200">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Accent color display */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <Card hoverEffect={false} className="p-4 bg-neutral-900/40 border-neutral-800/60">
          <div className="flex items-center gap-3">
            <Palette className="h-4 w-4 text-neutral-500 shrink-0" />
            <div className="flex items-center gap-2">
              <p className="text-xs text-neutral-500">Accent Color</p>
              <div
                className="h-5 w-5 rounded-full border border-neutral-700"
                style={{ backgroundColor: project.color }}
              />
              <p className="text-xs text-neutral-400 font-mono">{project.color}</p>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

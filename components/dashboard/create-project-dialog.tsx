"use client";

import * as React from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createProject } from "@/services/projects";
import { useRouter } from "next/navigation";
import { Folder, Code, Sparkles, BookOpen, Layers, Briefcase, Database, Globe, Loader2 } from "lucide-react";

interface CreateProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const COLORS = [
  { value: "#6366F1", label: "Indigo" },
  { value: "#10B981", label: "Emerald" },
  { value: "#F43F5E", label: "Rose" },
  { value: "#F59E0B", label: "Amber" },
  { value: "#06B6D4", label: "Cyan" },
  { value: "#8B5CF6", label: "Purple" },
  { value: "#D946EF", label: "Fuchsia" },
  { value: "#F97316", label: "Orange" },
];

const ICONS = [
  { name: "Folder", component: Folder },
  { name: "Code", component: Code },
  { name: "Sparkles", component: Sparkles },
  { name: "BookOpen", component: BookOpen },
  { name: "Layers", component: Layers },
  { name: "Briefcase", component: Briefcase },
  { name: "Database", component: Database },
  { name: "Globe", component: Globe },
];

export function CreateProjectDialog({ isOpen, onClose }: CreateProjectDialogProps) {
  const router = useRouter();
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [selectedColor, setSelectedColor] = React.useState("#6366F1");
  const [selectedIcon, setSelectedIcon] = React.useState("Folder");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setSelectedColor("#6366F1");
    setSelectedIcon("Folder");
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsLoading(true);
    setError(null);

    const result = await createProject({
      title: title.trim(),
      description: description.trim() || undefined,
      color: selectedColor,
      icon: selectedIcon,
    });

    setIsLoading(false);

    if (result.success) {
      handleClose();
      router.refresh();
    } else {
      setError(result.message);
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={handleClose} title="Create New Project">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label htmlFor="project-title" className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
            Project Title <span className="text-red-500">*</span>
          </label>
          <Input
            id="project-title"
            placeholder="e.g. My Next Startup, Design System..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isLoading}
            required
            autoFocus
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="project-desc" className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
            Description
          </label>
          <textarea
            id="project-desc"
            placeholder="Describe your project goals..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isLoading}
            className="flex min-h-[80px] w-full rounded-md border border-neutral-800 bg-neutral-900/50 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-700 disabled:cursor-not-allowed disabled:opacity-50 transition-colors resize-none"
          />
        </div>

        {/* Color picker */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
            Accent Color
          </label>
          <div className="flex flex-wrap gap-2">
            {COLORS.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => setSelectedColor(color.value)}
                disabled={isLoading}
                className="relative h-8 w-8 rounded-full border border-neutral-800 transition-transform hover:scale-110 active:scale-95"
                style={{ backgroundColor: color.value }}
                title={color.label}
              >
                {selectedColor === color.value && (
                  <span className="absolute inset-0 m-auto h-2.5 w-2.5 rounded-full bg-white shadow-sm" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Icon selector */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
            Icon
          </label>
          <div className="grid grid-cols-8 gap-2">
            {ICONS.map((icon) => {
              const IconComponent = icon.component;
              const isSelected = selectedIcon === icon.name;
              return (
                <button
                  key={icon.name}
                  type="button"
                  onClick={() => setSelectedIcon(icon.name)}
                  disabled={isLoading}
                  className={`flex h-10 items-center justify-center rounded-lg border transition-all hover:scale-105 active:scale-95 ${
                    isSelected
                      ? "border-neutral-200 bg-neutral-100 text-neutral-950"
                      : "border-neutral-800 bg-neutral-900/20 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700"
                  }`}
                  title={icon.name}
                >
                  <IconComponent className="h-5 w-5" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-900">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={isLoading}
            className="h-10"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading || !title.trim()}
            className="h-10 px-5"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Creating...
              </>
            ) : (
              "Create Project"
            )}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

"use client";

import * as React from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface AIActionButtonProps {
  label: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export function AIActionButton({
  label,
  description,
  icon: Icon = Sparkles,
  onClick,
  className,
  disabled,
}: AIActionButtonProps) {
  return (
    <Button
      variant="secondary"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full justify-start text-left p-3 h-auto border-neutral-800/80 bg-neutral-900/40 hover:bg-neutral-800/60 hover:border-neutral-700 transition-all group rounded-xl",
        className
      )}
    >
      <div className="flex items-start gap-3 w-full">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-950/80 text-neutral-400 group-hover:text-neutral-200 group-hover:border-neutral-700 transition-colors mt-0.5">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium text-neutral-200 group-hover:text-neutral-100 transition-colors">
            {label}
          </div>
          {description && (
            <div className="text-xs text-neutral-500 mt-0.5 truncate font-normal">
              {description}
            </div>
          )}
        </div>
      </div>
    </Button>
  );
}

"use client";

import * as React from "react";
import { Check, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

interface SaveIndicatorProps {
  status: SaveStatus;
  className?: string;
}

export function SaveIndicator({ status, className }: SaveIndicatorProps) {
  if (status === "idle") {
    return null;
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-medium transition-all duration-200 px-2.5 py-1 rounded-full border",
        status === "saving" && "border-neutral-800 bg-neutral-900/80 text-neutral-400",
        status === "saved" && "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
        status === "error" && "border-rose-500/20 bg-rose-500/10 text-rose-400",
        className
      )}
    >
      {status === "saving" && (
        <>
          <Loader2 className="h-3 w-3 animate-spin text-neutral-400" />
          <span>Saving...</span>
        </>
      )}

      {status === "saved" && (
        <>
          <Check className="h-3 w-3 text-emerald-400" />
          <span>Saved</span>
        </>
      )}

      {status === "error" && (
        <>
          <AlertCircle className="h-3 w-3 text-rose-400" />
          <span>Error Saving</span>
        </>
      )}
    </div>
  );
}

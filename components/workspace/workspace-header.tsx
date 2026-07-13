"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2, MoreHorizontal } from "lucide-react";

export function WorkspaceHeader() {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 py-6 border-b border-neutral-800/50 mb-8">
      <div className="space-y-1.5">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-100">
            Inventory Management System
          </h1>
          <Badge variant="warning">Planning</Badge>
        </div>
        <div className="flex flex-wrap items-center text-sm text-neutral-500 gap-4">
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            Last updated 10 mins ago
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
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium md:hidden">
            75% Complete
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <button className="h-9 px-4 rounded-full border border-neutral-800 bg-neutral-900 text-sm font-medium text-neutral-300 hover:text-neutral-100 hover:bg-neutral-800 transition-colors">
          Preview Blueprint
        </button>
        <button className="h-9 w-9 flex items-center justify-center rounded-full border border-neutral-800 bg-neutral-900 text-neutral-300 hover:text-neutral-100 hover:bg-neutral-800 transition-colors">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

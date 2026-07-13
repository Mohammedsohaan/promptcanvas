"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Edit3, CheckCircle2 } from "lucide-react";

interface PlanningCardProps {
  title: string;
  description: string;
  placeholder: string;
  isCompleted?: boolean;
}

export function PlanningCard({ title, description, placeholder, isCompleted = false }: PlanningCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, type: "spring", bounce: 0 }}
    >
      <Card className="p-6 md:p-8 bg-neutral-900/40 border-neutral-800/60 hover:bg-neutral-900/60 transition-all duration-300 group relative overflow-hidden focus-within:ring-2 ring-emerald-500/50">
        <div className="flex justify-between items-start mb-6">
          <div className="pr-8">
            <h3 className="text-lg md:text-xl font-semibold text-neutral-100 flex items-center gap-3">
              {title}
              {isCompleted && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
            </h3>
            <p className="text-sm text-neutral-400 mt-1.5 leading-relaxed">{description}</p>
          </div>
          <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2.5 text-neutral-400 hover:text-neutral-100 rounded-full hover:bg-neutral-800 bg-neutral-950/50 absolute top-6 right-6 shadow-sm border border-neutral-800/50">
            <Edit3 className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 rounded-lg bg-neutral-950 border border-neutral-800/80 text-neutral-500 text-sm italic min-h-[120px] hover:border-neutral-700 transition-colors cursor-text">
          {placeholder}
        </div>
      </Card>
    </motion.div>
  );
}

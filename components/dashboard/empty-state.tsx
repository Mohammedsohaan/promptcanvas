"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { FolderKanban, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function EmptyState() {
  const router = useRouter();

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", bounce: 0, duration: 0.6 }}
      className="flex flex-col items-center justify-center py-24 px-4 text-center border border-dashed border-neutral-800 rounded-xl bg-neutral-900/20"
    >
      <div className="h-16 w-16 rounded-full bg-neutral-900 flex items-center justify-center mb-6">
        <FolderKanban className="h-8 w-8 text-neutral-500" />
      </div>
      <h2 className="text-xl font-semibold text-neutral-100 mb-2">
        Your workspace is empty.
      </h2>
      <p className="text-neutral-400 max-w-sm mb-8 text-sm">
        Create your first product and begin transforming an idea into a structured software blueprint.
      </p>
      <Button size="lg" className="rounded-full" onClick={() => router.push("/dashboard/products/new")}>
        <Plus className="mr-2 h-4 w-4" />
        Create Product
      </Button>
    </motion.div>
  );
}

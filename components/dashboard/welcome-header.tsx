"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { User } from "@supabase/supabase-js";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateProjectDialog } from "@/components/dashboard/create-project-dialog";

interface WelcomeHeaderProps {
  user?: User | null;
}

export function WelcomeHeader({ user }: WelcomeHeaderProps) {
  const displayName = user?.user_metadata?.full_name || user?.email || "";
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-100">
          Good Evening{displayName ? `, ${displayName}` : ""},
        </h1>
        <p className="mt-1 text-neutral-400">
          Welcome back to PromptCanvas.
        </p>
      </motion.div>

      <div className="shrink-0">
        <Button variant="primary" onClick={() => setIsDialogOpen(true)} className="h-10">
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      <CreateProjectDialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} />
    </div>
  );
}

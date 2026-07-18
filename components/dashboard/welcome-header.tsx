"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { User } from "@supabase/supabase-js";

interface WelcomeHeaderProps {
  user?: User | null;
}

export function WelcomeHeader({ user }: WelcomeHeaderProps) {
  const displayName = user?.user_metadata?.full_name || user?.email || "";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      <h1 className="text-3xl font-semibold tracking-tight text-neutral-100">
        Good Evening{displayName ? `, ${displayName}` : ""},
      </h1>
      <p className="mt-1 text-neutral-400">
        Welcome back to PromptCanvas.
      </p>
    </motion.div>
  );
}

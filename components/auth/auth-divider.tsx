"use client";

import { motion } from "framer-motion";

interface AuthDividerProps {
  label?: string;
}

export function AuthDivider({ label = "or" }: AuthDividerProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="relative flex items-center my-6"
    >
      <div className="flex-1 h-px bg-white/10" />
      <span className="px-4 text-xs font-medium text-white/30 uppercase tracking-wider">
        {label}
      </span>
      <div className="flex-1 h-px bg-white/10" />
    </motion.div>
  );
}

import * as React from "react";
import { motion } from "framer-motion";

export function WelcomeHeader() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      <h1 className="text-3xl font-semibold tracking-tight text-neutral-100">
        Good Evening,
      </h1>
      <p className="mt-1 text-neutral-400">
        Welcome back to PromptCanvas.
      </p>
    </motion.div>
  );
}

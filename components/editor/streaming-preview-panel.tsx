import * as React from "react";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface StreamingPreviewPanelProps {
  text: string;
}

export function StreamingPreviewPanel({ text }: StreamingPreviewPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="mb-6 rounded-2xl border border-purple-500/30 bg-purple-500/10 backdrop-blur-xl p-4 overflow-hidden relative"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600/20 via-purple-500/50 to-purple-600/20">
        <motion.div
          className="h-full bg-purple-500"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      <div className="flex items-center gap-2 mb-3 text-purple-400">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm font-medium">AI is generating...</span>
      </div>

      <div className="prose prose-invert max-w-none text-neutral-300 font-mono text-sm whitespace-pre-wrap">
        {text}
        <span className="inline-block w-2 h-4 ml-1 bg-purple-400 animate-pulse align-middle" />
      </div>
    </motion.div>
  );
}

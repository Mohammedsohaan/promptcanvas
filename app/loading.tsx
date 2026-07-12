"use client";

import { motion } from "framer-motion";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex min-h-screen flex-col items-center justify-center bg-[#050505]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col items-center gap-6"
      >
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl">
          <motion.div
            className="h-6 w-6 rounded-lg bg-white"
            animate={{
              rotate: [0, 90, 180, 270, 360],
              borderRadius: ["20%", "20%", "50%", "50%", "20%"]
            }}
            transition={{
              duration: 2.5,
              ease: "easeInOut",
              times: [0, 0.25, 0.5, 0.75, 1],
              repeat: Infinity,
              repeatDelay: 0.2
            }}
          />
        </div>
        
        <div className="flex flex-col items-center gap-2 text-center">
          <h2 className="text-lg font-medium tracking-tight text-white">PromptCanvas</h2>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-sm text-white/50"
          >
            Initializing Workspace...
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}

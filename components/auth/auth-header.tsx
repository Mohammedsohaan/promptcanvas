"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface AuthHeaderProps {
  heading: string;
  subtitle: string;
}

export function AuthHeader({ heading, subtitle }: AuthHeaderProps) {
  return (
    <div className="flex flex-col items-center text-center">
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
      >
        <Link
          href="/"
          className="inline-block font-bold text-xl tracking-tight text-white mb-8 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded-sm"
        >
          PromptCanvas
        </Link>
      </motion.div>

      {/* Heading */}
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
        className="text-2xl md:text-3xl font-bold tracking-tight text-white"
      >
        {heading}
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: [0.21, 0.47, 0.32, 0.98] }}
        className="mt-2 text-sm text-white/50 font-medium"
      >
        {subtitle}
      </motion.p>
    </div>
  );
}

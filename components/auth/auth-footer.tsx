"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface AuthFooterProps {
  message: string;
  linkText: string;
  linkHref: string;
}

export function AuthFooter({ message, linkText, linkHref }: AuthFooterProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="flex flex-col items-center gap-4 mt-8"
    >
      <p className="text-sm text-white/40">
        {message}{" "}
        <Link
          href={linkHref}
          className="font-medium text-white/70 hover:text-white transition-colors underline underline-offset-4 decoration-white/20 hover:decoration-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded-sm"
        >
          {linkText}
        </Link>
      </p>

      <Link
        href="/"
        className="text-xs text-white/30 hover:text-white/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded-sm"
      >
        ← Back to home
      </Link>
    </motion.div>
  );
}

"use client";

import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

export interface CardProps extends HTMLMotionProps<"div"> {
  hoverEffect?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, hoverEffect = true, children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          "relative rounded-2xl border border-white/5 bg-[#0A0A0A]/80 backdrop-blur-xl p-6 transition-colors duration-500 overflow-hidden group",
          className
        )}
        whileHover={hoverEffect ? { 
          y: -4, 
          borderColor: "rgba(255,255,255,0.15)", 
          boxShadow: "0 20px 40px -10px rgba(0,0,0,0.5), 0 0 20px -5px rgba(255,255,255,0.05)",
          backgroundColor: "rgba(255,255,255,0.03)"
        } : undefined}
        transition={{ duration: 0.4, ease: [0.21, 0.47, 0.32, 0.98] }}
        {...props}
      >
        {/* Subtle top highlight for 3D effect */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        
        <div className="relative z-10 h-full w-full">
          {children as React.ReactNode}
        </div>
      </motion.div>
    );
  }
);
Card.displayName = "Card";

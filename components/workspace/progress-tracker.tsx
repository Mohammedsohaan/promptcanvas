"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  "Problem",
  "Target Users",
  "Goals",
  "Features",
  "MVP",
  "Blueprint",
];

export function ProgressTracker({ activeStep = 0 }: { activeStep?: number }) {
  return (
    <div className="mb-10 w-full overflow-x-auto pb-4 hide-scrollbar">
      <div className="flex items-center min-w-max">
        {steps.map((step, index) => {
          const isActive = index === activeStep;
          const isCompleted = index < activeStep;

          return (
            <React.Fragment key={step}>
              <div className="flex items-center group relative cursor-pointer">
                <div 
                  className={cn(
                    "flex items-center justify-center h-8 w-8 rounded-full border-2 transition-colors duration-300 z-10 bg-neutral-950",
                    isActive ? "border-emerald-500 text-emerald-500" :
                    isCompleted ? "border-emerald-500 bg-emerald-500 text-neutral-950" :
                    "border-neutral-800 text-neutral-500 group-hover:border-neutral-600"
                  )}
                >
                  {isCompleted ? <Check className="h-4 w-4 stroke-[3]" /> : <span className="text-xs font-semibold">{index + 1}</span>}
                </div>
                <span 
                  className={cn(
                    "ml-3 text-sm font-medium transition-colors duration-300",
                    isActive ? "text-emerald-400" :
                    isCompleted ? "text-neutral-300" :
                    "text-neutral-500 group-hover:text-neutral-400"
                  )}
                >
                  {step}
                </span>
                {isActive && (
                  <motion.div 
                    layoutId="progressIndicator"
                    className="absolute -inset-y-1.5 -inset-x-3 rounded-lg bg-emerald-500/10 z-0"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </div>

              {index < steps.length - 1 && (
                <div className="mx-4 h-[2px] w-12 bg-neutral-800 relative overflow-hidden rounded-full">
                  {isCompleted && (
                    <motion.div 
                      initial={{ x: "-100%" }}
                      animate={{ x: 0 }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="absolute inset-0 bg-emerald-500"
                    />
                  )}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

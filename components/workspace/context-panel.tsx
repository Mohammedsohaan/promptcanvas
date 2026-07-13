"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Lightbulb, Target, Clock, LayoutTemplate } from "lucide-react";

export function ContextPanel() {
  return (
    <div className="space-y-6 sticky top-24">
      {/* Today's Recommendation */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Card className="p-5 bg-emerald-500/5 border-emerald-500/20">
          <div className="flex items-center gap-2 text-emerald-400 font-medium mb-3 text-sm">
            <Lightbulb className="h-4 w-4" />
            Recommendation
          </div>
          <p className="text-sm text-neutral-300 leading-relaxed italic">
            &quot;Define your target users before expanding feature scope. Knowing exactly who you are building for naturally eliminates unnecessary features.&quot;
          </p>
        </Card>
      </motion.div>

      {/* Progress Summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <Card className="p-5 bg-neutral-900/40 border-neutral-800/60">
          <h4 className="text-sm font-medium text-neutral-400 mb-4 flex items-center gap-2">
            <Target className="h-4 w-4" />
            Planning Progress
          </h4>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-neutral-300 font-medium">Estimated Completion</span>
                <span className="text-emerald-400 font-medium">75%</span>
              </div>
              <div className="h-2 w-full bg-neutral-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full w-[75%]" />
              </div>
            </div>
            <div className="flex items-center text-sm text-neutral-400 gap-2">
              <Clock className="h-4 w-4" />
              <span>Est. time remaining: 15 mins</span>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Blueprint Preview */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <Card className="p-5 bg-neutral-900/40 border-neutral-800/60 opacity-60">
          <h4 className="text-sm font-medium text-neutral-400 mb-3 flex items-center gap-2">
            <LayoutTemplate className="h-4 w-4" />
            Blueprint Preview
          </h4>
          <div className="aspect-[4/3] rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-center flex-col gap-2 p-4 text-center">
            <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-semibold border border-neutral-800 px-2 py-1 rounded-md mb-1">Locked</span>
            <span className="text-xs text-neutral-500 max-w-[140px]">
              Complete the planning steps to unlock your generated blueprint
            </span>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

"use client";

import * as React from "react";
import { motion, useInView, useSpring, useTransform, Variants } from "framer-motion";
import { Card } from "@/components/ui/card";
import { FolderKanban, FileText, CheckCircle2, ArchiveX } from "lucide-react";

const stats = [
  { label: "Products", value: 12, icon: FolderKanban, color: "text-emerald-400" },
  { label: "Drafts", value: 8, icon: FileText, color: "text-amber-400" },
  { label: "Completed", value: 3, icon: CheckCircle2, color: "text-blue-400" },
  { label: "Archived", value: 1, icon: ArchiveX, color: "text-neutral-400" },
];

function AnimatedCounter({ value }: { value: number }) {
  const ref = React.useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  
  const springValue = useSpring(0, {
    bounce: 0,
    duration: 2000,
  });

  React.useEffect(() => {
    if (inView) {
      springValue.set(value);
    }
  }, [inView, value, springValue]);

  const display = useTransform(springValue, (current) => Math.round(current));

  return <motion.span ref={ref}>{display}</motion.span>;
}

export function StatsCards() {
  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring", bounce: 0, duration: 0.6 } }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-8"
    >
      {stats.map((stat, i) => (
        <motion.div key={i} variants={item}>
          <Card className="p-4 md:p-6 bg-neutral-900/40 border-neutral-800/60 flex items-center justify-between group overflow-hidden relative">
            <div className="relative z-10">
              <p className="text-sm font-medium text-neutral-400 mb-1">{stat.label}</p>
              <h2 className="text-2xl font-bold text-neutral-100">
                <AnimatedCounter value={stat.value} />
              </h2>
            </div>
            <div className="relative z-10 h-10 w-10 rounded-full bg-neutral-800/50 flex items-center justify-center">
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-neutral-800/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}

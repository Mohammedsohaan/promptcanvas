"use client";

import * as React from "react";
import { motion, Variants } from "framer-motion";
import { PlusSquare, PlayCircle, Grid } from "lucide-react";
import { Card } from "@/components/ui/card";
import Link from "next/link";

const actions = [
  { title: "New Product", description: "Start from scratch", icon: PlusSquare, href: "/dashboard/products/new", primary: true },
  { title: "Continue Planning", description: "Resume your last draft", icon: PlayCircle, href: "/dashboard", primary: false },
  { title: "Browse Products", description: "View all your blueprints", icon: Grid, href: "/dashboard/products", primary: false },
];

export function QuickActions() {
  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring", bounce: 0, duration: 0.6 } }
  };

  return (
    <div className="mb-10">
      <h2 className="text-sm font-medium text-neutral-400 mb-4">Quick Actions</h2>
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {actions.map((action, i) => (
          <motion.div key={i} variants={item}>
            <Link href={action.href} className="block group outline-none">
              <Card className={`p-5 transition-all duration-300 group-hover:-translate-y-1 group-focus-visible:ring-2 ring-neutral-700 ${action.primary ? 'bg-neutral-800 border-neutral-700 group-hover:bg-neutral-700' : 'bg-neutral-900/40 border-neutral-800/60 group-hover:bg-neutral-800/80'}`}>
                <div className="flex items-center gap-4">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${action.primary ? 'bg-neutral-100 text-neutral-950' : 'bg-neutral-800 text-neutral-300'}`}>
                    <action.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className={`text-sm font-semibold ${action.primary ? 'text-neutral-100' : 'text-neutral-200'}`}>{action.title}</h3>
                    <p className="text-xs text-neutral-400 mt-0.5">{action.description}</p>
                  </div>
                </div>
              </Card>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

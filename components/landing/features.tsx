"use client";

import { AnimatedSection } from "@/components/ui/animated-section";
import { Card } from "@/components/ui/card";
import { Sparkles, LayoutTemplate, FolderTree, Compass, GitMerge, Archive } from "lucide-react";
import { motion } from "framer-motion";

export function Features() {
  const features = [
    {
      icon: Compass,
      title: "Guided Product Wizard",
      desc: "Step-by-step guidance to extract your core idea, target users, and MVP scope."
    },
    {
      icon: LayoutTemplate,
      title: "Product Blueprint Generator",
      desc: "Automatically compile your answers into a structured, readable blueprint."
    },
    {
      icon: FolderTree,
      title: "Product Planning Workspace",
      desc: "A centralized hub for all your ongoing and past software planning projects."
    },
    {
      icon: Sparkles,
      title: "AI Assisted Guidance",
      desc: "Intelligent suggestions to refine your problem statement and feature list."
    },
    {
      icon: GitMerge,
      title: "Version Planning",
      desc: "Define strict scope for v1, v2, and v3 to prevent endless feature creep."
    },
    {
      icon: Archive,
      title: "Product Organization",
      desc: "Keep your technical requirements, API plans, and DB schema logically grouped."
    }
  ];

  return (
    <AnimatedSection className="bg-[#050505] relative z-10 pt-32 pb-24">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-6">
            Everything you need to plan
          </h2>
          <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto font-medium leading-relaxed">
            A comprehensive toolset designed specifically for software founders and engineers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
            >
              <Card className="h-full flex flex-col items-start gap-5 p-8 group cursor-default">
                <div className="w-12 h-12 rounded-xl bg-[#141414] flex items-center justify-center border border-white/5 transition-all duration-500 group-hover:bg-white group-hover:border-white/20 shadow-inner group-hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                  <feature.icon className="w-6 h-6 text-white/70 transition-colors duration-500 group-hover:text-black" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-3 tracking-tight">{feature.title}</h3>
                  <p className="text-base text-white/50 leading-relaxed">{feature.desc}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
}

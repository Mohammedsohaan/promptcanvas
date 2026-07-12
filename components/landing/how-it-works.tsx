"use client";

import { AnimatedSection } from "@/components/ui/animated-section";
import { Lightbulb, Target, Users, Flag, Layers, Rocket, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export function HowItWorks() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  const steps = [
    { icon: <Lightbulb className="w-5 h-5" />, label: "Idea" },
    { icon: <Target className="w-5 h-5" />, label: "Problem" },
    { icon: <Users className="w-5 h-5" />, label: "Users" },
    { icon: <Flag className="w-5 h-5" />, label: "Goals" },
    { icon: <Layers className="w-5 h-5" />, label: "Features" },
    { icon: <Rocket className="w-5 h-5" />, label: "MVP" },
    { icon: <FileText className="w-5 h-5" />, label: "Blueprint" },
  ];

  return (
    <AnimatedSection className="relative z-10 py-32 bg-[#050505] border-t border-white/5">
      <div className="container mx-auto px-6 max-w-5xl text-center">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-6">
          A structured path to success
        </h2>
        <p className="text-lg md:text-xl text-white/50 mb-24 max-w-2xl mx-auto font-medium leading-relaxed">
          PromptCanvas guides you through the critical questions you need to answer before you write a single line of code.
        </p>

        <div ref={containerRef} className="relative">
          {/* Background Connecting line */}
          <div className="absolute top-8 left-10 right-10 h-[2px] bg-white/5 hidden md:block rounded-full" />
          
          {/* Animated Progress Line */}
          <motion.div 
            className="absolute top-8 left-10 h-[2px] bg-gradient-to-r from-white/20 via-white to-white/20 hidden md:block shadow-[0_0_10px_rgba(255,255,255,0.5)] rounded-full"
            style={{ 
              width: useTransform(scrollYProgress, [0, 1], ["0%", "100%"]),
              transformOrigin: "left"
            }}
          />
          
          <div className="flex flex-col md:flex-row justify-between gap-10 md:gap-4 relative z-10">
            {steps.map((step, i) => (
              <motion.div 
                key={i} 
                className="flex flex-row md:flex-col items-center gap-4 md:gap-6 group relative"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                {/* Active node highlight glow */}
                {i === steps.length - 1 && (
                  <div className="absolute -inset-4 bg-white/10 rounded-full blur-2xl hidden md:block opacity-50" />
                )}
                
                <div className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 relative z-10",
                  i === steps.length - 1 
                    ? "bg-white text-black shadow-[0_0_30px_rgba(255,255,255,0.3)] scale-110" 
                    : "bg-[#0A0A0A] border border-white/10 text-white/50 group-hover:bg-[#141414] group-hover:text-white group-hover:border-white/30 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                )}>
                  {step.icon}
                </div>
                
                <div className="flex flex-col items-start md:items-center">
                  <span className={cn(
                    "text-sm font-semibold tracking-wide uppercase transition-colors",
                    i === steps.length - 1 ? "text-white" : "text-white/40 group-hover:text-white/80"
                  )}>
                    {step.label}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
}

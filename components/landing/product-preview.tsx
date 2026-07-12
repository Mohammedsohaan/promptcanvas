"use client";

import { AnimatedSection } from "@/components/ui/animated-section";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export function ProductPreview() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });
  
  // Subtle parallax effect for the dashboard
  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);

  return (
    <AnimatedSection className="relative z-10 pb-32 pt-20">
      <div className="container mx-auto px-6 max-w-6xl" ref={containerRef}>
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">
            A workspace designed for focus
          </h2>
          <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto font-medium">
            Clean, fast, and organized. Just you and your product blueprint.
          </p>
        </div>

        <div className="relative max-w-5xl mx-auto">
          {/* Ambient background glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 blur-[100px] transform scale-110 -z-10" />

          <motion.div 
            style={{ y }}
            className="relative rounded-2xl md:rounded-3xl border border-white/10 bg-[#0A0A0A]/90 backdrop-blur-2xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8),0_0_40px_rgba(255,255,255,0.05)] overflow-hidden aspect-[16/10] md:aspect-[16/9] flex flex-col group"
            whileHover={{ 
              y: -8, 
              boxShadow: "0 40px 80px -15px rgba(0,0,0,1), 0 0 50px rgba(255,255,255,0.1)" 
            }}
            transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
          >
            {/* Mac-like Top Bar */}
            <div className="h-12 border-b border-white/10 flex items-center px-4 gap-2 bg-gradient-to-b from-[#141414] to-[#0A0A0A]">
              <div className="w-3 h-3 rounded-full bg-[#ED6A5E] shadow-sm" />
              <div className="w-3 h-3 rounded-full bg-[#F4BF4F] shadow-sm" />
              <div className="w-3 h-3 rounded-full bg-[#61C554] shadow-sm" />
            </div>

            {/* Fake Dashboard Body */}
            <div className="flex flex-1 overflow-hidden">
              {/* Sidebar */}
              <div className="w-48 md:w-64 border-r border-white/5 bg-[#050505]/60 p-4 hidden sm:flex flex-col gap-6 shadow-[inset_-10px_0_20px_-10px_rgba(0,0,0,0.5)] z-10">
                <div className="flex items-center gap-3 px-2 pb-4 border-b border-white/5">
                  <div className="w-7 h-7 rounded-md bg-white flex items-center justify-center shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                    <div className="w-3.5 h-3.5 bg-black rounded-sm" />
                  </div>
                  <span className="font-semibold text-sm text-white">Acme CRM</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {['Overview', 'Blueprint', 'Database', 'API Design', 'Settings'].map((item, i) => (
                    <div key={i} className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${i === 1 ? 'bg-white/10 text-white shadow-[0_2px_10px_rgba(0,0,0,0.2)] border border-white/5' : 'text-white/40 hover:text-white hover:bg-white/5'}`}>
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 p-6 md:p-10 flex flex-col gap-8 bg-[#0A0A0A] relative z-0">
                {/* Subtle top reflection */}
                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />

                <div className="flex justify-between items-end pb-4 border-b border-white/5">
                  <div>
                    <h3 className="text-2xl font-bold text-white tracking-tight">Product Blueprint</h3>
                    <p className="text-sm text-white/40 mt-1.5 font-medium">Generated from Wizard</p>
                  </div>
                  <div className="w-24 h-9 rounded-lg bg-white text-black flex items-center justify-center text-xs font-semibold shadow-[0_2px_10px_rgba(255,255,255,0.2)] hover:bg-white/90 transition-colors cursor-pointer">
                    Export
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-28 rounded-xl border border-white/5 bg-[#141414]/50 p-5 flex flex-col gap-3 shadow-[0_4px_15px_rgba(0,0,0,0.2)] hover:bg-[#141414] hover:border-white/10 transition-all cursor-pointer group/card">
                      <div className="w-8 h-8 rounded-lg bg-white/10 group-hover/card:bg-white/20 transition-colors" />
                      <div className="w-1/2 h-2.5 rounded-full bg-white/30" />
                      <div className="w-3/4 h-2 rounded-full bg-white/10" />
                    </div>
                  ))}
                </div>

                <div className="flex-1 rounded-xl border border-white/5 bg-[#141414]/30 p-8 flex flex-col gap-5 mt-2 shadow-[0_4px_20px_rgba(0,0,0,0.2)] relative overflow-hidden">
                  {/* Subtle animated highlight passing across the blueprint */}
                  <motion.div 
                    className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/[0.03] to-transparent -rotate-12"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 5 }}
                  />

                  <div className="w-1/3 h-5 rounded-md bg-white/20 mb-2" />
                  <div className="w-full h-2.5 rounded-full bg-white/10" />
                  <div className="w-[90%] h-2.5 rounded-full bg-white/10" />
                  <div className="w-[95%] h-2.5 rounded-full bg-white/10" />
                  <div className="w-1/4 h-4 rounded-md bg-white/20 mt-6 mb-1" />
                  <div className="w-[85%] h-2.5 rounded-full bg-white/10" />
                  <div className="w-[75%] h-2.5 rounded-full bg-white/10" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatedSection>
  );
}

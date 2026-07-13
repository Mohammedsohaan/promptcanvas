"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";

export function Hero() {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  const duration = 16; // Slower, premium cycle duration
  const fadeOutStart = 13.5;
  const fadeOutEnd = 14.5;

  const nodes = [
    { id: "idea", label: "Idea", desc: "Core concept", x: 200, y: 120, appearAt: 0, activeDuration: 1.5 },
    { id: "problem", label: "Problem", desc: "User pain points", x: 120, y: 300, appearAt: 1.5, activeDuration: 1.5 },
    { id: "users", label: "Target Users", desc: "Target audience", x: 250, y: 480, appearAt: 3.0, activeDuration: 1.5 },
    { id: "goals", label: "Goals", desc: "Success metrics", x: 450, y: 620, appearAt: 4.5, activeDuration: 1.5 },
    { id: "features", label: "Features", desc: "Scope mapping", x: 750, y: 550, appearAt: 6.0, activeDuration: 1.5 },
    { id: "mvp", label: "MVP", desc: "Version 1 rollout", x: 880, y: 350, appearAt: 7.5, activeDuration: 1.5 },
    { id: "blueprint", label: "Blueprint", desc: "Architecture", x: 500, y: 750, appearAt: 9.0, activeDuration: 4.5 }, // Longer hold
  ];

  const segments = [
    { x1: 200, y1: 120, x2: 120, y2: 300, drawStart: 0.5, drawEnd: 1.5 },
    { x1: 120, y1: 300, x2: 250, y2: 480, drawStart: 2.0, drawEnd: 3.0 },
    { x1: 250, y1: 480, x2: 450, y2: 620, drawStart: 3.5, drawEnd: 4.5 },
    { x1: 450, y1: 620, x2: 750, y2: 550, drawStart: 5.0, drawEnd: 6.0 },
    { x1: 750, y1: 550, x2: 880, y2: 350, drawStart: 6.5, drawEnd: 7.5 },
    { x1: 880, y1: 350, x2: 500, y2: 750, drawStart: 8.0, drawEnd: 9.0 },
  ];

  const getNodeAnimation = (appearAt: number, activeDuration: number) => {
    return {
      opacity:    [0, 0, 1, 1, 1, 0, 0],
      scale:      [0.95, 0.95, 1.05, 1, 1, 0.95, 0.95], // Pulse larger when active
      borderColor:["rgba(255,255,255,0)", "rgba(255,255,255,0)", "rgba(255,255,255,0.6)", "rgba(255,255,255,0.15)", "rgba(255,255,255,0.15)", "rgba(255,255,255,0)", "rgba(255,255,255,0)"],
      boxShadow:  ["0 0 0px rgba(255,255,255,0)", "0 0 0px rgba(255,255,255,0)", "0 0 30px rgba(255,255,255,0.25)", "0 0 10px rgba(255,255,255,0.05)", "0 0 10px rgba(255,255,255,0.05)", "0 0 0px rgba(255,255,255,0)", "0 0 0px rgba(255,255,255,0)"],
      times: [
        0, 
        appearAt / duration, 
        (appearAt + 0.4) / duration, 
        Math.min((appearAt + activeDuration), fadeOutStart) / duration, 
        fadeOutStart / duration, 
        fadeOutEnd / duration, 
        1
      ]
    };
  };

  const getLineAnimation = (drawStart: number, drawEnd: number) => {
    return {
      pathLength: [0, 0, 1, 1, 1, 0, 0],
      opacity:    [1, 1, 1, 0.3, 0.3, 0, 0], // Dims after drawing to create trailing glow
      times: [
        0, 
        drawStart / duration, 
        drawEnd / duration, 
        Math.min((drawEnd + 1.0), fadeOutStart) / duration, 
        fadeOutStart / duration, 
        fadeOutEnd / duration, 
        1
      ]
    };
  };

  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden min-h-[90vh] flex items-center justify-center">
      
      {/* Background Canvas Wrapper */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.15] flex items-center justify-center"
        style={{
          maskImage: "radial-gradient(ellipse at center, black 20%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 20%, transparent 80%)"
        }}
      >
        {/* Soft Grid */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Floating Planning Graph */}
        <motion.div 
          className="relative w-[1000px] h-[800px]"
          animate={{ scale: [1, 1, 1.02, 1, 1] }}
          transition={{ 
            duration, 
            times: [0, 9.0/16, 11.25/16, 13.5/16, 1], // Breathing effect between 9s and 13.5s
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        >
          {/* SVG Connections */}
          <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 1000 800" fill="none">
            {segments.map((seg, index) => {
              const anim = getLineAnimation(seg.drawStart, seg.drawEnd);
              return (
                <motion.path 
                  key={`line-${index}`}
                  d={`M ${seg.x1} ${seg.y1} L ${seg.x2} ${seg.y2}`}
                  stroke="rgba(255,255,255,0.8)" // Brighter base stroke
                  strokeWidth="2"
                  strokeDasharray="6 6"
                  animate={{
                    pathLength: anim.pathLength,
                    opacity: anim.opacity
                  }}
                  transition={{ 
                    duration,
                    times: anim.times,
                    repeat: Infinity,
                    ease: ["linear", "easeInOut", "easeOut", "linear", "easeIn", "linear"]
                  }}
                />
              );
            })}
          </svg>

          {/* Workflow Node Cards */}
          {nodes.map((node) => {
            const anim = getNodeAnimation(node.appearAt, node.activeDuration);
            return (
              <div
                key={node.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 mt-8"
                style={{ left: node.x, top: node.y }}
              >
                <motion.div 
                  className="px-4 py-3 rounded-lg bg-[#050505] border shadow-2xl flex flex-col items-center gap-1 min-w-[120px]"
                  animate={{
                    opacity: anim.opacity,
                    scale: anim.scale,
                    borderColor: anim.borderColor,
                    boxShadow: anim.boxShadow
                  }}
                  transition={{
                    duration,
                    times: anim.times,
                    repeat: Infinity,
                    ease: ["linear", "easeOut", "easeInOut", "linear", "easeIn", "linear"]
                  }}
                >
                  <span className="text-xs font-bold text-white tracking-widest uppercase">{node.label}</span>
                  <span className="text-[10px] font-medium text-white/40">{node.desc}</span>
                </motion.div>
              </div>
            );
          })}
        </motion.div>
      </div>

      {/* Foreground Content */}
      <div className="container relative z-10 mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
          style={{ opacity }}
          className="max-w-5xl mx-auto"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-sm font-medium text-white/80 mb-10 backdrop-blur-md shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:bg-white/10 transition-colors"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            PromptCanvas Version 1
          </motion.div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 mb-8 leading-tight">
            Plan software before <br className="hidden md:block" /> writing code.
          </h1>
          <p className="text-lg md:text-xl text-white/50 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
            PromptCanvas helps founders, developers and product teams transform ideas into structured product blueprints before development begins.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <Button size="lg" className="w-full sm:w-auto px-8 h-12 text-base">Get Started for Free</Button>
            <Button variant="secondary" size="lg" className="w-full sm:w-auto px-8 h-12 text-base backdrop-blur-md">View Documentation</Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

import { AnimatedSection } from "@/components/ui/animated-section";
import { AlertTriangle, Clock, Banknote, ShieldAlert } from "lucide-react";

export function ProblemSection() {
  const problems = [
    {
      icon: <AlertTriangle className="w-5 h-5 text-white/70" />,
      title: "Scope Creep",
      desc: "Without a clear blueprint, features expand endlessly, pushing back launch dates."
    },
    {
      icon: <Clock className="w-5 h-5 text-white/70" />,
      title: "Wasted Time",
      desc: "Building the wrong thing takes months. Planning takes hours."
    },
    {
      icon: <Banknote className="w-5 h-5 text-white/70" />,
      title: "Burned Budgets",
      desc: "Rewriting code because the core requirements weren't defined costs money."
    },
    {
      icon: <ShieldAlert className="w-5 h-5 text-white/70" />,
      title: "Vague Goals",
      desc: "Teams misalign when there isn't a single source of truth for the product."
    }
  ];

  return (
    <AnimatedSection className="bg-[#0A0A0A] border-y border-white/5 relative z-10">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-white mb-4">
            Why software projects fail
          </h2>
          <p className="text-lg text-white/50 max-w-2xl mx-auto">
            Most products don&apos;t fail because of bad code. They fail because of bad planning. Jumping straight into the editor is the most expensive mistake a team can make.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {problems.map((problem, i) => (
            <div key={i} className="flex gap-4 p-6 rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                {problem.icon}
              </div>
              <div>
                <h3 className="text-lg font-medium text-white mb-2">{problem.title}</h3>
                <p className="text-white/50 leading-relaxed">{problem.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
}

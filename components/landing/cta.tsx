import { AnimatedSection } from "@/components/ui/animated-section";
import { Button } from "@/components/ui/button";

export function CTA() {
  return (
    <AnimatedSection className="border-t border-white/5 bg-[#0A0A0A] relative z-10 py-32">
      <div className="container mx-auto px-6 text-center max-w-3xl">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6">
          Ready to build smarter?
        </h2>
        <p className="text-lg text-white/50 mb-10">
          Stop wasting time on feature creep and misaligned goals. Create your first product blueprint today.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" className="w-full sm:w-auto">Get Started for Free</Button>
          <Button variant="ghost" size="lg" className="w-full sm:w-auto">Contact Sales</Button>
        </div>
      </div>
    </AnimatedSection>
  );
}

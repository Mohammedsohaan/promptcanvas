import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#050505] py-12 relative z-10">
      <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-sm" />
          </div>
          <span className="font-semibold text-sm tracking-tight text-white/80">PromptCanvas</span>
        </div>
        
        <div className="flex items-center gap-6 text-sm text-white/40">
          <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
          <Link href="#" className="hover:text-white transition-colors">Terms</Link>
          <Link href="#" className="hover:text-white transition-colors">Twitter</Link>
          <Link href="#" className="hover:text-white transition-colors">GitHub</Link>
        </div>
        
        <div className="text-sm text-white/30">
          &copy; {new Date().getFullYear()} PromptCanvas. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

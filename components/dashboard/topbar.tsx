"use client";

import * as React from "react";
import { Search, Bell, Menu, ChevronRight } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useDashboard } from "./dashboard-context";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export function Topbar() {
  const { setIsMobileOpen, searchQuery, setSearchQuery } = useDashboard();
  const pathname = usePathname();

  // Generate breadcrumbs from pathname
  const breadcrumbs = React.useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    const paths = [];
    
    // Always start with Dashboard
    if (segments[0] === "dashboard") {
      paths.push({ name: "Dashboard", href: "/dashboard" });
      
      if (segments[1] === "products") {
        paths.push({ name: "Products", href: "/dashboard/products" });
        
        if (segments[2]) {
          // Placeholder product name instead of ID
          paths.push({ name: segments[2] === "new" ? "New Product" : "Inventory Management System", href: `/dashboard/products/${segments[2]}` });
        }
      } else if (segments[1]) {
        // Capitalize other sections
        paths.push({ name: segments[1].charAt(0).toUpperCase() + segments[1].slice(1), href: `/dashboard/${segments[1]}` });
      }
    }
    return paths;
  }, [pathname]);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-neutral-800/50 bg-neutral-950/80 px-4 md:px-8 backdrop-blur-md">
      <div className="flex items-center gap-4 flex-1 overflow-hidden">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="md:hidden text-neutral-400 hover:text-neutral-100 transition-colors shrink-0"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </button>
        
        {/* Mobile Logo */}
        <span className="md:hidden text-lg font-bold tracking-tighter text-neutral-100 mr-2 shrink-0">
          PromptCanvas
        </span>

        {/* Desktop Breadcrumbs */}
        <div className="hidden md:flex items-center text-sm whitespace-nowrap">
          <AnimatePresence mode="popLayout">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={crumb.href}>
                <motion.div
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 5 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center"
                >
                  <Link 
                    href={crumb.href}
                    className={`transition-colors hover:text-neutral-100 ${
                      index === breadcrumbs.length - 1 
                        ? "text-neutral-100 font-medium" 
                        : "text-neutral-500"
                    }`}
                  >
                    {crumb.name}
                  </Link>
                </motion.div>
                {index < breadcrumbs.length - 1 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <ChevronRight className="h-4 w-4 text-neutral-600 mx-2" />
                  </motion.div>
                )}
              </React.Fragment>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0 ml-4">
        <div className="relative w-full max-w-[200px] lg:max-w-xs hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
          <Input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 bg-neutral-900/40 border-neutral-800/60 focus-visible:ring-neutral-700 h-9"
          />
        </div>

        <button className="relative p-2 text-neutral-400 hover:text-neutral-100 transition-colors rounded-full hover:bg-neutral-800/50">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-neutral-950" />
        </button>
        <Avatar fallback="JD" />
      </div>
    </header>
  );
}

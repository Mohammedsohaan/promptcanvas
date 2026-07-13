"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  FolderKanban, 
  PlusSquare, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboard } from "./dashboard-context";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Products", href: "/dashboard/products", icon: FolderKanban },
  { name: "New Product", href: "/dashboard/products/new", icon: PlusSquare },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

function SidebarContent({ 
  mobile = false, 
  isCollapsed, 
  pathname, 
  toggleCollapse, 
  setIsMobileOpen 
}: { 
  mobile?: boolean;
  isCollapsed: boolean;
  pathname: string;
  toggleCollapse: () => void;
  setIsMobileOpen: (open: boolean) => void;
}) {
  const collapsed = mobile ? false : isCollapsed;
  return (
    <div className="flex h-full flex-col justify-between py-6">
      <div className="flex flex-col space-y-6 px-4">
        <div className={cn("flex items-center", collapsed ? "justify-center" : "justify-start px-2")}>
          {!collapsed ? (
            <span className="text-xl font-bold tracking-tighter text-neutral-100">
              PromptCanvas
            </span>
          ) : (
            <div className="h-8 w-8 rounded-md bg-neutral-100 flex items-center justify-center">
               <span className="text-neutral-900 font-bold text-sm">P</span>
            </div>
          )}
        </div>
        
        <nav className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/dashboard");
            const isStrictActive = item.href === "/dashboard" ? pathname === "/dashboard" : isActive;

            return (
              <div key={item.name} className="relative group">
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isStrictActive 
                      ? "bg-neutral-800/80 text-neutral-50 shadow-sm" 
                      : "text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-100",
                    collapsed ? "justify-center" : "justify-start"
                  )}
                  onClick={() => mobile && setIsMobileOpen(false)}
                >
                  <item.icon className={cn("h-5 w-5 shrink-0", !collapsed && "mr-3")} />
                  {!collapsed && <span>{item.name}</span>}
                </Link>
                {collapsed && !mobile && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 hidden rounded-md bg-neutral-800 px-2.5 py-1.5 text-xs text-neutral-100 group-hover:block z-50 whitespace-nowrap shadow-lg border border-neutral-700">
                    {item.name}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      <div className="px-4 space-y-2">
        {!mobile && (
          <button
            onClick={toggleCollapse}
            className="flex w-full items-center justify-center rounded-lg p-2.5 text-neutral-500 hover:bg-neutral-800/50 hover:text-neutral-100 transition-colors"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
        )}
        <button className={cn(
            "flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-100 transition-colors",
            collapsed ? "justify-center" : "justify-start"
          )}>
          <LogOut className={cn("h-5 w-5 shrink-0", !collapsed && "mr-3")} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { isMobileOpen, setIsMobileOpen } = useDashboard();
  const [isCollapsed, setIsCollapsed] = React.useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("promptcanvas:sidebar-collapsed");
      return stored ? JSON.parse(stored) : false;
    }
    return false;
  });
  const [mounted, setMounted] = React.useState(false);
  const prevPathnameRef = React.useRef(pathname);

  React.useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  // Auto-collapse when entering a workspace route
  React.useEffect(() => {
    if (!mounted) return;
    
    const isWorkspace = (path: string) => path.startsWith("/dashboard/products/") && path.split("/").length > 3;
    const isEnteringWorkspace = isWorkspace(pathname) && !isWorkspace(prevPathnameRef.current);

    if (isEnteringWorkspace) {
      setIsCollapsed(true);
      localStorage.setItem("promptcanvas:sidebar-collapsed", "true");
    }

    prevPathnameRef.current = pathname;
  }, [pathname, mounted]);

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("promptcanvas:sidebar-collapsed", JSON.stringify(newState));
  };

  if (!mounted) return null;

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 80 : 260 }}
        transition={{ type: "spring", bounce: 0, duration: 0.3 }}
        className="hidden md:flex flex-col border-r border-neutral-800/50 bg-neutral-950 h-screen sticky top-0 shrink-0"
      >
        <SidebarContent 
          isCollapsed={isCollapsed} 
          pathname={pathname} 
          toggleCollapse={toggleCollapse} 
          setIsMobileOpen={setIsMobileOpen} 
        />
      </motion.aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 z-40 bg-neutral-950/80 backdrop-blur-sm md:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-neutral-950 border-r border-neutral-800 md:hidden"
            >
              <SidebarContent 
                mobile 
                isCollapsed={isCollapsed} 
                pathname={pathname} 
                toggleCollapse={toggleCollapse} 
                setIsMobileOpen={setIsMobileOpen} 
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

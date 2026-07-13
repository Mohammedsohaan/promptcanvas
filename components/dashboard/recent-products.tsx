"use client";

import * as React from "react";
import { motion, Variants } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useDashboard } from "./dashboard-context";

const allProducts = [
  { id: 1, name: "Inventory Management System", status: "Planning", progress: 75, updatedAt: "Updated Today" },
  { id: 2, name: "Student Portal", status: "Draft", progress: 20, updatedAt: "Updated Yesterday" },
  { id: 3, name: "Fitness Tracker", status: "Completed", progress: 100, updatedAt: "Updated 3 days ago" },
  { id: 4, name: "CRM Dashboard", status: "Planning", progress: 45, updatedAt: "Updated last week" },
  { id: 5, name: "Expense Manager", status: "Archived", progress: 10, updatedAt: "Updated 2 weeks ago" },
  { id: 6, name: "AI Resume Builder", status: "Draft", progress: 5, updatedAt: "Updated 1 month ago" },
];

export function RecentProducts() {
  const { searchQuery } = useDashboard();
  
  const filteredProducts = React.useMemo(() => {
    if (!searchQuery) return allProducts.slice(0, 4);
    const lowerQuery = searchQuery.toLowerCase();
    return allProducts.filter(p => p.name.toLowerCase().includes(lowerQuery));
  }, [searchQuery]);

  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.3 }
    }
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring", bounce: 0, duration: 0.6 } }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Planning": return <Badge variant="warning">Planning</Badge>;
      case "Completed": return <Badge variant="success">Completed</Badge>;
      case "Archived": return <Badge variant="secondary">Archived</Badge>;
      default: return <Badge variant="outline">Draft</Badge>;
    }
  };

  if (filteredProducts.length === 0) {
    return (
      <div className="text-center py-12 text-neutral-500">
        No products found matching &quot;{searchQuery}&quot;
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-neutral-400">
          {searchQuery ? "Search Results" : "Recent Products"}
        </h2>
        {!searchQuery && (
          <Link href="/dashboard/products" className="text-xs font-medium text-neutral-400 hover:text-neutral-100 transition-colors flex items-center">
            View All <ChevronRight className="h-3 w-3 ml-1" />
          </Link>
        )}
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {filteredProducts.map((product) => (
          <motion.div key={product.id} variants={item} layout>
            <Link href={`/dashboard/products/${product.id}`} className="block group outline-none">
              <Card className="p-5 bg-neutral-900/40 border-neutral-800/60 transition-all duration-300 group-hover:bg-neutral-800/60 group-focus-visible:ring-2 ring-neutral-700">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-semibold text-neutral-100 group-hover:text-emerald-400 transition-colors">{product.name}</h3>
                  {getStatusBadge(product.status)}
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-neutral-400">
                      <span>Progress</span>
                      <span>{product.progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${product.progress === 100 ? 'bg-emerald-500' : 'bg-neutral-100'}`} 
                        style={{ width: `${product.progress}%` }} 
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center text-xs text-neutral-500">
                    <Clock className="h-3 w-3 mr-1.5" />
                    {product.updatedAt}
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

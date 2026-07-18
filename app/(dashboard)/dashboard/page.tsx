import * as React from "react";
import { WelcomeHeader } from "@/components/dashboard/welcome-header";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { RecentProducts } from "@/components/dashboard/recent-products";
import { EmptyState } from "@/components/dashboard/empty-state";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Simulating an active workspace for the shell presentation.
  // In reality, this would check if the user has products.
  const hasProducts = true; 

  return (
    <div className="pb-10 pt-4">
      <WelcomeHeader user={user} />
      
      {hasProducts ? (
        <>
          <StatsCards />
          <QuickActions />
          <RecentProducts />
        </>
      ) : (
        <div className="mt-8">
          <EmptyState />
        </div>
      )}
    </div>
  );
}

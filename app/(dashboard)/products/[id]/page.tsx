import * as React from "react";
import { WorkspaceHeader } from "@/components/workspace/workspace-header";
import { ProgressTracker } from "@/components/workspace/progress-tracker";
import { PlanningCard } from "@/components/workspace/planning-card";
import { ContextPanel } from "@/components/workspace/context-panel";

export default function ProductWorkspacePage() {
  // Using realistic placeholder data
  const planningData = [
    {
      title: "Problem",
      description: "What core problem are you solving for your users?",
      placeholder: "Currently, small retail businesses struggle to track their inventory across multiple storefronts and online channels, leading to frequent stockouts and overselling.",
      isCompleted: true,
    },
    {
      title: "Target Users",
      description: "Who are the primary users of this product?",
      placeholder: "Store managers, warehouse staff, and business owners who need real-time visibility into their stock levels without complex enterprise software.",
      isCompleted: true,
    },
    {
      title: "Goals",
      description: "What are the measurable business goals for this product?",
      placeholder: "Reduce stockouts by 40%, cut down manual inventory counting time by half, and seamlessly integrate with Shopify and physical POS systems.",
      isCompleted: true,
    },
    {
      title: "Core Features",
      description: "What are the essential features required to achieve the goals?",
      placeholder: "Real-time stock syncing, low stock alerts, barcode scanning via mobile app, basic reporting dashboard, and multi-location support.",
      isCompleted: false,
    },
    {
      title: "Minimum Viable Product (MVP)",
      description: "What is the absolute minimum version to prove the concept?",
      placeholder: "A web dashboard that allows manual entry of products, tracks quantities, and provides low stock email alerts. Integrations and mobile scanning deferred to v2.",
      isCompleted: false,
    }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
      <WorkspaceHeader />
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          <ProgressTracker activeStep={3} />
          
          <div className="space-y-6">
            {planningData.map((card, index) => (
              <PlanningCard 
                key={index}
                title={card.title}
                description={card.description}
                placeholder={card.placeholder}
                isCompleted={card.isCompleted}
              />
            ))}
          </div>
        </div>
        
        <div className="xl:col-span-1">
          <ContextPanel />
        </div>
      </div>
    </div>
  );
}

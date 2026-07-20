"use client";

import * as React from "react";
import { useState } from "react";
import { Project } from "@/services/projects";
import { Document } from "@/types/document";
import { WorkflowPlan, WorkflowStep } from "@/services/product-engineer/types";
import { ProductEngineerService } from "@/services/product-engineer/product-engineer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, CheckCircle2, Clock, PlayCircle, AlertCircle, FileText, Send } from "lucide-react";
import { toast } from "sonner";

interface ProductEngineerPanelProps {
  project: Project;
  documents: Document[];
}

export function ProductEngineerPanel({ project, documents }: ProductEngineerPanelProps) {
  const [promptInput, setPromptInput] = useState("");
  const [activePlan, setActivePlan] = useState<WorkflowPlan | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; text: string }>>([
    {
      role: "assistant",
      text: `Hello! I am your AI Product Engineer for ${project.title}. Tell me what you'd like to build, review, or publish, and I will plan and execute the engineering workflow autonomously!`,
    },
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim() || isExecuting) return;

    const userQuery = promptInput.trim();
    setPromptInput("");
    setMessages((prev) => [...prev, { role: "user", text: userQuery }]);
    setIsExecuting(true);

    try {
      // 1. Plan workflow
      const plan = await ProductEngineerService.planWorkflow(userQuery);
      setActivePlan(plan);

      // 2. Stream execution & final response
      let streamText = "";
      const streamGenerator = ProductEngineerService.executeEngineerRequest(
        {
          projectId: project.id,
          prompt: userQuery,
        },
        (createdPlan) => setActivePlan({ ...createdPlan })
      );

      for await (const chunk of streamGenerator) {
        if (chunk.type === "text") {
          streamText += chunk.text;
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: streamText || `Completed ${plan.summary} successfully across ${plan.steps.length} capabilities.`,
        },
      ]);
      toast.success("Workflow executed successfully!");
    } catch (err: any) {
      toast.error(`Workflow execution failed: ${err.message}`);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-neutral-950 text-neutral-100">
      {/* Header */}
      <div className="p-4 border-b border-neutral-800/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-400" />
          <h2 className="text-sm font-semibold text-neutral-100">AI Product Engineer</h2>
        </div>
        <Badge variant="outline" className="text-[10px] border-purple-500/30 text-purple-300">
          Autonomous Orchestration Mode
        </Badge>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Messages */}
        <div className="space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${
                msg.role === "user" ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`max-w-2xl px-4 py-2.5 rounded-xl text-xs leading-relaxed ${
                  msg.role === "user"
                    ? "bg-purple-600 text-white rounded-br-none"
                    : "bg-neutral-900 border border-neutral-800 text-neutral-200 rounded-bl-none"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Live Workflow Timeline */}
        {activePlan && (
          <Card hoverEffect={false} className="p-4 bg-neutral-900/60 border-neutral-800 space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <span className="text-xs font-semibold text-purple-300 uppercase tracking-wider">
                {activePlan.summary}
              </span>
              <Badge variant="outline" className="text-[10px] uppercase font-mono">
                {activePlan.status}
              </Badge>
            </div>

            <div className="space-y-2">
              {activePlan.steps.map((step) => (
                <div key={step.id} className="flex items-center justify-between text-xs py-1 border-b border-neutral-900/80 last:border-0">
                  <div className="flex items-center gap-2">
                    {step.status === "completed" && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />}
                    {step.status === "running" && <PlayCircle className="h-3.5 w-3.5 text-purple-400 animate-spin" />}
                    {step.status === "pending" && <Clock className="h-3.5 w-3.5 text-neutral-500" />}
                    {step.status === "failed" && <AlertCircle className="h-3.5 w-3.5 text-red-400" />}
                    <span className={step.status === "completed" ? "text-neutral-200" : "text-neutral-400"}>
                      {step.description}
                    </span>
                  </div>

                  {step.outputArtifactId && (
                    <Badge variant="secondary" className="text-[10px] bg-neutral-800 text-purple-300 flex items-center gap-1">
                      <FileText className="h-2.5 w-2.5" />
                      Generated Artifact
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Input Console */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-neutral-800/60 bg-neutral-950">
        <div className="relative">
          <input
            type="text"
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
            placeholder="Ask AI Product Engineer to build, review, or plan..."
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-4 pr-12 py-3 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-purple-500/50"
          />
          <Button
            type="submit"
            size="sm"
            disabled={isExecuting || !promptInput.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-purple-600 hover:bg-purple-500 text-white h-8 w-8 p-0 rounded-lg"
          >
            <Send className="h-3.5 w-3.5" />
          </Button>
        </div>
      </form>
    </div>
  );
}

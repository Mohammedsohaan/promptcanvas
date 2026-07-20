"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, FileText, ListChecks, Code2, Database, FlaskConical, Calendar } from "lucide-react";
import { AIActionButton } from "@/components/ai/ai-action-button";
import { Button } from "@/components/ui/button";

interface AIPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onAction?: (actionId: string) => void;
  isGenerating?: boolean;
  onCancel?: () => void;
  elapsedTime?: number;
  currentDocumentType?: string;
}

export function AIPanel({ isOpen, onClose, onAction, isGenerating, onCancel, elapsedTime, currentDocumentType }: AIPanelProps) {
  const actions = [
    {
      id: "prd",
      label: "Generate PRD",
      description: "Create a detailed Product Requirements Document",
      icon: FileText,
    },
    {
      id: "user-stories",
      label: "Generate User Stories",
      description: "Generate user stories with acceptance criteria",
      icon: ListChecks,
    },
    {
      id: "api-spec",
      label: "Generate API Spec",
      description: "Draft RESTful API endpoints and payloads",
      icon: Code2,
    },
    {
      id: "db-schema",
      label: "Generate Database Schema",
      description: "Design PostgreSQL tables, columns, and relations",
      icon: Database,
    },
    {
      id: "test-cases",
      label: "Generate Test Cases",
      description: "Generate functional, negative & API test suites",
      icon: FlaskConical,
    },
    {
      id: "sprint-plan",
      label: "Generate Sprint Plan",
      description: "Transform specifications into an executable backlog",
      icon: Calendar,
    },
  ];

  let filteredActions = actions;
  if (currentDocumentType) {
    switch (currentDocumentType) {
      case "PRD":
        filteredActions = actions.filter(a => a.id === "user-stories");
        break;
      case "USER_STORIES":
        filteredActions = actions.filter(a => a.id === "api-spec");
        break;
      case "API_SPEC":
        filteredActions = actions.filter(a => a.id === "db-schema");
        break;
      case "DATABASE_SCHEMA":
        filteredActions = actions.filter(a => a.id === "test-cases");
        break;
      case "TEST_CASES":
        filteredActions = actions.filter(a => a.id === "sprint-plan");
        break;
      case "SPRINT_PLAN":
        filteredActions = actions.filter(a => a.id === "sprint-plan");
        break;
      default:
        filteredActions = actions;
        break;
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden"
          />

          {/* Slide-in Side Panel */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", bounce: 0, duration: 0.3 }}
            className="fixed right-0 top-0 z-50 h-screen w-80 shrink-0 border-l border-neutral-800/80 bg-neutral-950/95 backdrop-blur-xl p-6 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-6 border-b border-neutral-800/60 mb-6">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900 text-neutral-200">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-neutral-100">
                    AI Assistant
                  </h2>
                  <p className="text-xs text-neutral-500">
                    PromptCanvas Foundation
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Action Buttons List */}
            <div className="space-y-3 flex-1 overflow-y-auto pr-1">
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3 px-1">
                Generative Tools
              </p>

              {filteredActions.length === 0 && (
                <p className="text-xs text-neutral-500 px-1 italic">
                  No recommended next actions available.
                </p>
              )}

              {filteredActions.map((action) => (
                <AIActionButton
                  key={action.id}
                  label={isGenerating ? "Generating..." : action.label}
                  description={action.description}
                  icon={action.icon}
                  disabled={isGenerating}
                  onClick={() => {
                    if (onAction) {
                      onAction(action.id);
                    }
                  }}
                />
              ))}

              {isGenerating && onCancel && (
                <div className="mt-4 pt-4 border-t border-neutral-800/60">
                  <Button 
                    variant="secondary" 
                    className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/10 border-red-500/20"
                    onClick={onCancel}
                  >
                    Cancel Generation
                  </Button>
                </div>
              )}
            </div>

            {/* Panel Footer */}
            <div className="pt-4 border-t border-neutral-800/60 text-center">
              <p className="text-xs text-neutral-500">
                Multi-provider architecture ready
              </p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

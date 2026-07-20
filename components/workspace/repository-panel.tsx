"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import { Project } from "@/services/projects";
import { Document, DocumentType, DocumentFreshness } from "@/types/document";
import { RepositoryIndexService } from "@/services/repository/repository-index";
import { RepositoryAnalysisService } from "@/services/repository/repository-analysis";
import { LocalRepositoryConnector } from "@/services/repository/local-repo-connector";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { FolderGit, RefreshCw, Layers, ShieldAlert, GitCommit, FileCode, CheckCircle } from "lucide-react";
import { DocumentGraph } from "@/services/document-graph";
import { ImpactAnalysisService } from "@/services/impact-analysis";

interface RepositoryPanelProps {
  project: Project;
  documents: Document[];
}

export function RepositoryPanel({ project, documents }: RepositoryPanelProps) {
  const [selectedBranch, setSelectedBranch] = useState("main");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Compute graph & freshness map
  const graph = useMemo(() => new DocumentGraph(documents), [documents]);
  const freshnessMap = useMemo(
    () => ImpactAnalysisService.computeFreshnessMap(documents, graph),
    [documents, graph]
  );

  const index = useMemo(() => {
    return {
      projectId: project.id,
      projectTitle: project.title,
      documents: documents.map((d) => ({
        id: d.id,
        title: d.title,
        type: d.type,
        version: d.version,
        freshness: freshnessMap.get(d.id) || DocumentFreshness.UP_TO_DATE,
        parentDocumentId: d.parentDocumentId,
        childrenIds: graph.getChildren(d.id).map((c) => c.id),
      })),
    };
  }, [project.id, project.title, documents, freshnessMap, graph]);

  // Static mock repository index matching the Local Connector contents
  const repoIndex = useMemo(() => {
    return {
      files: [
        {
          path: "src/index.ts",
          name: "index.ts",
          type: "file" as const,
          size: 1024,
          content: "export function run() { console.log('hello'); }",
          functions: ["run"],
          exports: ["run"],
        },
        {
          path: "supabase/migrations/20260718_init.sql",
          name: "20260718_init.sql",
          type: "file" as const,
          size: 512,
          content: "CREATE TABLE users (id UUID PRIMARY KEY);",
        },
      ],
      classes: [],
      functions: [{ name: "run", type: "function" as const, filePath: "src/index.ts" }],
      exports: ["run"],
      routes: [],
      migrations: ["supabase/migrations/20260718_init.sql"],
    };
  }, []);

  const analysis = useMemo(() => {
    return RepositoryAnalysisService.compute(index, repoIndex);
  }, [index, repoIndex]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-800/60 pb-4">
        <div>
          <h1 className="text-xl font-semibold text-neutral-100 flex items-center gap-2">
            <FolderGit className="h-5 w-5 text-purple-400" />
            Repository Intelligence
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Compare generated specifications with the repository source code to track implementation coverage.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1 text-xs text-neutral-200 focus:outline-none cursor-pointer"
          >
            <option value="main">main</option>
            <option value="dev">dev</option>
          </select>
          <Button
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="text-xs bg-neutral-900 border border-neutral-800 hover:bg-neutral-800"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* 3 Metric Health Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card hoverEffect={false} className="p-4 bg-neutral-900/40 border-neutral-800/60">
          <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1.5 font-semibold">Implementation Coverage</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-neutral-100">{analysis.implementationCoverage}%</span>
            <span className="text-xs text-neutral-500">features coded</span>
          </div>
        </Card>

        <Card hoverEffect={false} className="p-4 bg-neutral-900/40 border-neutral-800/60">
          <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1.5 font-semibold">Specification Coverage</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-neutral-100">{analysis.specificationCoverage}%</span>
            <span className="text-xs text-neutral-500 font-medium">specs implemented</span>
          </div>
        </Card>

        <Card hoverEffect={false} className="p-4 bg-neutral-900/40 border-neutral-800/60">
          <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1.5 font-semibold">Repository Health Score</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-emerald-400">{analysis.healthScore}/100</span>
          </div>
        </Card>
      </div>

      {/* Code vs Specification Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Implemented */}
        <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/20 space-y-3">
          <h3 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle className="h-4 w-4" />
            Implemented Specs ({analysis.implementedRequirements.length})
          </h3>
          {analysis.implementedRequirements.length > 0 ? (
            <ul className="space-y-1.5">
              {analysis.implementedRequirements.map((r) => (
                <li key={r} className="text-xs text-neutral-300 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full" />
                  {r}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-neutral-500 italic">No implemented components found.</p>
          )}
        </div>

        {/* Missing / Drift */}
        <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/20 space-y-3">
          <h3 className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldAlert className="h-4 w-4" />
            Missing / Out-of-Sync Features ({analysis.missingFeatures.length})
          </h3>
          {analysis.missingFeatures.length > 0 ? (
            <ul className="space-y-1.5">
              {analysis.missingFeatures.map((f) => (
                <li key={f} className="text-xs text-neutral-300 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 bg-amber-400 rounded-full" />
                  {f}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-neutral-500 italic">All specifications are fully implemented!</p>
          )}
        </div>
      </div>

      {/* File Structure & Database Drift Alerts */}
      {analysis.databaseDrift.length > 0 && (
        <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 space-y-2 text-xs">
          <h4 className="font-semibold text-red-400 flex items-center gap-1.5">
            <Layers className="h-4 w-4" />
            Database Schema Drift Detected
          </h4>
          <ul className="list-disc list-inside space-y-1 text-neutral-300 text-[11px]">
            {analysis.databaseDrift.map((drift, idx) => (
              <li key={idx}>{drift}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

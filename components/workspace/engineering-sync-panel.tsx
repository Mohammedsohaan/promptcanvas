"use client";

import * as React from "react";
import { useState } from "react";
import { Project } from "@/services/projects";
import { Document, DocumentType } from "@/types/document";
import { syncEngine } from "@/services/integration/sync-engine";
import { ExternalReference, SyncPlatform } from "@/services/integration/connector";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { GitBranch, ExternalLink, RefreshCw, CheckCircle2, AlertTriangle, Layers, Github } from "lucide-react";
import { toast } from "sonner";

interface EngineeringSyncPanelProps {
  project: Project;
  documents: Document[];
}

export function EngineeringSyncPanel({ project, documents }: EngineeringSyncPanelProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<SyncPlatform>("github");
  const [targetRepoOrProject, setTargetRepoOrProject] = useState("my-org/my-project");
  const [syncRefs, setSyncRefs] = useState<Map<string, ExternalReference>>(new Map());
  const [isPublishing, setIsPublishing] = useState(false);

  const exportableDocs = documents.filter(
    (d) =>
      d.type === DocumentType.SPRINT_PLAN ||
      d.type === DocumentType.USER_STORIES ||
      d.type === DocumentType.TEST_CASES ||
      d.type === DocumentType.PRD
  );

  const handlePublish = async (doc: Document) => {
    setIsPublishing(true);
    try {
      const ref = await syncEngine.publishDocument(doc, selectedPlatform, {
        targetProjectOrRepo: targetRepoOrProject,
      });

      setSyncRefs((prev) => new Map(prev).set(doc.id, ref));
      toast.success(`Published ${doc.title} to ${selectedPlatform.toUpperCase()} (${ref.externalKey})`);
    } catch (err: any) {
      toast.error(`Failed to publish: ${err.message}`);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-800/60 pb-4">
        <div>
          <h1 className="text-xl font-semibold text-neutral-100 flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-purple-400" />
            Engineering Sync Hub
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Publish Sprint Plans, User Stories, and Test Suites directly to GitHub and Jira.
          </p>
        </div>
        <Badge variant="outline" className="text-xs border-neutral-800 text-purple-300 font-mono">
          {project.title}
        </Badge>
      </div>

      {/* Configuration Box */}
      <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/40 space-y-4">
        <h3 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
          Connector Configuration
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-neutral-400 block mb-1.5">Platform</label>
            <div className="flex items-center gap-2">
              <Button
                variant={selectedPlatform === "github" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPlatform("github")}
                className="flex-1 text-xs"
              >
                <Github className="h-3.5 w-3.5 mr-1.5" />
                GitHub
              </Button>
              <Button
                variant={selectedPlatform === "jira" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPlatform("jira")}
                className="flex-1 text-xs"
              >
                <Layers className="h-3.5 w-3.5 mr-1.5 text-blue-400" />
                Jira
              </Button>
            </div>
          </div>

          <div>
            <label className="text-xs text-neutral-400 block mb-1.5">
              Target {selectedPlatform === "github" ? "Repository (org/repo)" : "Project Key"}
            </label>
            <input
              type="text"
              value={targetRepoOrProject}
              onChange={(e) => setTargetRepoOrProject(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-purple-500/50"
            />
          </div>
        </div>
      </div>

      {/* Exportable Documents List */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
          Publishable Engineering Artifacts ({exportableDocs.length})
        </h3>

        {exportableDocs.length === 0 ? (
          <p className="text-xs text-neutral-500 italic py-4">
            No publishable documents available in this project yet. Generate a Sprint Plan or User Stories first.
          </p>
        ) : (
          <div className="space-y-3">
            {exportableDocs.map((doc) => {
              const syncRef = syncRefs.get(doc.id);

              return (
                <Card
                  key={doc.id}
                  hoverEffect={false}
                  className="p-4 bg-neutral-900/40 border-neutral-800/80 flex items-center justify-between flex-wrap gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-neutral-200">{doc.title}</span>
                      <Badge variant="outline" className="text-[10px] border-neutral-800 text-neutral-400">
                        {doc.type}
                      </Badge>
                      {syncRef ? (
                        <Badge className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="h-2.5 w-2.5 mr-1" />
                          Synced ({syncRef.externalKey})
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px] bg-neutral-800 text-neutral-400">
                          Not Synced
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-neutral-500 font-mono">v{doc.version} • ID: {doc.id}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {syncRef && (
                      <a
                        href={syncRef.externalUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-purple-400 hover:underline flex items-center gap-1 mr-2"
                      >
                        Open External
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    <Button
                      size="sm"
                      onClick={() => handlePublish(doc)}
                      disabled={isPublishing}
                      className="text-xs bg-purple-600 hover:bg-purple-500 text-white"
                    >
                      <RefreshCw className={`h-3 w-3 mr-1.5 ${isPublishing ? "animate-spin" : ""}`} />
                      {syncRef ? "Sync Changes" : "Publish"}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

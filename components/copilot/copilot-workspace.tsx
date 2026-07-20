"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Sparkles,
  Send,
  Trash2,
  Square,
  ArrowLeft,
  FileText,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  GitBranch,
  Info,
  Check,
  X,
  Cpu,
  Rocket,
  ChevronDown,
  Search,
  Filter,
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Project } from "@/services/projects";
import { Document, DocumentId, DocumentFreshness } from "@/types/document";
import { CopilotMode } from "@/types/ai";
import { useChatSessionStore } from "@/services/chat-session-store";
import { CopilotStreamConsumer } from "@/services/stream-consumer";
import { AIOrchestrator } from "@/services/ai-orchestrator";
import { DocumentGraph } from "@/services/document-graph";
import { ImpactAnalysisService } from "@/services/impact-analysis";
import { TraceabilityContextService, TraceabilityContext } from "@/services/traceability-context";
import { ArchitectureContextService, ArchitectureContext, HealthRating } from "@/services/architecture-context";
import { ReleaseContextService, ReleaseContext, ReleaseStatus } from "@/services/release-context";
import { RetrievalMode } from "@/services/retrieval-strategy";
import { DocumentReference } from "@/lib/reference-parser";

interface CopilotWorkspaceProps {
  project: Project;
  documents: Document[];
}

const SUGGESTED_QUESTIONS = [
  "Summarize this project.",
  "What features are still missing?",
  "Explain authentication.",
  "Which APIs use JWT?",
  "Which user stories have no API?",
  "Which database tables support Orders?",
  "Which documents are outdated?",
  "What changed recently?",
  "Which requirements are inconsistent?",
  "Explain the dependency chain for authentication.",
];

export function CopilotWorkspace({ project, documents }: CopilotWorkspaceProps) {
  const router = useRouter();
  const [inputQuery, setInputQuery] = React.useState("");
  const [retrievalMode, setRetrievalMode] = React.useState<RetrievalMode>("hybrid");
  const [showReleaseDetails, setShowReleaseDetails] = React.useState(false);

  const chatStore = useChatSessionStore();
  const orchestratorRef = React.useRef<AIOrchestrator | null>(null);

  // Compute graph & freshness map for rendering
  const graph = React.useMemo(() => new DocumentGraph(documents), [documents]);
  const freshnessMap = React.useMemo(
    () => ImpactAnalysisService.computeFreshnessMap(documents, graph),
    [documents, graph]
  );

  const docMap = React.useMemo(() => {
    const map = new Map<DocumentId, Document>();
    documents.forEach((doc) => map.set(doc.id, doc));
    return map;
  }, [documents]);

  // Compute deterministic index
  const index = React.useMemo(() => {
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

  // Traceability, Architecture, and Release Contexts
  const traceabilityContext = React.useMemo<TraceabilityContext>(
    () => TraceabilityContextService.compute(index, graph),
    [index, graph]
  );

  const architectureContext = React.useMemo<ArchitectureContext>(
    () => ArchitectureContextService.compute(index, graph),
    [index, graph]
  );

  const releaseContext = React.useMemo<ReleaseContext>(
    () => ReleaseContextService.compute(index, graph),
    [index, graph]
  );

  const handleSendQuestion = async (questionText?: string, targetMode?: CopilotMode) => {
    const query = questionText || inputQuery;
    if (!query.trim() || chatStore.streamingState === "streaming") return;

    const activeMode = targetMode || chatStore.mode;
    if (targetMode) {
      chatStore.setMode(targetMode);
    }

    // Add user message to session history
    chatStore.addMessage({
      role: "user",
      content: query.trim(),
    });
    setInputQuery("");
    chatStore.startStreaming();

    // Instantiate CopilotStreamConsumer
    const consumer = new CopilotStreamConsumer({
      onChunk: (text) => chatStore.appendStreamingChunk(text),
      onComplete: () => chatStore.completeStreaming(),
      onError: (err) => chatStore.failStreaming(err.message),
    });

    orchestratorRef.current = new AIOrchestrator({
      projectId: project.id,
      onStateChange: (state) => chatStore.setStreamingState(state),
      consumer,
    });

    // Pass conversation history and retrieval mode
    const historyPayload = chatStore.messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    await orchestratorRef.current.startGeneration("copilot", {
      question: query.trim(),
      history: historyPayload,
      mode: activeMode,
      retrievalMode,
    });
  };

  const handleRunConsistencyAnalysis = () => {
    handleSendQuestion(
      "Run a comprehensive project consistency analysis across all documents, detecting missing APIs, orphan documents, traceability gaps, version mismatches, and freshness issues.",
      CopilotMode.REVIEWER
    );
  };

  const handleRunTraceabilityAnalysis = () => {
    handleSendQuestion(
      "Analyze requirement traceability across the entire project, evaluating requirement chains from PRDs to User Stories, API Specs, and Database Schemas.",
      CopilotMode.TRACEABILITY
    );
  };

  const handleRunArchitectureReview = () => {
    handleSendQuestion(
      "Review the overall software architecture and identify production risks.",
      CopilotMode.ARCHITECT
    );
  };

  const handleRunReleaseReadiness = () => {
    handleSendQuestion(
      "Evaluate whether this project is ready for implementation or production deployment.",
      CopilotMode.RELEASE
    );
  };

  const handleCancel = () => {
    if (orchestratorRef.current) {
      orchestratorRef.current.cancel();
    }
  };

  const getDocIcon = (iconName: string) => {
    const Icon = (
      LucideIcons as unknown as Record<
        string,
        React.ComponentType<{ className?: string }>
      >
    )[iconName] || FileText;
    return <Icon className="h-4 w-4 text-purple-400" />;
  };

  const getHealthBadge = (rating: HealthRating) => {
    const colors: Record<HealthRating, string> = {
      Excellent: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
      Good: "bg-blue-500/15 text-blue-400 border-blue-500/30",
      "Needs Attention": "bg-amber-500/15 text-amber-400 border-amber-500/30",
      Critical: "bg-red-500/15 text-red-400 border-red-500/30",
    };
    return (
      <Badge className={`text-[10px] border ${colors[rating]}`}>
        {rating}
      </Badge>
    );
  };

  const getReleaseStatusBadge = (status: ReleaseStatus) => {
    const colors: Record<ReleaseStatus, string> = {
      Ready: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
      "Nearly Ready": "bg-blue-500/20 text-blue-300 border-blue-500/40",
      "Needs Work": "bg-amber-500/20 text-amber-300 border-amber-500/40",
      "Not Ready": "bg-red-500/20 text-red-300 border-red-500/40",
    };
    return (
      <Badge className={`text-xs px-2.5 py-0.5 border font-semibold ${colors[status]}`}>
        {status}
      </Badge>
    );
  };

  // Collect references from active streaming OR latest message
  const displayReferences: DocumentReference[] = React.useMemo(() => {
    if (chatStore.activeReferences.length > 0) {
      return chatStore.activeReferences;
    }
    const lastAssistantMsg = [...chatStore.messages]
      .reverse()
      .find((m) => m.role === "assistant" && m.references && m.references.length > 0);
    return lastAssistantMsg?.references || [];
  }, [chatStore.activeReferences, chatStore.messages]);

  const isStreaming = chatStore.streamingState === "streaming" || chatStore.streamingState === "starting";

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-neutral-950">
      {/* LEFT COLUMN: Conversation Workspace */}
      <main className="flex-1 flex flex-col h-full overflow-hidden border-r border-neutral-800/50">
        {/* Workspace Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-neutral-800/50 bg-neutral-950/60 backdrop-blur-sm flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <Link
              href={`/projects/${project.id}`}
              className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-200 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Overview</span>
            </Link>
            <span className="text-neutral-700">|</span>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-400" />
              <h1 className="text-sm font-semibold text-neutral-100">
                AI Project Copilot
              </h1>
              <Badge variant="outline" className="text-[10px] border-neutral-800 text-neutral-400">
                {project.title}
              </Badge>
              {chatStore.mode === CopilotMode.REVIEWER && (
                <Badge className="text-[10px] bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  <ShieldCheck className="h-3 w-3 mr-1" />
                  Reviewer Mode
                </Badge>
              )}
              {chatStore.mode === CopilotMode.TRACEABILITY && (
                <Badge className="text-[10px] bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                  <GitBranch className="h-3 w-3 mr-1" />
                  Traceability Mode
                </Badge>
              )}
              {chatStore.mode === CopilotMode.ARCHITECT && (
                <Badge className="text-[10px] bg-purple-500/15 text-purple-300 border border-purple-500/30">
                  <Cpu className="h-3 w-3 mr-1" />
                  Architect Mode
                </Badge>
              )}
              {chatStore.mode === CopilotMode.RELEASE && (
                <Badge className="text-[10px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  <Rocket className="h-3 w-3 mr-1" />
                  Release Mode
                </Badge>
              )}
              {chatStore.mode === CopilotMode.GENERAL && (
                <Badge variant="secondary" className="text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  General Mode
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Retrieval Strategy Selector Dropdown */}
            <div className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 rounded-lg px-2 py-1 text-xs">
              <Filter className="h-3 w-3 text-purple-400" />
              <span className="text-[10px] text-neutral-400 font-medium">Retrieval:</span>
              <select
                value={retrievalMode}
                onChange={(e) => setRetrievalMode(e.target.value as RetrievalMode)}
                disabled={isStreaming}
                className="bg-transparent text-xs text-neutral-200 focus:outline-none cursor-pointer"
              >
                <option value="hybrid" className="bg-neutral-900 text-neutral-100">
                  Hybrid (Vector + Keyword)
                </option>
                <option value="semantic" className="bg-neutral-900 text-neutral-100">
                  Semantic (Vector Embeddings)
                </option>
                <option value="keyword" className="bg-neutral-900 text-neutral-100">
                  Keyword (BM25 Index)
                </option>
              </select>
            </div>

            <Button
              onClick={handleRunConsistencyAnalysis}
              disabled={isStreaming}
              size="sm"
              className="h-8 px-2.5 text-xs bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-colors"
            >
              <ShieldCheck className="h-3.5 w-3.5 mr-1 text-amber-400" />
              Consistency
            </Button>

            <Button
              onClick={handleRunTraceabilityAnalysis}
              disabled={isStreaming}
              size="sm"
              className="h-8 px-2.5 text-xs bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 transition-colors"
            >
              <GitBranch className="h-3.5 w-3.5 mr-1 text-cyan-400" />
              Traceability
            </Button>

            <Button
              onClick={handleRunArchitectureReview}
              disabled={isStreaming}
              size="sm"
              className="h-8 px-2.5 text-xs bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 transition-colors"
            >
              <Cpu className="h-3.5 w-3.5 mr-1 text-purple-400" />
              Architecture
            </Button>

            <Button
              onClick={handleRunReleaseReadiness}
              disabled={isStreaming}
              size="sm"
              className="h-8 px-2.5 text-xs bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 transition-colors"
            >
              <Rocket className="h-3.5 w-3.5 mr-1 text-emerald-400" />
              Release Readiness
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                chatStore.setMode(CopilotMode.GENERAL);
                chatStore.clearConversation();
              }}
              disabled={isStreaming || chatStore.messages.length === 0}
              className="h-8 px-2 text-xs text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Conversation Message List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {chatStore.messages.length === 0 && (
            <div className="max-w-2xl mx-auto py-4">
              <div className="text-center mb-6">
                <div className="h-12 w-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-4 text-purple-400">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-semibold text-neutral-100 mb-2">
                  Ask anything or evaluate production release readiness
                </h2>
                <p className="text-sm text-neutral-400">
                  The AI Copilot evaluates PRDs, User Stories, API Specs, and Database Schemas using complete project graph context and pluggable vector retrieval.
                </p>
              </div>

              {/* Action Banner Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-semibold text-amber-300 flex items-center gap-1 mb-1">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Consistency
                    </h3>
                    <p className="text-[11px] text-neutral-400">
                      Detect missing APIs & orphan specs.
                    </p>
                  </div>
                  <Button
                    onClick={handleRunConsistencyAnalysis}
                    disabled={isStreaming}
                    size="sm"
                    className="mt-3 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold text-xs w-full h-7"
                  >
                    Analyze
                  </Button>
                </div>

                <div className="p-3.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-semibold text-cyan-300 flex items-center gap-1 mb-1">
                      <GitBranch className="h-3.5 w-3.5" />
                      Traceability
                    </h3>
                    <p className="text-[11px] text-neutral-400">
                      Trace PRD → Story → API → DB.
                    </p>
                  </div>
                  <Button
                    onClick={handleRunTraceabilityAnalysis}
                    disabled={isStreaming}
                    size="sm"
                    className="mt-3 bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-semibold text-xs w-full h-7"
                  >
                    Trace
                  </Button>
                </div>

                <div className="p-3.5 rounded-xl border border-purple-500/30 bg-purple-500/10 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-semibold text-purple-300 flex items-center gap-1 mb-1">
                      <Cpu className="h-3.5 w-3.5" />
                      Architecture
                    </h3>
                    <p className="text-[11px] text-neutral-400">
                      Scalability, security & tech debt.
                    </p>
                  </div>
                  <Button
                    onClick={handleRunArchitectureReview}
                    disabled={isStreaming}
                    size="sm"
                    className="mt-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs w-full h-7"
                  >
                    Review
                  </Button>
                </div>

                <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-semibold text-emerald-300 flex items-center gap-1 mb-1">
                      <Rocket className="h-3.5 w-3.5" />
                      Release Readiness
                    </h3>
                    <p className="text-[11px] text-neutral-400">
                      Aggregated production readiness decision.
                    </p>
                  </div>
                  <Button
                    onClick={handleRunReleaseReadiness}
                    disabled={isStreaming}
                    size="sm"
                    className="mt-3 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-semibold text-xs w-full h-7"
                  >
                    Evaluate
                  </Button>
                </div>
              </div>

              {/* Suggested Questions Grid */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider px-1">
                  Suggested Questions
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {SUGGESTED_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => handleSendQuestion(q, CopilotMode.GENERAL)}
                      className="flex items-center justify-between p-3 rounded-xl border border-neutral-800/80 bg-neutral-900/40 hover:bg-neutral-900/80 hover:border-neutral-700/80 text-left text-xs text-neutral-300 transition-all group"
                    >
                      <span className="truncate pr-2">{q}</span>
                      <ChevronRight className="h-3.5 w-3.5 text-neutral-600 group-hover:text-neutral-300 group-hover:translate-x-0.5 transition-all shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {chatStore.messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-3xl rounded-2xl p-4 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-purple-600/80 text-white rounded-br-none"
                    : "bg-neutral-900/60 border border-neutral-800/60 text-neutral-200 rounded-bl-none"
                }`}
              >
                <div className="font-mono text-[10px] text-neutral-400 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                  {msg.role === "user" ? (
                    "You"
                  ) : (
                    <>
                      <Sparkles className="h-3 w-3 text-purple-400" />
                      {chatStore.mode === CopilotMode.REVIEWER
                        ? "Consistency Analyzer"
                        : chatStore.mode === CopilotMode.TRACEABILITY
                        ? "Traceability Engine"
                        : chatStore.mode === CopilotMode.ARCHITECT
                        ? "Architect Engine"
                        : chatStore.mode === CopilotMode.RELEASE
                        ? "Release Readiness Engine"
                        : "Copilot"}
                    </>
                  )}
                </div>
                <div className="whitespace-pre-wrap font-sans">{msg.content}</div>
              </div>
            </motion.div>
          ))}

          {/* Streaming In-Progress Preview */}
          {isStreaming && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="max-w-3xl w-full rounded-2xl p-4 text-sm bg-neutral-900/60 border border-purple-500/30 text-neutral-200 rounded-bl-none relative overflow-hidden">
                <div className="flex items-center justify-between mb-2 text-purple-400">
                  <div className="flex items-center gap-2 text-xs font-medium">
                    <Sparkles className="h-3.5 w-3.5 animate-spin" />
                    {chatStore.mode === CopilotMode.REVIEWER
                      ? "Evaluating project graph consistency..."
                      : chatStore.mode === CopilotMode.TRACEABILITY
                      ? "Tracing requirements across PRD → Stories → API → DB..."
                      : chatStore.mode === CopilotMode.ARCHITECT
                      ? "Evaluating production readiness, scalability & security..."
                      : chatStore.mode === CopilotMode.RELEASE
                      ? "Aggregating consistency, traceability & architecture into release decision..."
                      : `Retrieving context via ${retrievalMode.toUpperCase()} strategy & reasoning...`}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancel}
                    className="h-6 px-2 text-[10px] text-red-400 hover:bg-red-500/10"
                  >
                    <Square className="h-2.5 w-2.5 mr-1 fill-current" />
                    Cancel
                  </Button>
                </div>
                <div className="whitespace-pre-wrap font-mono text-xs text-neutral-300">
                  {chatStore.streamingBuffer}
                  <span className="inline-block w-2 h-4 ml-1 bg-purple-400 animate-pulse align-middle" />
                </div>
              </div>
            </motion.div>
          )}

          {/* Release Dashboard Panel */}
          {(chatStore.mode === CopilotMode.RELEASE ||
            releaseContext.projectScore > 0) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 pt-6 border-t border-neutral-800/60 space-y-4"
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Rocket className="h-4 w-4 text-emerald-400" />
                  <h3 className="text-sm font-semibold text-neutral-100">
                    Production Release Readiness Dashboard
                  </h3>
                  {getReleaseStatusBadge(releaseContext.status)}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] border-neutral-800 text-emerald-300 font-mono">
                    Overall Readiness: {releaseContext.projectScore}%
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowReleaseDetails(!showReleaseDetails)}
                    className="h-6 px-2 text-[10px] text-neutral-400 hover:text-neutral-200"
                  >
                    {showReleaseDetails ? "Hide Release Summary" : "Expand Release Summary"}
                    <ChevronDown className={`h-3 w-3 ml-1 transition-transform ${showReleaseDetails ? "rotate-180" : ""}`} />
                  </Button>
                </div>
              </div>

              {/* 6 Sub-Score Health Cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
                <Card hoverEffect={false} className="p-3 bg-neutral-900/40 border-neutral-800/60 text-center">
                  <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1">Consistency</p>
                  {getHealthBadge(releaseContext.stats.consistency)}
                </Card>
                <Card hoverEffect={false} className="p-3 bg-neutral-900/40 border-neutral-800/60 text-center">
                  <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1">Traceability</p>
                  {getHealthBadge(releaseContext.stats.traceability)}
                </Card>
                <Card hoverEffect={false} className="p-3 bg-neutral-900/40 border-neutral-800/60 text-center">
                  <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1">Architecture</p>
                  {getHealthBadge(releaseContext.stats.architecture)}
                </Card>
                <Card hoverEffect={false} className="p-3 bg-neutral-900/40 border-neutral-800/60 text-center">
                  <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1">Documentation</p>
                  {getHealthBadge(releaseContext.stats.documentation)}
                </Card>
                <Card hoverEffect={false} className="p-3 bg-neutral-900/40 border-neutral-800/60 text-center">
                  <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1">Freshness</p>
                  {getHealthBadge(releaseContext.stats.freshness)}
                </Card>
                <Card hoverEffect={false} className="p-3 bg-neutral-900/40 border-neutral-800/60 text-center">
                  <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1">Deployment</p>
                  {getHealthBadge(releaseContext.stats.deploymentReadiness)}
                </Card>
              </div>

              {/* Expandable Supporting Metrics */}
              {showReleaseDetails && (
                <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/30 space-y-3 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="font-semibold text-emerald-300 block mb-1">Ready Components ({releaseContext.readyComponents.length})</span>
                      {releaseContext.readyComponents.length > 0 ? (
                        <ul className="space-y-1 text-neutral-300 text-[11px] list-disc list-inside">
                          {releaseContext.readyComponents.map((c) => (
                            <li key={c}>{c}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-[11px] text-neutral-500 italic">No fully ready components yet.</p>
                      )}
                    </div>

                    <div>
                      <span className="font-semibold text-red-400 block mb-1">Critical Blockers ({releaseContext.criticalIssues.length})</span>
                      {releaseContext.criticalIssues.length > 0 ? (
                        <ul className="space-y-1 text-neutral-300 text-[11px] list-disc list-inside">
                          {releaseContext.criticalIssues.map((issue, idx) => (
                            <li key={idx} className="text-red-300">
                              {issue.description}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-[11px] text-neutral-500 italic">Zero critical blockers detected.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Architecture Dashboard Panel */}
          {(chatStore.mode === CopilotMode.ARCHITECT ||
            architectureContext.serviceCount > 0) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 pt-6 border-t border-neutral-800/60 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-purple-400" />
                  <h3 className="text-sm font-semibold text-neutral-100">
                    Production Architecture Health Dashboard
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] border-neutral-800 text-purple-300">
                    Overall Score: {architectureContext.stats.overallScore}/100
                  </Badge>
                </div>
              </div>

              {/* 7 Metric Health Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
                <Card hoverEffect={false} className="p-3 bg-neutral-900/40 border-neutral-800/60 text-center">
                  <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1">Architecture</p>
                  {getHealthBadge(architectureContext.stats.architectureQuality)}
                </Card>
                <Card hoverEffect={false} className="p-3 bg-neutral-900/40 border-neutral-800/60 text-center">
                  <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1">Scalability</p>
                  {getHealthBadge(architectureContext.stats.scalability)}
                </Card>
                <Card hoverEffect={false} className="p-3 bg-neutral-900/40 border-neutral-800/60 text-center">
                  <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1">Security</p>
                  {getHealthBadge(architectureContext.stats.security)}
                </Card>
                <Card hoverEffect={false} className="p-3 bg-neutral-900/40 border-neutral-800/60 text-center">
                  <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1">Maintainability</p>
                  {getHealthBadge(architectureContext.stats.maintainability)}
                </Card>
                <Card hoverEffect={false} className="p-3 bg-neutral-900/40 border-neutral-800/60 text-center">
                  <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1">Performance</p>
                  {getHealthBadge(architectureContext.stats.performance)}
                </Card>
                <Card hoverEffect={false} className="p-3 bg-neutral-900/40 border-neutral-800/60 text-center">
                  <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1">Tech Debt</p>
                  {getHealthBadge(architectureContext.stats.technicalDebt)}
                </Card>
                <Card hoverEffect={false} className="p-3 bg-neutral-900/40 border-neutral-800/60 text-center">
                  <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1">Readiness</p>
                  {getHealthBadge(architectureContext.stats.deploymentReadiness)}
                </Card>
              </div>
            </motion.div>
          )}

          {/* Traceability Chains Visualization Panel */}
          {(chatStore.mode === CopilotMode.TRACEABILITY ||
            traceabilityContext.chains.length > 0) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 pt-6 border-t border-neutral-800/60"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <GitBranch className="h-4 w-4 text-cyan-400" />
                  <h3 className="text-sm font-semibold text-neutral-100">
                    Requirement Traceability Chains
                  </h3>
                  <Badge variant="outline" className="text-[10px] border-neutral-800 text-neutral-300">
                    Coverage: {traceabilityContext.overallCoverage}%
                  </Badge>
                </div>
              </div>

              <div className="space-y-3">
                {traceabilityContext.chains.map((chain) => (
                  <Card
                    key={chain.id}
                    hoverEffect={false}
                    className="p-4 bg-neutral-900/50 border-neutral-800/80 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-neutral-200">
                        {chain.title}
                      </span>
                      <div className="flex items-center gap-2">
                        <Badge
                          className={`text-[10px] ${
                            chain.status === "Complete"
                              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                              : chain.status === "Partial"
                              ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                              : "bg-red-500/15 text-red-400 border border-red-500/30"
                          }`}
                        >
                          {chain.status} ({chain.coveragePercentage}%)
                        </Badge>
                      </div>
                    </div>

                    {/* Pipeline Stage Nodes */}
                    <div className="flex items-center gap-2 flex-wrap pt-1">
                      {/* PRD Stage */}
                      <span
                        onClick={() =>
                          chain.prdNode &&
                          router.push(`/projects/${project.id}/documents/${chain.prdNode.documentId}`)
                        }
                        className={`text-xs px-2.5 py-1 rounded-md border flex items-center gap-1.5 cursor-pointer transition-all ${
                          chain.prdNode
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20"
                            : "bg-neutral-900 border-neutral-800 text-neutral-600 cursor-not-allowed"
                        }`}
                      >
                        {chain.prdNode ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                        PRD
                      </span>

                      <ChevronRight className="h-3 w-3 text-neutral-600" />

                      {/* User Story Stage */}
                      <span
                        onClick={() =>
                          chain.userStoryNode &&
                          router.push(`/projects/${project.id}/documents/${chain.userStoryNode.documentId}`)
                        }
                        className={`text-xs px-2.5 py-1 rounded-md border flex items-center gap-1.5 cursor-pointer transition-all ${
                          chain.userStoryNode
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20"
                            : "bg-neutral-900 border-neutral-800 text-neutral-600 cursor-not-allowed"
                        }`}
                      >
                        {chain.userStoryNode ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                        User Story
                      </span>

                      <ChevronRight className="h-3 w-3 text-neutral-600" />

                      {/* API Spec Stage */}
                      <span
                        onClick={() =>
                          chain.apiSpecNode &&
                          router.push(`/projects/${project.id}/documents/${chain.apiSpecNode.documentId}`)
                        }
                        className={`text-xs px-2.5 py-1 rounded-md border flex items-center gap-1.5 cursor-pointer transition-all ${
                          chain.apiSpecNode
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20"
                            : "bg-neutral-900 border-neutral-800 text-neutral-600 cursor-not-allowed"
                        }`}
                      >
                        {chain.apiSpecNode ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                        API Spec
                      </span>

                      <ChevronRight className="h-3 w-3 text-neutral-600" />

                      {/* DB Schema Stage */}
                      <span
                        onClick={() =>
                          chain.dbSchemaNode &&
                          router.push(`/projects/${project.id}/documents/${chain.dbSchemaNode.documentId}`)
                        }
                        className={`text-xs px-2.5 py-1 rounded-md border flex items-center gap-1.5 cursor-pointer transition-all ${
                          chain.dbSchemaNode
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20"
                            : "bg-neutral-900 border-neutral-800 text-neutral-600 cursor-not-allowed"
                        }`}
                      >
                        {chain.dbSchemaNode ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                        DB Schema
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Input Box Area */}
        <div className="p-4 border-t border-neutral-800/50 bg-neutral-950/80 backdrop-blur-sm">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendQuestion();
            }}
            className="flex items-center gap-2 max-w-4xl mx-auto"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask a project-wide question..."
              disabled={isStreaming}
              className="flex-1 bg-neutral-900/80 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all disabled:opacity-50"
            />
            {isStreaming ? (
              <Button
                type="button"
                onClick={handleCancel}
                variant="secondary"
                className="h-11 px-4 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10"
              >
                <Square className="h-4 w-4 fill-current" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={!inputQuery.trim()}
                className="h-11 px-5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white transition-all disabled:opacity-40"
              >
                <Send className="h-4 w-4 mr-1.5" />
                Ask
              </Button>
            )}
          </form>
        </div>
      </main>

      {/* RIGHT COLUMN: Referenced Documents Panel */}
      <aside className="hidden xl:flex w-80 shrink-0 flex-col border-l border-neutral-800/50 bg-neutral-950/40 backdrop-blur-sm h-full p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5 text-purple-400" />
            Referenced Documents
          </h3>
          <Badge variant="outline" className="text-[10px] border-neutral-800 text-neutral-400">
            {displayReferences.length}
          </Badge>
        </div>

        {displayReferences.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center border border-dashed border-neutral-800/80 rounded-xl bg-neutral-900/20">
            <Info className="h-6 w-6 text-neutral-600 mb-2" />
            <p className="text-xs text-neutral-500">
              No documents referenced in current answer yet. Ask a question or run release readiness analysis to see related graph documents.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayReferences.map((ref) => {
              const doc = docMap.get(ref.id);
              const freshness = freshnessMap.get(ref.id);
              const parentDoc = doc?.parentDocumentId ? docMap.get(doc.parentDocumentId) : null;

              return (
                <Card
                  key={ref.id}
                  hoverEffect={false}
                  onClick={() => router.push(`/projects/${project.id}/documents/${ref.id}`)}
                  className="p-3.5 bg-neutral-900/40 border-neutral-800/60 hover:border-purple-500/40 cursor-pointer transition-all group"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {getDocIcon(doc?.icon || "FileText")}
                      <h4 className="text-xs font-semibold text-neutral-200 group-hover:text-purple-300 transition-colors truncate">
                        {doc?.title || `Document ${ref.id}`}
                      </h4>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-neutral-600 group-hover:text-neutral-300 group-hover:translate-x-0.5 transition-transform shrink-0" />
                  </div>

                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <Badge variant="outline" className="text-[10px] border-neutral-800 text-neutral-400">
                      {doc?.type || "Custom"}
                    </Badge>

                    {doc && (
                      <span className="text-[10px] text-neutral-500 font-mono">
                        v{doc.version}
                      </span>
                    )}

                    {freshness === DocumentFreshness.OUTDATED ? (
                      <Badge className="text-[10px] bg-amber-500/15 text-amber-400 border border-amber-500/30">
                        <AlertTriangle className="h-2.5 w-2.5 mr-0.5" />
                        Outdated
                      </Badge>
                    ) : (
                      <Badge className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />
                        Up to Date
                      </Badge>
                    )}

                    <Badge className="text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      {ref.confidence}
                    </Badge>
                  </div>

                  {parentDoc && (
                    <p className="text-[10px] text-neutral-500 mb-2 truncate">
                      Parent: <span className="text-neutral-400">{parentDoc.title}</span>
                    </p>
                  )}

                  <p className="text-[11px] text-neutral-400 italic bg-neutral-950/40 p-2 rounded border border-neutral-800/40">
                    "{ref.reason}"
                  </p>
                </Card>
              );
            })}
          </div>
        )}
      </aside>
    </div>
  );
}

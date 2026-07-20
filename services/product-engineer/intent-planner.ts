import { IntentType } from "./types";

/**
 * IntentPlanner analyzes user goals to classify engineering intent:
 * generation | review | planning | repository_analysis | sync | mixed
 */
export class IntentPlanner {
  public static classify(userPrompt: string): IntentType {
    const prompt = userPrompt.toLowerCase();

    const isGeneration =
      prompt.includes("generate") ||
      prompt.includes("create") ||
      prompt.includes("build") ||
      prompt.includes("write");

    const isReview =
      prompt.includes("review") ||
      prompt.includes("analyze") ||
      prompt.includes("check") ||
      prompt.includes("audit") ||
      prompt.includes("consistency") ||
      prompt.includes("traceability") ||
      prompt.includes("architecture");

    const isPlanning =
      prompt.includes("sprint") ||
      prompt.includes("plan") ||
      prompt.includes("roadmap") ||
      prompt.includes("backlog");

    const isRepo =
      prompt.includes("repo") ||
      prompt.includes("repository") ||
      prompt.includes("code drift") ||
      prompt.includes("implementation review");

    const isSync =
      prompt.includes("sync") ||
      prompt.includes("github") ||
      prompt.includes("jira") ||
      prompt.includes("publish");

    // Check multiple artifact types requested in single prompt
    const artifactCount =
      (prompt.includes("prd") ? 1 : 0) +
      (prompt.includes("story") || prompt.includes("stories") ? 1 : 0) +
      (prompt.includes("api") ? 1 : 0) +
      (prompt.includes("db") || prompt.includes("schema") ? 1 : 0) +
      (prompt.includes("test") ? 1 : 0);

    if (artifactCount > 1) return "mixed";
    if (isRepo) return "repository_analysis";
    if (isSync) return "sync";
    if (isPlanning) return "planning";
    if (isReview) return "review";
    if (isGeneration) return "generation";

    return "generation";
  }
}

export type ReviewDecision = "approve" | "request_changes" | "comment" | "neutral";

export interface ReviewRecommendation {
  decision: ReviewDecision;
  reason: string;
  blockers: string[];
  warnings: string[];
  nextActions: string[];
}

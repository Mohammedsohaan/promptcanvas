export interface PromptContext {
  projectTitle: string;
  projectDescription?: string;
  documentTitle?: string;
  documentContent?: string;
  additionalInstructions?: string;
}

import { AIContext } from "@/services/ai-context";
import { AIJobType } from "@/types/ai";

export interface PromptInput {
  context: AIContext;
  jobType: AIJobType;
}

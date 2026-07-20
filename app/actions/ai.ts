"use server";

import { createClient } from "@/lib/supabase/server";
import { generatePRD as aiGeneratePRD } from "@/services/ai-job";

export async function generatePRDAction(projectId: string, documentId: string, projectTitle: string, projectDescription: string, documentTitle: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const response = await aiGeneratePRD({
    context: {
      projectTitle,
      projectDescription,
      documentTitle,
    },
  });

  if (!response || !response.text) {
    throw new Error("Failed to generate PRD");
  }

  return response.text;
}

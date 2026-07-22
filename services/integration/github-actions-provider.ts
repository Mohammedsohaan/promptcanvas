import { PipelineProvider } from "./pipeline-provider";
import { PipelineModel } from "../../types/pipeline";

export class GitHubActionsProvider implements PipelineProvider {
  name(): string {
    return "GitHubActions";
  }

  async fetchPipelineRun(repoId: string, runId: string, credentials?: Record<string, any>): Promise<PipelineModel> {
    // In a real implementation this fetches from the GitHub Actions API.
    // For architecture compliance, return normalized dummy data.
    return {
      id: `gh-run-${runId}`,
      provider: this.name(),
      workflow: "CI/CD Pipeline",
      trigger: "push",
      status: "success",
      branch: "main",
      commit: "abcdef123",
      duration: 120000,
      queueTime: 5000,
      stages: [
        {
          name: "Build",
          status: "success",
          duration: 45000,
          retryCount: 0,
          parallel: false,
          logs: "Build successful",
        },
        {
          name: "Test",
          status: "success",
          duration: 75000,
          retryCount: 0,
          parallel: true,
          logs: "All tests passed",
        }
      ],
      artifacts: [],
      deployments: [],
      history: [
        { runId: "prev-1", status: "success", duration: 115000, date: new Date().toISOString() }
      ]
    };
  }
}

import { PullRequestProvider } from "./pull-request-provider";
import { RepositoryDiff } from "../../types/repository-diff";

export class GitHubProvider implements PullRequestProvider {
  name(): string {
    return "GitHub";
  }

  async fetchPullRequest(repoId: string, prId: string, credentials?: Record<string, any>): Promise<RepositoryDiff> {
    // In a real implementation, this would use Octokit or direct fetch calls to api.github.com
    // For this architectural foundation, we simulate returning a normalized RepositoryDiff.
    return {
      metadata: {
        id: `gh-${prId}`,
        url: `https://github.com/${repoId}/pull/${prId}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        title: "Mock GitHub PR",
        description: "Simulated GitHub Pull Request"
      },
      author: {
        login: "mock-user",
      },
      reviewers: [],
      branch: "feature/mock-pr",
      baseBranch: "main",
      headBranch: "feature/mock-pr",
      commits: [],
      labels: [],
      mergeStatus: "unknown",
      reviewStatus: "none",
      statistics: {
        filesChanged: 0,
        insertions: 0,
        deletions: 0
      },
      addedFiles: [],
      modifiedFiles: [],
      deletedFiles: [],
      renamedFiles: [],
      patches: []
    };
  }
}

import { RepositoryDiff } from "../../types/repository-diff";

export interface PullRequestProvider {
  name(): string;
  fetchPullRequest(repoId: string, prId: string, credentials?: Record<string, any>): Promise<RepositoryDiff>;
  // Future methods for adding comments, merging, etc. could be added here
}

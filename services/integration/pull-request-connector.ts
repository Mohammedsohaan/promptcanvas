import { PullRequestProvider } from "./pull-request-provider";
import { RepositoryDiff } from "../../types/repository-diff";
import { PlatformEventBus } from "../core/platform-event-bus";

/**
 * PullRequestConnector orchestrates calls to the underlying provider
 * and publishes standard domain events upon successful data retrieval.
 */
export class PullRequestConnector {
  constructor(private provider: PullRequestProvider) {}

  public async getRepositoryDiff(repoId: string, prId: string, credentials?: Record<string, any>): Promise<RepositoryDiff> {
    const diff = await this.provider.fetchPullRequest(repoId, prId, credentials);
    
    // Publish event after standardizing the diff
    PlatformEventBus.getInstance().publish("RepositoryDiffCreated", { 
      provider: this.provider.name(), 
      repoId, 
      prId, 
      diff 
    });

    return diff;
  }
}

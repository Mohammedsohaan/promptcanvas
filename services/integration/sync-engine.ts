import { Document, DocumentFreshness, DocumentType } from "../../types/document";
import { EngineeringConnector, ExternalReference, PublishOptions, SyncPlatform } from "./connector";
import { GitHubConnector } from "./github-connector";
import { JiraConnector } from "./jira-connector";

export class SyncEngine {
  private connectors = new Map<SyncPlatform, EngineeringConnector>();

  constructor() {
    this.registerConnector(new GitHubConnector());
    this.registerConnector(new JiraConnector());
  }

  public registerConnector(connector: EngineeringConnector): void {
    this.connectors.set(connector.platformName, connector);
  }

  public getConnector(platform: SyncPlatform): EngineeringConnector {
    const connector = this.connectors.get(platform);
    if (!connector) {
      throw new Error(`Unsupported sync platform: ${platform}`);
    }
    return connector;
  }

  public async publishDocument(
    doc: Document,
    platform: SyncPlatform,
    options: PublishOptions
  ): Promise<ExternalReference> {
    const connector = this.getConnector(platform);

    let ref: ExternalReference;
    if (doc.type === DocumentType.SPRINT_PLAN) {
      ref = await connector.publishSprint(doc, options);
    } else if (doc.type === DocumentType.USER_STORIES) {
      ref = await connector.publishStory(doc, options);
    } else if (doc.type === DocumentType.TEST_CASES) {
      ref = await connector.publishTestCases(doc, options);
    } else {
      ref = await connector.publishStory(doc, options);
    }

    return ref;
  }

  public checkSyncConflict(
    doc: Document,
    freshness: DocumentFreshness,
    existingRef?: ExternalReference
  ): "Pending" | "Synced" | "Modified" | "Conflict" | "Failed" {
    if (!existingRef) return "Pending";

    if (freshness === DocumentFreshness.OUTDATED) {
      return "Conflict";
    }

    const docUpdatedTime = new Date(doc.updatedAt).getTime();
    const lastSyncTime = new Date(existingRef.lastSyncAt).getTime();

    if (docUpdatedTime > lastSyncTime) {
      return "Modified";
    }

    return "Synced";
  }
}

export const syncEngine = new SyncEngine();

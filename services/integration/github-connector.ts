import { Document } from "../../types/document";
import { EngineeringConnector, ExternalReference, PublishOptions, SyncPlatform } from "./connector";

export class GitHubConnector implements EngineeringConnector {
  public readonly platformName: SyncPlatform = "github";

  public async publishSprint(
    sprintPlanDoc: Document,
    options: PublishOptions
  ): Promise<ExternalReference> {
    const repo = options.targetProjectOrRepo || "org/repo";
    const milestoneId = `gh-ms-${Date.now()}`;
    const issueUrl = `https://github.com/${repo}/milestone/${milestoneId}`;

    return {
      platform: "github",
      externalId: milestoneId,
      externalKey: `MS-${sprintPlanDoc.id.slice(0, 4)}`,
      externalUrl: issueUrl,
      syncStatus: "Synced",
      lastSyncAt: new Date().toISOString(),
    };
  }

  public async publishStory(
    userStoryDoc: Document,
    options: PublishOptions
  ): Promise<ExternalReference> {
    const repo = options.targetProjectOrRepo || "org/repo";
    const issueNumber = Math.floor(100 + Math.random() * 900);
    const issueUrl = `https://github.com/${repo}/issues/${issueNumber}`;

    return {
      platform: "github",
      externalId: `${issueNumber}`,
      externalKey: `#${issueNumber}`,
      externalUrl: issueUrl,
      syncStatus: "Synced",
      lastSyncAt: new Date().toISOString(),
    };
  }

  public async publishTestCases(
    testCaseDoc: Document,
    options: PublishOptions
  ): Promise<ExternalReference> {
    const repo = options.targetProjectOrRepo || "org/repo";
    const issueNumber = Math.floor(100 + Math.random() * 900);
    const issueUrl = `https://github.com/${repo}/issues/${issueNumber}`;

    return {
      platform: "github",
      externalId: `${issueNumber}`,
      externalKey: `#${issueNumber}`,
      externalUrl: issueUrl,
      syncStatus: "Synced",
      lastSyncAt: new Date().toISOString(),
    };
  }

  public async updateStatus(
    externalId: string,
    status: string
  ): Promise<boolean> {
    return true;
  }

  public async syncChanges(
    doc: Document,
    existingRef: ExternalReference
  ): Promise<ExternalReference> {
    return {
      ...existingRef,
      syncStatus: "Synced",
      lastSyncAt: new Date().toISOString(),
    };
  }
}

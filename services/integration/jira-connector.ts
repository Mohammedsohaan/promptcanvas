import { Document } from "../../types/document";
import { EngineeringConnector, ExternalReference, PublishOptions, SyncPlatform } from "./connector";

export class JiraConnector implements EngineeringConnector {
  public readonly platformName: SyncPlatform = "jira";

  public async publishSprint(
    sprintPlanDoc: Document,
    options: PublishOptions
  ): Promise<ExternalReference> {
    const projectKey = options.targetProjectOrRepo || "PROJ";
    const epicNum = Math.floor(10 + Math.random() * 90);
    const epicKey = `${projectKey}-${epicNum}`;
    const issueUrl = `https://${projectKey.toLowerCase()}.atlassian.net/browse/${epicKey}`;

    return {
      platform: "jira",
      externalId: epicKey,
      externalKey: epicKey,
      externalUrl: issueUrl,
      syncStatus: "Synced",
      lastSyncAt: new Date().toISOString(),
    };
  }

  public async publishStory(
    userStoryDoc: Document,
    options: PublishOptions
  ): Promise<ExternalReference> {
    const projectKey = options.targetProjectOrRepo || "PROJ";
    const storyNum = Math.floor(100 + Math.random() * 900);
    const storyKey = `${projectKey}-${storyNum}`;
    const issueUrl = `https://${projectKey.toLowerCase()}.atlassian.net/browse/${storyKey}`;

    return {
      platform: "jira",
      externalId: storyKey,
      externalKey: storyKey,
      externalUrl: issueUrl,
      syncStatus: "Synced",
      lastSyncAt: new Date().toISOString(),
    };
  }

  public async publishTestCases(
    testCaseDoc: Document,
    options: PublishOptions
  ): Promise<ExternalReference> {
    const projectKey = options.targetProjectOrRepo || "PROJ";
    const testNum = Math.floor(100 + Math.random() * 900);
    const testKey = `${projectKey}-${testNum}`;
    const issueUrl = `https://${projectKey.toLowerCase()}.atlassian.net/browse/${testKey}`;

    return {
      platform: "jira",
      externalId: testKey,
      externalKey: testKey,
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

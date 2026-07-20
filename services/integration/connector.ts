import { Document, DocumentId } from "../../types/document";

export type SyncPlatform = "github" | "jira" | "azure" | "linear";
export type SyncStatus = "Pending" | "Synced" | "Modified" | "Conflict" | "Failed";

export interface ExternalReference {
  platform: SyncPlatform;
  externalId: string;
  externalKey?: string;
  externalUrl: string;
  syncStatus: SyncStatus;
  lastSyncAt: string;
  errorMessage?: string;
}

export interface PublishOptions {
  targetProjectOrRepo: string;
  parentExternalId?: string;
  labels?: string[];
}

/**
 * EngineeringConnector defines the contract for external project management integrations
 * (e.g. GitHub, Jira, Azure DevOps, Linear).
 */
export interface EngineeringConnector {
  readonly platformName: SyncPlatform;

  publishSprint(
    sprintPlanDoc: Document,
    options: PublishOptions
  ): Promise<ExternalReference>;

  publishStory(
    userStoryDoc: Document,
    options: PublishOptions
  ): Promise<ExternalReference>;

  publishTestCases(
    testCaseDoc: Document,
    options: PublishOptions
  ): Promise<ExternalReference>;

  updateStatus(
    externalId: string,
    status: string
  ): Promise<boolean>;

  syncChanges(
    doc: Document,
    existingRef: ExternalReference
  ): Promise<ExternalReference>;
}

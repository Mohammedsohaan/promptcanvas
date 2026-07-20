import { SyncEngine } from "../integration/sync-engine";
import { DocumentType, DocumentFreshness } from "../../types/document";

describe("SyncEngine", () => {
  const syncEngine = new SyncEngine();

  const mockDoc: any = {
    id: "doc-sp-1",
    title: "Sprint 1 Plan",
    type: DocumentType.SPRINT_PLAN,
    version: 1,
    content: "Tasks...",
    updatedAt: "2026-07-20T10:00:00Z",
  };

  it("should publish document using requested connector", async () => {
    const ref = await syncEngine.publishDocument(mockDoc, "github", { targetProjectOrRepo: "test/repo" });
    expect(ref.platform).toBe("github");
    expect(ref.syncStatus).toBe("Synced");
  });

  it("should detect conflict when document is OUTDATED", () => {
    const existingRef: any = {
      platform: "github",
      externalId: "101",
      syncStatus: "Synced",
      lastSyncAt: "2026-07-20T09:00:00Z",
    };

    const status = syncEngine.checkSyncConflict(mockDoc, DocumentFreshness.OUTDATED, existingRef);
    expect(status).toBe("Conflict");
  });

  it("should detect modified status when doc updatedAt is after lastSyncAt", () => {
    const existingRef: any = {
      platform: "github",
      externalId: "101",
      syncStatus: "Synced",
      lastSyncAt: "2026-07-20T08:00:00Z",
    };

    const status = syncEngine.checkSyncConflict(mockDoc, DocumentFreshness.UP_TO_DATE, existingRef);
    expect(status).toBe("Modified");
  });
});

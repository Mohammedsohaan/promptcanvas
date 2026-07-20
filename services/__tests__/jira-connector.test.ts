import { JiraConnector } from "../integration/jira-connector";
import { DocumentType } from "../../types/document";

describe("JiraConnector", () => {
  const connector = new JiraConnector();

  const mockDoc: any = {
    id: "doc-sp-1",
    title: "Sprint 1 Plan",
    type: DocumentType.SPRINT_PLAN,
    version: 1,
    content: "Tasks...",
    updatedAt: "2026-07-20T10:00:00Z",
  };

  it("should publish sprint plan as epic", async () => {
    const ref = await connector.publishSprint(mockDoc, { targetProjectOrRepo: "PROJ" });

    expect(ref.platform).toBe("jira");
    expect(ref.syncStatus).toBe("Synced");
    expect(ref.externalUrl).toContain("atlassian.net/browse/PROJ-");
  });
});

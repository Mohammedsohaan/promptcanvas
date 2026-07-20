import { GitHubConnector } from "../integration/github-connector";
import { DocumentType } from "../../types/document";

describe("GitHubConnector", () => {
  const connector = new GitHubConnector();

  const mockDoc: any = {
    id: "doc-sp-1",
    title: "Sprint 1 Plan",
    type: DocumentType.SPRINT_PLAN,
    version: 1,
    content: "Tasks...",
    updatedAt: "2026-07-20T10:00:00Z",
  };

  it("should publish sprint plan as milestone", async () => {
    const ref = await connector.publishSprint(mockDoc, { targetProjectOrRepo: "acme/api" });

    expect(ref.platform).toBe("github");
    expect(ref.syncStatus).toBe("Synced");
    expect(ref.externalUrl).toContain("github.com/acme/api/milestone/");
  });

  it("should publish user story as issue", async () => {
    const storyDoc: any = { ...mockDoc, type: DocumentType.USER_STORIES, title: "Auth Story" };
    const ref = await connector.publishStory(storyDoc, { targetProjectOrRepo: "acme/api" });

    expect(ref.platform).toBe("github");
    expect(ref.syncStatus).toBe("Synced");
    expect(ref.externalUrl).toContain("github.com/acme/api/issues/");
  });
});

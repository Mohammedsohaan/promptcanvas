import { RepositoryIndexService } from "../repository/repository-index";
import { GitHubRepositoryConnector } from "../repository/github-repo-connector";

describe("RepositoryIndexService", () => {
  it("should index routes, exports, and migrations correctly using a mock github connector", async () => {
    RepositoryIndexService.setConnector(new GitHubRepositoryConnector());
    const repoIndex = await RepositoryIndexService.indexActiveBranch("proj-repo-test");

    expect(repoIndex.files).toHaveLength(3);
    expect(repoIndex.migrations).toContain("supabase/migrations/20260718_init.sql");
    expect(repoIndex.exports).toContain("run");
    expect(repoIndex.exports).toContain("Button");
  });
});

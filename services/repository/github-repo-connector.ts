import { RepositoryConnector, RepositoryFile, CommitInfo, BranchInfo, PullRequestInfo, RepositoryProvider } from "./connector";

export class GitHubRepositoryConnector implements RepositoryConnector {
  public readonly providerName: RepositoryProvider = "github";

  public async connect(repoUrlOrPath: string): Promise<boolean> {
    return true;
  }

  public async getFiles(branch: string = "main"): Promise<RepositoryFile[]> {
    return [
      {
        path: "src/index.ts",
        name: "index.ts",
        type: "file",
        size: 1024,
        content: "export function run() { console.log('hello'); }",
        functions: ["run"],
        exports: ["run"],
      },
      {
        path: "src/components/button.tsx",
        name: "button.tsx",
        type: "file",
        size: 2048,
        content: "export class Button {}",
        classes: ["Button"],
        exports: ["Button"],
      },
      {
        path: "supabase/migrations/20260718_init.sql",
        name: "20260718_init.sql",
        type: "file",
        size: 512,
        content: "CREATE TABLE users (id UUID PRIMARY KEY);",
      },
    ];
  }

  public async getCommits(branch: string = "main"): Promise<CommitInfo[]> {
    return [
      {
        sha: "a1b2c3d4",
        author: "Dev User",
        message: "feat: implement checkout api endpoint",
        date: new Date().toISOString(),
      },
    ];
  }

  public async getBranches(): Promise<BranchInfo[]> {
    return [
      { name: "main", isDefault: true },
      { name: "dev", isDefault: false },
    ];
  }

  public async getPullRequests(): Promise<PullRequestInfo[]> {
    return [
      {
        id: "pr-1",
        number: 42,
        title: "feat: add order checkout",
        state: "open",
        author: "Dev User",
        createdAt: new Date().toISOString(),
      },
    ];
  }
}

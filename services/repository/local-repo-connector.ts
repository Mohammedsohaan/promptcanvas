import { RepositoryConnector, RepositoryFile, CommitInfo, BranchInfo, PullRequestInfo, RepositoryProvider } from "./connector";

export class LocalRepositoryConnector implements RepositoryConnector {
  public readonly providerName: RepositoryProvider = "local";

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
        sha: "e5f6g7h8",
        author: "Local Architect",
        message: "refactor: optimize DB schema integration",
        date: new Date().toISOString(),
      },
    ];
  }

  public async getBranches(): Promise<BranchInfo[]> {
    return [{ name: "main", isDefault: true }];
  }

  public async getPullRequests(): Promise<PullRequestInfo[]> {
    return [];
  }
}

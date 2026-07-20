export type RepositoryProvider = "github" | "gitlab" | "local";

export interface RepositoryFile {
  path: string;
  name: string;
  type: "file" | "dir";
  size?: number;
  content?: string;
  classes?: string[];
  functions?: string[];
  exports?: string[];
}

export interface CommitInfo {
  sha: string;
  author: string;
  message: string;
  date: string;
}

export interface BranchInfo {
  name: string;
  isDefault: boolean;
}

export interface PullRequestInfo {
  id: string;
  number: number;
  title: string;
  state: "open" | "closed" | "merged";
  author: string;
  createdAt: string;
}

export interface RepositoryConnector {
  readonly providerName: RepositoryProvider;
  connect(repoUrlOrPath: string): Promise<boolean>;
  getFiles(branch?: string): Promise<RepositoryFile[]>;
  getCommits(branch?: string): Promise<CommitInfo[]>;
  getBranches(): Promise<BranchInfo[]>;
  getPullRequests(): Promise<PullRequestInfo[]>;
}

export interface FilePatch {
  filename: string;
  previousFilename?: string;
  status: "added" | "modified" | "deleted" | "renamed";
  additions: number;
  deletions: number;
  patch?: string;
}

export interface DiffStatistics {
  filesChanged: number;
  insertions: number;
  deletions: number;
}

export interface RepositoryDiff {
  metadata: {
    id: string;
    url: string;
    createdAt: string;
    updatedAt: string;
    title: string;
    description: string;
  };
  author: {
    login: string;
    name?: string;
    avatarUrl?: string;
  };
  reviewers: Array<{
    login: string;
    status: "pending" | "approved" | "changes_requested" | "commented";
  }>;
  branch: string;
  baseBranch: string;
  headBranch: string;
  commits: Array<{
    sha: string;
    message: string;
    author: string;
    date: string;
  }>;
  labels: string[];
  mergeStatus: "mergeable" | "conflicting" | "unknown";
  reviewStatus: "approved" | "changes_requested" | "pending" | "none";
  statistics: DiffStatistics;
  addedFiles: FilePatch[];
  modifiedFiles: FilePatch[];
  deletedFiles: FilePatch[];
  renamedFiles: FilePatch[];
  patches: FilePatch[];
}

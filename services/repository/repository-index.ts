import { RepositoryConnector, RepositoryFile } from "./connector";
import { LocalRepositoryConnector } from "./local-repo-connector";

export interface IndexedSymbol {
  name: string;
  type: "class" | "function" | "export";
  filePath: string;
}

export interface RepositoryIndex {
  files: RepositoryFile[];
  classes: IndexedSymbol[];
  functions: IndexedSymbol[];
  exports: string[];
  routes: string[];
  migrations: string[];
}

/**
 * RepositoryIndexService parses indexed repository source files to isolate classes,
 * functions, endpoint routes, database schemas, and migration files.
 */
export class RepositoryIndexService {
  private static connector: RepositoryConnector = new LocalRepositoryConnector();

  public static setConnector(connector: RepositoryConnector): void {
    this.connector = connector;
  }

  public static async indexActiveBranch(repoPath: string): Promise<RepositoryIndex> {
    await this.connector.connect(repoPath);
    const files = await this.connector.getFiles();

    const classes: IndexedSymbol[] = [];
    const functions: IndexedSymbol[] = [];
    const exports: string[] = [];
    const routes: string[] = [];
    const migrations: string[] = [];

    for (const f of files) {
      if (f.type === "file") {
        if (f.path.includes("supabase/migrations") || f.path.includes("migrations/")) {
          migrations.push(f.path);
        }

        if (f.path.includes("app/api/") || f.path.includes("pages/api/")) {
          routes.push(f.path);
        }

        if (f.classes) {
          f.classes.forEach((c) => classes.push({ name: c, type: "class", filePath: f.path }));
        }

        if (f.functions) {
          f.functions.forEach((fun) => functions.push({ name: fun, type: "function", filePath: f.path }));
        }

        if (f.exports) {
          f.exports.forEach((e) => exports.push(e));
        }
      }
    }

    return {
      files,
      classes,
      functions,
      exports,
      routes,
      migrations,
    };
  }
}

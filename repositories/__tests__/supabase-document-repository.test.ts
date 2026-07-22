import { SupabaseClient } from "@supabase/supabase-js";
import { SupabaseDocumentRepository } from "../supabase-document-repository";
import { CreateDocumentInput, DocumentType, DocumentStatus } from "../../types/document";

// Helper to create a fully-chained thenable mock Supabase client
function createMockSupabaseClient(response: { data: any; error: any }) {
  const mockSingle = jest.fn().mockResolvedValue(response);
  const mockOrder = jest.fn().mockReturnThis();
  const mockEq = jest.fn().mockReturnThis();
  const mockSelect = jest.fn().mockReturnThis();
  const mockUpdate = jest.fn().mockReturnThis();
  const mockDelete = jest.fn().mockReturnThis();
  const mockInsert = jest.fn().mockReturnThis();
  const mockUpsert = jest.fn().mockReturnThis();

  const chain: any = {
    select: mockSelect,
    eq: mockEq,
    single: mockSingle,
    order: mockOrder,
    update: mockUpdate,
    delete: mockDelete,
    insert: mockInsert,
    upsert: mockUpsert,
  };

  mockSelect.mockReturnValue(chain);
  mockEq.mockReturnValue(chain);
  mockOrder.mockReturnValue(chain);
  mockUpdate.mockReturnValue(chain);
  mockDelete.mockReturnValue(chain);
  mockInsert.mockReturnValue(chain);
  mockUpsert.mockReturnValue(chain);

  chain.then = (onfulfilled: any) => Promise.resolve(response).then(onfulfilled);

  return {
    from: jest.fn().mockReturnValue(chain),
    mockSingle,
    mockEq,
    mockSelect,
    mockOrder,
    mockUpdate,
    mockDelete,
    mockInsert,
    mockUpsert,
  };
}

describe("SupabaseDocumentRepository", () => {
  let repository: SupabaseDocumentRepository;

  beforeEach(() => {
    repository = new SupabaseDocumentRepository();
  });

  describe("getDocument", () => {
    it("should successfully retrieve and map a document when it exists", async () => {
      const mockRow = {
        id: "doc-123",
        project_id: "proj-456",
        title: "Test Document",
        type: "prd",
        status: "ready",
        version: 1,
        content: { body: "hello world" },
        icon: "FileText",
        is_favorite: true,
        sort_order: 2,
        created_by_ai: false,
        parent_document_id: null,
        last_generated_at: null,
        created_at: "2026-07-22T00:00:00Z",
        updated_at: "2026-07-22T00:00:00Z",
        metadata: { tags: ["test"] },
      };

      const mockClient = createMockSupabaseClient({ data: mockRow, error: null }) as unknown as SupabaseClient;
      const result = await repository.getDocument("doc-123", mockClient);

      expect(result).not.toBeNull();
      expect(result?.id).toBe("doc-123");
      expect(result?.projectId).toBe("proj-456");
      expect(result?.title).toBe("Test Document");
      expect(result?.isFavorite).toBe(true);
      expect(result?.metadata?.tags).toEqual(["test"]);
    });

    it("should return null if the document does not exist", async () => {
      const mockClient = createMockSupabaseClient({ data: null, error: { message: "Not found" } }) as unknown as SupabaseClient;
      const result = await repository.getDocument("doc-999", mockClient);
      expect(result).toBeNull();
    });
  });

  describe("getProjectDocuments", () => {
    it("should retrieve and map list of documents for a project", async () => {
      const mockRows = [
        {
          id: "doc-1",
          project_id: "proj-1",
          title: "Doc 1",
          type: "prd",
          status: "ready",
          version: 1,
          content: {},
          icon: "File",
          is_favorite: false,
          sort_order: 1,
          created_by_ai: false,
          parent_document_id: null,
          last_generated_at: null,
          created_at: "2026-07-22T00:00:00Z",
          updated_at: "2026-07-22T00:00:00Z",
        },
      ];

      const mockClient = createMockSupabaseClient({ data: mockRows, error: null }) as unknown as SupabaseClient;
      const result = await repository.getProjectDocuments("proj-1", mockClient);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("doc-1");
      expect(result[0].projectId).toBe("proj-1");
      expect(result[0].isFavorite).toBe(false);
    });

    it("should return empty array on failure or if no documents exist", async () => {
      const mockClient = createMockSupabaseClient({ data: null, error: { message: "Error" } }) as unknown as SupabaseClient;
      const result = await repository.getProjectDocuments("proj-empty", mockClient);
      expect(result).toEqual([]);
    });
  });

  describe("saveDocument", () => {
    it("should successfully upsert a valid document input and return domain model", async () => {
      const input: CreateDocumentInput = {
        projectId: "proj-1",
        title: "New Doc",
        type: "prd" as DocumentType,
        status: "ready" as DocumentStatus,
        version: 1,
        content: { raw: "content" },
        icon: "File",
        isFavorite: false,
        sortOrder: 0,
        createdByAi: false,
        parentDocumentId: null,
        lastGeneratedAt: null,
        createdAt: "2026-07-22T00:00:00Z",
        updatedAt: "2026-07-22T00:00:00Z",
      };

      const mockSavedRow = {
        id: "doc-gen-123",
        project_id: "proj-1",
        title: "New Doc",
        type: "prd",
        status: "ready",
        version: 1,
        content: { raw: "content" },
        icon: "File",
        is_favorite: false,
        sort_order: 0,
        created_by_ai: false,
        parent_document_id: null,
        last_generated_at: null,
        created_at: "2026-07-22T00:00:00Z",
        updated_at: "2026-07-22T00:00:00Z",
      };

      const mockClient = createMockSupabaseClient({ data: mockSavedRow, error: null }) as unknown as SupabaseClient;
      const result = await repository.saveDocument(input, mockClient);

      expect(result.id).toBe("doc-gen-123");
      expect(result.projectId).toBe("proj-1");
      expect(result.title).toBe("New Doc");
    });

    it("should propagate error if upsert query fails", async () => {
      const input: CreateDocumentInput = {
        projectId: "proj-1",
        title: "Bad Doc",
        type: "prd" as DocumentType,
        status: "ready" as DocumentStatus,
        version: 1,
        content: {},
        icon: "File",
        isFavorite: false,
        sortOrder: 0,
        createdByAi: false,
        parentDocumentId: null,
        lastGeneratedAt: null,
        createdAt: "2026-07-22T00:00:00Z",
        updatedAt: "2026-07-22T00:00:00Z",
      };

      const mockClient = createMockSupabaseClient({ data: null, error: { message: "Database violation" } }) as unknown as SupabaseClient;

      await expect(repository.saveDocument(input, mockClient)).rejects.toThrow("Failed to save document: Database violation");
    });
  });

  describe("updateDocument", () => {
    it("should successfully update document fields and return the updated model", async () => {
      const mockUpdatedRow = {
        id: "doc-1",
        project_id: "proj-1",
        title: "Updated Title",
        type: "prd",
        status: "ready",
        version: 2,
        content: {},
        icon: "File",
        is_favorite: true,
        sort_order: 0,
        created_by_ai: false,
        parent_document_id: null,
        last_generated_at: null,
        created_at: "2026-07-22T00:00:00Z",
        updated_at: "2026-07-22T00:00:00Z",
      };

      const mockClient = createMockSupabaseClient({ data: mockUpdatedRow, error: null }) as unknown as SupabaseClient;
      const result = await repository.updateDocument("doc-1", { title: "Updated Title", is_favorite: true }, mockClient);

      expect(result.title).toBe("Updated Title");
      expect(result.isFavorite).toBe(true);
    });

    it("should throw error if update query fails", async () => {
      const mockClient = createMockSupabaseClient({ data: null, error: { message: "Network Timeout" } }) as unknown as SupabaseClient;

      await expect(repository.updateDocument("doc-1", { title: "New" }, mockClient)).rejects.toThrow("Failed to update document: Network Timeout");
    });
  });

  describe("updateMetadata", () => {
    it("should update metadata successfully", async () => {
      const mockClient = createMockSupabaseClient({ data: null, error: null }) as unknown as SupabaseClient;
      await expect(repository.updateMetadata("doc-1", { tags: ["meta"] }, mockClient)).resolves.not.toThrow();
    });

    it("should throw error if metadata update fails", async () => {
      const mockClient = createMockSupabaseClient({ data: null, error: { message: "Permissions denied" } }) as unknown as SupabaseClient;
      await expect(repository.updateMetadata("doc-1", { tags: ["meta"] }, mockClient)).rejects.toThrow("Failed to update metadata: Permissions denied");
    });
  });

  describe("deleteDocument", () => {
    it("should delete document successfully", async () => {
      const mockClient = createMockSupabaseClient({ data: null, error: null }) as unknown as SupabaseClient;
      await expect(repository.deleteDocument("doc-123", mockClient)).resolves.not.toThrow();
    });

    it("should throw error if deletion fails", async () => {
      const mockClient = createMockSupabaseClient({ data: null, error: { message: "Foreign key constraint violation" } }) as unknown as SupabaseClient;
      await expect(repository.deleteDocument("doc-123", mockClient)).rejects.toThrow("Failed to delete document: Foreign key constraint violation");
    });
  });
});

import { createDocument, getDocuments, getDocumentById, updateDocument, deleteDocument } from "../documents";
import { documentRepository } from "@/repositories/supabase-document-repository";
import { Document, DocumentStatus, DocumentType } from "@/types/document";

jest.mock("@/repositories/supabase-document-repository", () => ({
  documentRepository: {
    saveDocument: jest.fn(),
    getProjectDocuments: jest.fn(),
    getDocument: jest.fn(),
    updateDocument: jest.fn(),
    deleteDocument: jest.fn(),
  },
}));

describe("Documents Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockDomainDoc: Document = {
    id: "doc-1",
    projectId: "proj-1",
    title: "My Doc",
    type: "prd" as DocumentType,
    status: "ready" as DocumentStatus,
    version: 1,
    content: { key: "value" },
    icon: "FileText",
    isFavorite: false,
    sortOrder: 0,
    createdByAi: false,
    parentDocumentId: null,
    lastGeneratedAt: null,
    createdAt: "2026-07-22T00:00:00Z",
    updatedAt: "2026-07-22T00:00:00Z",
  };

  describe("createDocument", () => {
    it("should successfully create and return mapped document", async () => {
      (documentRepository.saveDocument as jest.Mock).mockResolvedValue(mockDomainDoc);

      const result = await createDocument({
        project_id: "proj-1",
        title: "My Doc",
        type: "prd",
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.id).toBe("doc-1");
      expect(result.data?.project_id).toBe("proj-1");
      expect(result.data?.content).toEqual({ key: "value" });
    });

    it("should handle creation errors gracefully", async () => {
      (documentRepository.saveDocument as jest.Mock).mockRejectedValue(new Error("Fail to save"));

      const result = await createDocument({
        project_id: "proj-1",
        title: "My Doc",
        type: "prd",
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe("Fail to save");
    });
  });

  describe("getDocuments", () => {
    it("should return mapped list of documents", async () => {
      (documentRepository.getProjectDocuments as jest.Mock).mockResolvedValue([mockDomainDoc]);

      const result = await getDocuments("proj-1");

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data?.[0].id).toBe("doc-1");
    });

    it("should handle error gracefully on fetch failure", async () => {
      (documentRepository.getProjectDocuments as jest.Mock).mockRejectedValue(new Error("Timeout"));

      const result = await getDocuments("proj-1");

      expect(result.success).toBe(false);
      expect(result.message).toBe("Timeout");
    });
  });

  describe("getDocumentById", () => {
    it("should return mapped document on successful lookup", async () => {
      (documentRepository.getDocument as jest.Mock).mockResolvedValue(mockDomainDoc);

      const result = await getDocumentById("doc-1");

      expect(result.success).toBe(true);
      expect(result.data?.id).toBe("doc-1");
    });

    it("should return success false if document is null", async () => {
      (documentRepository.getDocument as jest.Mock).mockResolvedValue(null);

      const result = await getDocumentById("doc-999");

      expect(result.success).toBe(false);
      expect(result.message).toBe("Document not found.");
    });
  });

  describe("updateDocument", () => {
    it("should successfully update document and return mapped data", async () => {
      (documentRepository.updateDocument as jest.Mock).mockResolvedValue({
        ...mockDomainDoc,
        title: "New Title",
      });

      const result = await updateDocument("doc-1", { title: "New Title" });

      expect(result.success).toBe(true);
      expect(result.data?.title).toBe("New Title");
    });

    it("should return failure on update error", async () => {
      (documentRepository.updateDocument as jest.Mock).mockRejectedValue(new Error("Constraint violation"));

      const result = await updateDocument("doc-1", { title: "New Title" });

      expect(result.success).toBe(false);
      expect(result.message).toBe("Constraint violation");
    });
  });

  describe("deleteDocument", () => {
    it("should return success on deletion success", async () => {
      (documentRepository.deleteDocument as jest.Mock).mockResolvedValue(undefined);

      const result = await deleteDocument("doc-1");

      expect(result.success).toBe(true);
    });

    it("should return failure on deletion failure", async () => {
      (documentRepository.deleteDocument as jest.Mock).mockRejectedValue(new Error("Cannot delete"));

      const result = await deleteDocument("doc-1");

      expect(result.success).toBe(false);
      expect(result.message).toBe("Cannot delete");
    });
  });
});

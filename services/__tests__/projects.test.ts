import { createProject, getProjects, getProjectById } from "../projects";
import { createClient as createBrowserClient } from "@/lib/supabase/client";

jest.mock("@/lib/supabase/client", () => ({
  createClient: jest.fn(),
}));

describe("Projects Service", () => {
  let mockSupabase: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabase = {
      auth: {
        getUser: jest.fn(),
      },
      from: jest.fn(),
    };
    (createBrowserClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  describe("createProject", () => {
    it("should successfully create a project when user is logged in", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "user-123" } },
        error: null,
      });

      const mockProject = {
        id: "proj-1",
        title: "Test Project",
        description: "My description",
        color: "#6366F1",
        icon: "Folder",
        user_id: "user-123",
      };

      const mockSingle = jest.fn().mockResolvedValue({ data: mockProject, error: null });
      const mockSelect = jest.fn().mockReturnValue({ single: mockSingle });
      const mockInsert = jest.fn().mockReturnValue({ select: mockSelect });

      mockSupabase.from.mockReturnValue({
        insert: mockInsert,
      });

      const result = await createProject({
        title: "Test Project",
        description: "My description",
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockProject);
      expect(mockSupabase.from).toHaveBeenCalledWith("projects");
      expect(mockInsert).toHaveBeenCalledWith({
        title: "Test Project",
        description: "My description",
        color: "#6366F1",
        icon: "Folder",
        user_id: "user-123",
      });
    });

    it("should fail project creation if user is not authenticated", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: "Auth expired" },
      });

      const result = await createProject({
        title: "Ghost Project",
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain("must be logged in");
    });

    it("should return failure response if database insert fails", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "user-123" } },
        error: null,
      });

      const mockSingle = jest.fn().mockResolvedValue({ data: null, error: { message: "Unique key violation" } });
      const mockSelect = jest.fn().mockReturnValue({ single: mockSingle });
      const mockInsert = jest.fn().mockReturnValue({ select: mockSelect });

      mockSupabase.from.mockReturnValue({
        insert: mockInsert,
      });

      const result = await createProject({
        title: "Conflicting Project",
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe("Unique key violation");
    });
  });

  describe("getProjects", () => {
    it("should fetch projects successfully", async () => {
      const mockList = [
        { id: "proj-1", title: "Project 1" },
        { id: "proj-2", title: "Project 2" },
      ];

      const mockOrder = jest.fn().mockResolvedValue({ data: mockList, error: null });
      const mockSelect = jest.fn().mockReturnValue({ order: mockOrder });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
      });

      const result = await getProjects();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockList);
    });

    it("should return failure response on fetching error", async () => {
      const mockOrder = jest.fn().mockResolvedValue({ data: null, error: { message: "Read error" } });
      const mockSelect = jest.fn().mockReturnValue({ order: mockOrder });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
      });

      const result = await getProjects();

      expect(result.success).toBe(false);
      expect(result.message).toBe("Read error");
    });
  });

  describe("getProjectById", () => {
    it("should fetch single project successfully", async () => {
      const mockProject = { id: "proj-1", title: "Project 1" };

      const mockSingle = jest.fn().mockResolvedValue({ data: mockProject, error: null });
      const mockEq = jest.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
      });

      const result = await getProjectById("proj-1");

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockProject);
    });

    it("should return failure response if project is missing", async () => {
      const mockSingle = jest.fn().mockResolvedValue({ data: null, error: { message: "No row found" } });
      const mockEq = jest.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
      });

      const result = await getProjectById("proj-999");

      expect(result.success).toBe(false);
      expect(result.message).toBe("No row found");
    });
  });
});

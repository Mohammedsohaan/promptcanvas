import { SupabaseClient } from "@supabase/supabase-js";
import { createClient as createBrowserClient } from "@/lib/supabase/client";

/* ─────────── Types ─────────── */

export interface Project {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  title: string;
  description: string | null;
  color: string;
  icon: string;
  is_archived: boolean;
}

export interface CreateProjectData {
  title: string;
  description?: string;
  color?: string;
  icon?: string;
}

export interface ProjectResult<T> {
  success: boolean;
  message: string;
  data?: T;
}

/* ─────────── Create Project ─────────── */

export async function createProject(
  projectData: CreateProjectData,
  supabaseClient?: SupabaseClient
): Promise<ProjectResult<Project>> {
  const supabase = supabaseClient || createBrowserClient();

  // Get current authenticated user to supply the user_id
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      success: false,
      message: "You must be logged in to create a project.",
    };
  }

  const { data, error } = await supabase
    .from("projects")
    .insert({
      title: projectData.title,
      description: projectData.description || null,
      color: projectData.color || "#6366F1",
      icon: projectData.icon || "Folder",
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    return {
      success: false,
      message: error.message || "Failed to create project. Please try again.",
    };
  }

  return {
    success: true,
    message: "Project created successfully!",
    data: data as Project,
  };
}

/* ─────────── Get Projects ─────────── */

export async function getProjects(
  supabaseClient?: SupabaseClient
): Promise<ProjectResult<Project[]>> {
  const supabase = supabaseClient || createBrowserClient();

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    return {
      success: false,
      message: error.message || "Failed to fetch projects. Please try again.",
    };
  }

  return {
    success: true,
    message: "Projects fetched successfully!",
    data: data as Project[],
  };
}

/* ─────────── Get Project By ID ─────────── */

export async function getProjectById(
  projectId: string,
  supabaseClient?: SupabaseClient
): Promise<ProjectResult<Project>> {
  const supabase = supabaseClient || createBrowserClient();

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .single();

  if (error || !data) {
    return {
      success: false,
      message: error?.message || "Project not found.",
    };
  }

  return {
    success: true,
    message: "Project fetched successfully!",
    data: data as Project,
  };
}

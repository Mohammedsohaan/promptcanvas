import * as React from "react";
import { ProjectDashboard } from "@/components/dashboard/project-dashboard";
import { createClient } from "@/lib/supabase/server";
import { getProjects } from "@/services/projects";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const projectsResult = await getProjects(supabase);
  const projects = projectsResult.success ? projectsResult.data || [] : [];

  return (
    <ProjectDashboard initialProjects={projects} user={user} />
  );
}

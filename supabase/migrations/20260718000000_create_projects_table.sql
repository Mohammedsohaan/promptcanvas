-- Create projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  color TEXT NOT NULL DEFAULT '#6366F1',
  icon TEXT NOT NULL DEFAULT 'Folder',
  is_archived BOOLEAN NOT NULL DEFAULT false
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to prevent duplication errors
DROP POLICY IF EXISTS "Users can only view their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can only create projects for themselves" ON public.projects;
DROP POLICY IF EXISTS "Users can only update their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can only delete their own projects" ON public.projects;

-- 1. SELECT policy: Users can only view their own projects
CREATE POLICY "Users can only view their own projects" 
  ON public.projects
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 2. INSERT policy: Users can only create projects for themselves
CREATE POLICY "Users can only create projects for themselves"
  ON public.projects
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 3. UPDATE policy: Users can only update their own projects
CREATE POLICY "Users can only update their own projects"
  ON public.projects
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. DELETE policy: Users can only delete their own projects
CREATE POLICY "Users can only delete their own projects"
  ON public.projects
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Trigger function to update updated_at if not already defined
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists to prevent duplication errors
DROP TRIGGER IF EXISTS set_projects_updated_at ON public.projects;

-- Trigger to execute update on projects update
CREATE TRIGGER set_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create documents table
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  icon TEXT NOT NULL DEFAULT 'FileText',
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (idempotent)
DROP POLICY IF EXISTS "Users can view documents in their own projects" ON public.documents;
DROP POLICY IF EXISTS "Users can create documents in their own projects" ON public.documents;
DROP POLICY IF EXISTS "Users can update documents in their own projects" ON public.documents;
DROP POLICY IF EXISTS "Users can delete documents in their own projects" ON public.documents;

-- 1. SELECT: Users can only view documents belonging to projects they own
CREATE POLICY "Users can view documents in their own projects"
  ON public.documents
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = documents.project_id
        AND projects.user_id = auth.uid()
    )
  );

-- 2. INSERT: Users can only create documents in projects they own
CREATE POLICY "Users can create documents in their own projects"
  ON public.documents
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = documents.project_id
        AND projects.user_id = auth.uid()
    )
  );

-- 3. UPDATE: Users can only update documents in projects they own
CREATE POLICY "Users can update documents in their own projects"
  ON public.documents
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = documents.project_id
        AND projects.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = documents.project_id
        AND projects.user_id = auth.uid()
    )
  );

-- 4. DELETE: Users can only delete documents in projects they own
CREATE POLICY "Users can delete documents in their own projects"
  ON public.documents
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = documents.project_id
        AND projects.user_id = auth.uid()
    )
  );

-- Reuse the existing handle_updated_at() trigger function
-- Drop existing trigger if it exists (idempotent)
DROP TRIGGER IF EXISTS set_documents_updated_at ON public.documents;

-- Trigger to automatically update updated_at on row changes
CREATE TRIGGER set_documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

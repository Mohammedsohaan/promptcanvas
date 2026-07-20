-- Add new columns to documents table for the Document Knowledge Graph
ALTER TABLE public.documents
  ADD COLUMN status TEXT NOT NULL DEFAULT 'DRAFT',
  ADD COLUMN version INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN created_by_ai BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN parent_document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
  ADD COLUMN last_generated_at TIMESTAMPTZ;

-- Update existing documents to be of type CUSTOM
UPDATE public.documents
SET type = 'CUSTOM'
WHERE type != 'CUSTOM';

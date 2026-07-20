"use client";

import * as React from "react";
import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { EditorToolbar } from "@/components/editor/editor-toolbar";
import { SaveIndicator, SaveStatus } from "@/components/editor/save-indicator";
import { updateDocument } from "@/services/documents";

import { marked } from "marked";

export interface DocumentEditorRef {
  replaceContent: (markdown: string) => void;
  appendContent: (markdown: string) => void;
  prependContent: (markdown: string) => void;
  insertAtCursor: (markdown: string) => void;
  setEditable: (editable: boolean) => void;
}

export interface EditorProps {
  documentId: string;
  initialContent?: Record<string, unknown>;
  onStatusChange?: (status: SaveStatus) => void;
}

export const DocumentEditor = React.forwardRef<DocumentEditorRef, EditorProps>(
  ({ documentId, initialContent, onStatusChange }, ref) => {
  const [saveStatus, setSaveStatus] = React.useState<SaveStatus>("idle");
  const saveTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const updateStatus = (status: SaveStatus) => {
    setSaveStatus(status);
    if (onStatusChange) {
      onStatusChange(status);
    }
  };

  // Determine initial JSON content or blank doc
  const formattedInitialContent = React.useMemo(() => {
    if (
      !initialContent ||
      (typeof initialContent === "object" &&
        Object.keys(initialContent).length === 0)
    ) {
      return {
        type: "doc",
        content: [
          {
            type: "paragraph",
          },
        ],
      };
    }
    return initialContent;
  }, [initialContent]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2],
        },
      }),
    ],
    content: formattedInitialContent,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose prose-invert max-w-none focus:outline-none min-h-[350px] p-4 text-neutral-200",
      },
    },
    onUpdate: ({ editor: updatedEditor }: { editor: Editor }) => {
      updateStatus("saving");

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(async () => {
        try {
          const jsonContent = updatedEditor.getJSON() as Record<string, unknown>;
          const result = await updateDocument(documentId, {
            content: jsonContent,
          });

          if (result.success) {
            updateStatus("saved");
          } else {
            console.error("Autosave failed:", result.message);
            updateStatus("error");
          }
        } catch (err) {
          console.error("Error during autosave:", err);
          updateStatus("error");
        }
      }, 1000);
    },
  });

  const saveImmediate = async (currentEditor: Editor) => {
    updateStatus("saving");
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    
    try {
      const jsonContent = currentEditor.getJSON() as Record<string, unknown>;
      const result = await updateDocument(documentId, { content: jsonContent });
      if (result.success) updateStatus("saved");
      else updateStatus("error");
    } catch {
      updateStatus("error");
    }
  };

  React.useImperativeHandle(ref, () => ({
    replaceContent: async (markdown: string) => {
      if (editor) {
        const html = await marked.parse(markdown);
        editor.commands.setContent(html);
        await saveImmediate(editor);
      }
    },
    appendContent: async (markdown: string) => {
      if (editor) {
        const html = await marked.parse(markdown);
        editor.commands.insertContentAt(editor.state.doc.content.size, html);
        await saveImmediate(editor);
      }
    },
    prependContent: async (markdown: string) => {
      if (editor) {
        const html = await marked.parse(markdown);
        editor.commands.insertContentAt(0, html);
        await saveImmediate(editor);
      }
    },
    insertAtCursor: async (markdown: string) => {
      if (editor) {
        const html = await marked.parse(markdown);
        editor.commands.insertContent(html);
        await saveImmediate(editor);
      }
    },
    setEditable: (editable: boolean) => {
      if (editor) {
        editor.setEditable(editable);
      }
    }
  }));

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between gap-4">
        <EditorToolbar editor={editor} />
        <SaveIndicator status={saveStatus} className="mb-4 shrink-0" />
      </div>

      <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/40 backdrop-blur-xl p-4 transition-colors">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
});

DocumentEditor.displayName = "DocumentEditor";

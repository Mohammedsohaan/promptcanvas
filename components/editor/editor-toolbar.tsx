"use client";

import * as React from "react";
import { type Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Code,
  Undo,
  Redo,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EditorToolbarProps {
  editor: Editor | null;
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  if (!editor) {
    return null;
  }

  const items = [
    {
      label: "Bold",
      icon: Bold,
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: editor.isActive("bold"),
      disabled: !editor.can().chain().focus().toggleBold().run(),
    },
    {
      label: "Italic",
      icon: Italic,
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: editor.isActive("italic"),
      disabled: !editor.can().chain().focus().toggleItalic().run(),
    },
    { type: "divider" },
    {
      label: "Heading 1",
      icon: Heading1,
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: editor.isActive("heading", { level: 1 }),
    },
    {
      label: "Heading 2",
      icon: Heading2,
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: editor.isActive("heading", { level: 2 }),
    },
    { type: "divider" },
    {
      label: "Bullet List",
      icon: List,
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: editor.isActive("bulletList"),
    },
    {
      label: "Ordered List",
      icon: ListOrdered,
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: editor.isActive("orderedList"),
    },
    { type: "divider" },
    {
      label: "Block Quote",
      icon: Quote,
      action: () => editor.chain().focus().toggleBlockquote().run(),
      isActive: editor.isActive("blockquote"),
    },
    {
      label: "Code Block",
      icon: Code,
      action: () => editor.chain().focus().toggleCodeBlock().run(),
      isActive: editor.isActive("codeBlock"),
    },
    { type: "divider" },
    {
      label: "Undo",
      icon: Undo,
      action: () => editor.chain().focus().undo().run(),
      disabled: !editor.can().chain().focus().undo().run(),
    },
    {
      label: "Redo",
      icon: Redo,
      action: () => editor.chain().focus().redo().run(),
      disabled: !editor.can().chain().focus().redo().run(),
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-1 p-1.5 rounded-xl border border-neutral-800/80 bg-neutral-950/60 backdrop-blur-md mb-4 sticky top-0 z-10">
      {items.map((item, index) => {
        if (item.type === "divider") {
          return (
            <div
              key={`divider-${index}`}
              className="h-4 w-px bg-neutral-800 mx-1 shrink-0"
            />
          );
        }

        const Icon = item.icon!;
        return (
          <button
            key={item.label}
            type="button"
            title={item.label}
            onClick={item.action}
            disabled={item.disabled}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-colors focus:outline-none",
              item.isActive
                ? "bg-neutral-800 text-neutral-100 shadow-sm"
                : "text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200",
              item.disabled && "opacity-40 cursor-not-allowed hover:bg-transparent hover:text-neutral-400"
            )}
          >
            <Icon className="h-4 w-4" />
          </button>
        );
      })}
    </div>
  );
}

"use client";

import { useEffect } from "react";
import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";
import { EditorContent, useEditor } from "@tiptap/react";

type EditorProps = {
  value: string;
  onChange: (value: string) => void;
  labelledBy?: string;
  describedBy?: string;
};

function textToHtml(value: string) {
  return value
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => `<p>${block.replace(/\n/g, "<br />")}</p>`)
    .join("");
}

export function Editor({ value, onChange, labelledBy, describedBy }: EditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Your generated post appears here. Tweak the phrasing, tighten the hook, then copy it out.",
      }),
    ],
    content: textToHtml(value),
    editorProps: {
      attributes: {
        class:
          "min-h-[18rem] rounded-[1.75rem] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-5 py-5 font-body text-base leading-8 text-[color:var(--color-foreground)] shadow-[0_24px_60px_-44px_color-mix(in_oklch,var(--color-accent)_14%,transparent)] focus:outline-none sm:min-h-[22rem] sm:px-6 sm:py-6",
        "aria-labelledby": labelledBy,
        "aria-describedby": describedBy,
      },
    },
    onUpdate({ editor: currentEditor }) {
      onChange(currentEditor.getText({ blockSeparator: "\n\n" }));
    },
  });

  useEffect(() => {
    if (!editor) {
      return;
    }

    const currentValue = editor.getText({ blockSeparator: "\n\n" });

    if (currentValue !== value) {
      editor.commands.setContent(textToHtml(value), { emitUpdate: false });
    }
  }, [editor, value]);

  return <EditorContent editor={editor} />;
}
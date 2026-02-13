"use client"

import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import { Menubar } from "./Menubar"

export function RichTextEditor({ field, editorClass = '' }) {
  const baseClass =
    'rich-text-editor-content min-h-[300px] p-4 focus:outline-none prose prose-sm !w-full !max-w-none text-foreground dark:prose-invert'
  const combinedClass = `${baseClass} ${editorClass}`.trim()

  const editor = useEditor({
    extensions: [StarterKit, TextAlign.configure({ types: ['heading', 'paragraph'] })],
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: combinedClass,
      }
    },
    onUpdate: ({ editor }) => {
      try {
        const json = editor.getJSON();
        field.onChange(JSON.stringify(json));
      } catch (e) {
        // fallback: do not set undefined
        console.error('RichTextEditor onUpdate error:', e);
      }
    },
    content: field.value ? JSON.parse(field.value) : '<p></p>'
  })

  return (
    <div className="w-full border border-input rounded-lg overflow-hidden bg-card dark:bg-card/80">
      <Menubar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}
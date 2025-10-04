"use client"

import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import { Menubar } from "./Menubar"

export function RichTextEditor() {
  const editor = useEditor({
    extensions: [StarterKit, TextAlign.configure({ types: ['heading', 'paragraph'] })],
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'min-h-[300px] p-4 focus:outline-none'
      }
    }
  })

  return (
    <div className="w-full border border-input rounded-lg overflow-hidden dark:bg-input/30">
      <Menubar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}
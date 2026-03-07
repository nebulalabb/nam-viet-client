import React, { useEffect, useMemo } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import { Extension } from '@tiptap/core'

import * as StarterKitPkg from '@tiptap/starter-kit'
import * as TextStylePkg from '@tiptap/extension-text-style'
import * as ColorPkg from '@tiptap/extension-color'
import * as UnderlinePkg from '@tiptap/extension-underline'
import * as HighlightPkg from '@tiptap/extension-highlight'

const StarterKit = StarterKitPkg.default ?? StarterKitPkg.StarterKit
const TextStyle = TextStylePkg.default ?? TextStylePkg.TextStyle
const Color = ColorPkg.default ?? ColorPkg.Color
const Underline = UnderlinePkg.default ?? UnderlinePkg.Underline
const Highlight = HighlightPkg.default ?? HighlightPkg.Highlight

// === FontSize extension ===
const FontSize = Extension.create({
  name: 'fontSize',
  addGlobalAttributes() {
    return [
      {
        types: ['textStyle'],
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (el) => el.style.fontSize?.replace('px', '') || null,
            renderHTML: (attrs) =>
              attrs.fontSize ? { style: `font-size:${attrs.fontSize}px` } : {},
          },
        },
      },
    ]
  },
})

function ToolbarButton({ onClick, active, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-7 rounded border px-2 text-xs ${
        active ? 'bg-muted' : 'bg-white'
      }`}
    >
      {children}
    </button>
  )
}

function Toolbar({ editor }) {
  const fontSizes = useMemo(() => [12, 14, 16, 18, 22, 28], [])
  if (!editor) return null

  const setFontSize = (px) =>
    editor
      .chain()
      .focus()
      .setMark('textStyle', { fontSize: String(px) })
      .run()

  const clearFormatting = () => {
    editor.chain().focus().unsetColor().run()
    editor.chain().focus().unsetMark('textStyle').run()
    editor.chain().focus().unsetAllMarks().run()
  }

  return (
    <div className="flex flex-wrap gap-2 border-b bg-white p-2">
      <ToolbarButton
        active={editor.isActive('bold')}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        B
      </ToolbarButton>

      <ToolbarButton
        active={editor.isActive('italic')}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        I
      </ToolbarButton>

      <ToolbarButton
        active={editor.isActive('underline')}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        U
      </ToolbarButton>

      <ToolbarButton
        active={editor.isActive('strike')}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        S
      </ToolbarButton>

      <span className="mx-1 h-5 w-px bg-border" />

      <ToolbarButton
        active={editor.isActive('bulletList')}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        • List
      </ToolbarButton>

      <ToolbarButton
        active={editor.isActive('orderedList')}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        1. List
      </ToolbarButton>

      <select
        className="h-7 rounded border px-2 text-xs"
        defaultValue="16"
        onChange={(e) => setFontSize(Number(e.target.value))}
      >
        {fontSizes.map((s) => (
          <option key={s} value={s}>
            {s}px
          </option>
        ))}
      </select>

      <input
        type="color"
        className="h-7 w-10 rounded border p-1"
        onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
      />

      <ToolbarButton
        active={editor.isActive('highlight')}
        onClick={() => editor.chain().focus().toggleHighlight().run()}
      >
        HL
      </ToolbarButton>

      <ToolbarButton onClick={clearFormatting}>Clear</ToolbarButton>
    </div>
  )
}

const RichTextEditor = ({ value = '', onChange }) => {
  const editor = useEditor({
    extensions: [StarterKit, TextStyle, Color, Underline, Highlight, FontSize],
    content: value,
    onUpdate: ({ editor }) => onChange?.(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'min-h-[240px] p-3 outline-none text-[15px]',
      },
    },
  })

  useEffect(() => {
    if (!editor) return
    if (editor.getHTML() !== value) {
      editor.commands.setContent(value || '', false)
    }
  }, [value, editor])

  return (
    <div className="rounded border bg-white">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}

export default RichTextEditor

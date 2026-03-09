import React, { useEffect, useMemo } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import { Extension } from '@tiptap/core'

// Import theo kiểu "an toàn" cho mọi version (default hoặc named)
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

// FontSize thông qua mark textStyle (inline style)
const FontSize = Extension.create({
  name: 'fontSize',
  addGlobalAttributes() {
    return [
      {
        types: ['textStyle'],
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => {
              const v = element.style?.fontSize
              if (!v) return null
              // "16px" -> "16"
              return String(v).replace('px', '')
            },
            renderHTML: (attributes) => {
              if (!attributes.fontSize) return {}
              return { style: `font-size: ${attributes.fontSize}px` }
            },
          },
        },
      },
    ]
  },
})

function ToolbarButton({ onClick, active, children, title }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={[
        'h-7 rounded border px-2 text-xs',
        active ? 'bg-muted' : 'bg-white',
      ].join(' ')}
    >
      {children}
    </button>
  )
}

function Toolbar({ editor }) {
  const fontSizes = useMemo(() => [12, 14, 16, 18, 22, 28], [])
  if (!editor) return null

  const setFontSize = (px) => {
    editor
      .chain()
      .focus()
      .setMark('textStyle', { fontSize: String(px) })
      .run()
  }

  const clearFormatting = () => {
    // xóa marks + reset textStyle (gồm cả color/fontSize)
    editor.chain().focus().unsetColor?.().run()
    editor.chain().focus().unsetMark('textStyle').run()
    editor.chain().focus().unsetAllMarks().run()
    // không clearNodes để tránh phá cấu trúc list/p
  }

  return (
    <div className="flex flex-wrap items-center gap-2 border-b bg-white p-2">
      <ToolbarButton
        title="Bold"
        active={editor.isActive('bold')}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        B
      </ToolbarButton>

      <ToolbarButton
        title="Italic"
        active={editor.isActive('italic')}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        I
      </ToolbarButton>

      <ToolbarButton
        title="Underline"
        active={editor.isActive('underline')}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        U
      </ToolbarButton>

      <ToolbarButton
        title="Strike"
        active={editor.isActive('strike')}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        S
      </ToolbarButton>

      <span className="mx-1 h-5 w-px bg-border" />

      <ToolbarButton
        title="Bullet list"
        active={editor.isActive('bulletList')}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        • List
      </ToolbarButton>

      <ToolbarButton
        title="Ordered list"
        active={editor.isActive('orderedList')}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        1. List
      </ToolbarButton>

      <span className="mx-1 h-5 w-px bg-border" />

      <select
        className="h-7 rounded border px-2 text-xs"
        defaultValue="16"
        onChange={(e) => setFontSize(Number(e.target.value))}
        title="Font size"
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
        title="Text color"
        onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
      />

      <ToolbarButton
        title="Highlight"
        active={editor.isActive('highlight')}
        onClick={() => editor.chain().focus().toggleHighlight().run()}
      >
        HL
      </ToolbarButton>

      <span className="mx-1 h-5 w-px bg-border" />

      <ToolbarButton title="Clear" onClick={clearFormatting}>
        Clear
      </ToolbarButton>
    </div>
  )
}

export default function WarrantyRichTextEditor({ value = '', onChange }) {
  const editor = useEditor({
    extensions: [StarterKit, TextStyle, Color, Underline, Highlight, FontSize],
    content: value || '',
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'min-h-[260px] p-3 text-[15px] leading-relaxed outline-none',
      },
    },
  })

  // Sync khi value thay đổi từ ngoài (đổi invoice, reopen dialog...)
  useEffect(() => {
    if (!editor) return
    const current = editor.getHTML()
    const incoming = value || ''
    if (incoming !== current) {
      editor.commands.setContent(incoming, false)
    }
  }, [value, editor])

  return (
    <div className="rounded border bg-white">
      <Toolbar editor={editor} />
      <div className="tiptap">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}

'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Link as LinkIcon,
  ImageIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

type RichTextEditorProps = {
  value: string
  onChange: (value: string) => void
}

export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline underline-offset-4',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-md max-w-full h-auto',
        },
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert min-h-[200px] max-w-none focus:outline-none p-4',
      },
    },
  })

  if (!editor) {
    return null
  }

  const addImage = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return

      // Use a toast or loading state here in a real app
      try {
        const formData = new FormData()
        formData.append('file', file)
        
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })
        
        const data = await res.json()
        
        if (!res.ok) {
          alert(data.error || 'Gagal mengupload gambar')
          return
        }
        
        editor.chain().focus().setImage({ src: data.url }).run()
      } catch (err) {
        alert('Terjadi kesalahan saat mengupload gambar')
      }
    }
    
    input.click()
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL Tautan:', previousUrl)
    if (url === null) {
      return
    }
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  return (
    <div className="border border-input rounded-md overflow-hidden bg-background">
      <div className="flex flex-wrap items-center gap-1 border-b border-input bg-muted/50 p-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`h-8 w-8 p-0 ${editor.isActive('bold') ? 'bg-muted text-foreground' : ''}`}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`h-8 w-8 p-0 ${editor.isActive('italic') ? 'bg-muted text-foreground' : ''}`}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`h-8 w-8 p-0 ${editor.isActive('strike') ? 'bg-muted text-foreground' : ''}`}
        >
          <Strikethrough className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-input mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`h-8 w-8 p-0 font-bold ${editor.isActive('heading', { level: 1 }) ? 'bg-muted text-foreground' : ''}`}
        >
          H1
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`h-8 w-8 p-0 font-bold ${editor.isActive('heading', { level: 2 }) ? 'bg-muted text-foreground' : ''}`}
        >
          H2
        </Button>

        <div className="w-px h-6 bg-input mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`h-8 w-8 p-0 ${editor.isActive('bulletList') ? 'bg-muted text-foreground' : ''}`}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`h-8 w-8 p-0 ${editor.isActive('orderedList') ? 'bg-muted text-foreground' : ''}`}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-input mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={setLink}
          className={`h-8 w-8 p-0 ${editor.isActive('link') ? 'bg-muted text-foreground' : ''}`}
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={addImage} className="h-8 w-8 p-0">
          <ImageIcon className="h-4 w-4" />
        </Button>
      </div>

      <EditorContent editor={editor} />
    </div>
  )
}

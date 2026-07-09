'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import LinkExtension from '@tiptap/extension-link';
import ImageExtension from '@tiptap/extension-image';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import type { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Link2,
  ImageIcon,
  Loader2,
  Redo2,
  Undo2,
  Heading2,
  Heading3,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import '@/components/admin/rich-text-editor.css';

type Props = {
  value: string;
  onChange: (html: string) => void;
  label?: string;
  placeholder?: string;
  minHeight?: number;
  className?: string;
  hint?: string;
  uploadUrl?: string;
};

function ToolbarButton({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className={cn('btn btn-sm btn-outline-secondary', active && 'active')}
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
    >
      {children}
    </button>
  );
}

function EditorToolbar({
  editor,
  uploading,
  onAddImage,
  onSetLink,
}: {
  editor: Editor | null;
  uploading: boolean;
  onAddImage: () => void;
  onSetLink: () => void;
}) {
  if (!editor) return null;

  return (
    <div className="admin-rich-text-editor__toolbar">
      <ToolbarButton
        title="Bold"
        active={editor.isActive('bold')}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Italic"
        active={editor.isActive('italic')}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Heading 2"
        active={editor.isActive('heading', { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Heading 3"
        active={editor.isActive('heading', { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        <Heading3 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Bullet list"
        active={editor.isActive('bulletList')}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Numbered list"
        active={editor.isActive('orderedList')}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton title="Insert link" active={editor.isActive('link')} onClick={onSetLink}>
        <Link2 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton title="Insert image" disabled={uploading} onClick={onAddImage}>
        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
      </ToolbarButton>
      <ToolbarButton
        title="Undo"
        disabled={!editor.can().chain().focus().undo().run()}
        onClick={() => editor.chain().focus().undo().run()}
      >
        <Undo2 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Redo"
        disabled={!editor.can().chain().focus().redo().run()}
        onClick={() => editor.chain().focus().redo().run()}
      >
        <Redo2 className="h-4 w-4" />
      </ToolbarButton>
    </div>
  );
}

export function RichTextEditor({
  value,
  onChange,
  label,
  placeholder = 'Write content…',
  minHeight = 280,
  className,
  hint,
  uploadUrl = '/api/admin/upload/article-image',
}: Props) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: { rel: 'noopener noreferrer' },
      }),
      ImageExtension.configure({ inline: true }),
    ],
    content: value || '',
    onUpdate: ({ editor: ed }) => onChange(ed.getHTML()),
    editorProps: {
      attributes: {
        'data-placeholder': placeholder,
        class: 'tiptap',
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const next = value || '';
    if (current !== next) {
      editor.commands.setContent(next, { emitUpdate: false });
    }
  }, [editor, value]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Link URL', prev ?? 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const handleFilePicked = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !editor) return;

      setUploading(true);
      try {
        const fd = new FormData();
        fd.append('file', file);
        const res = await fetch(uploadUrl, { method: 'POST', body: fd });
        if (!res.ok) throw new Error('Upload failed');
        const data = (await res.json()) as { url: string };
        editor.chain().focus().setImage({ src: data.url }).run();
      } catch {
        window.alert('Failed to upload image');
      } finally {
        setUploading(false);
        if (fileRef.current) fileRef.current.value = '';
      }
    },
    [editor, uploadUrl],
  );

  const addImage = useCallback(() => {
    fileRef.current?.click();
  }, []);

  return (
    <div className={className}>
      {label && <label className="form-label">{label}</label>}
      <div className="admin-rich-text-editor">
        <EditorToolbar editor={editor} uploading={uploading} onAddImage={addImage} onSetLink={setLink} />
        <div className="admin-rich-text-editor__content" style={{ minHeight }}>
          <EditorContent editor={editor} />
        </div>
      </div>
      {hint && <p className="text-muted fs-12 mt-1 mb-0">{hint}</p>}
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="d-none" onChange={handleFilePicked} />
    </div>
  );
}

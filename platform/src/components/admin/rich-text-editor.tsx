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
  Check,
  Trash2,
  Move,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import '@/components/admin/rich-text-editor.css';

const CustomImage = ImageExtension.configure({ inline: true }).extend({
  addAttributes() {
    return {
      src: { default: null },
      alt: { default: null },
      title: { default: null },
      width: {
        default: null,
        parseHTML: (el) => el.getAttribute('width'),
        renderHTML: (attrs) => (attrs.width ? { width: attrs.width } : {}),
      },
      height: {
        default: null,
        parseHTML: (el) => el.getAttribute('height'),
        renderHTML: (attrs) => (attrs.height ? { height: attrs.height } : {}),
      },
    };
  },
});

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

function ImageResizeBar({
  width,
  height,
  onChange,
  onDelete,
  onCancel,
}: {
  width: string;
  height: string;
  onChange: (w: string, h: string) => void;
  onDelete: () => void;
  onCancel: () => void;
}) {
  const [localW, setLocalW] = useState(width);
  const [localH, setLocalH] = useState(height);

  useEffect(() => {
    setLocalW(width);
    setLocalH(height);
  }, [width, height]);

  return (
    <div className="admin-rich-text-editor__image-resize">
      <span className="admin-rich-text-editor__image-resize-label">
        <Move className="h-3.5 w-3.5" />
        Image Size
      </span>
      <div className="admin-rich-text-editor__image-resize-inputs">
        <input
          type="number"
          className="form-control form-control-sm"
          value={localW}
          onChange={(e) => setLocalW(e.target.value)}
          placeholder="W"
          min="1"
        />
        <span className="admin-rich-text-editor__image-resize-sep">&times;</span>
        <input
          type="number"
          className="form-control form-control-sm"
          value={localH}
          onChange={(e) => setLocalH(e.target.value)}
          placeholder="H"
          min="1"
        />
        <button
          type="button"
          className="btn btn-sm btn-primary"
          onClick={() => onChange(localW || width, localH || height)}
          title="Apply size"
        >
          <Check className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary"
          onClick={onCancel}
          title="Cancel"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
      <button
        type="button"
        className="btn btn-sm btn-outline-danger"
        onClick={onDelete}
        title="Delete image"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
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
  const [imageAttrs, setImageAttrs] = useState<{
    width: string;
    height: string;
  } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: { rel: 'noopener noreferrer' },
      }),
      CustomImage,
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

  useEffect(() => {
    if (!editor) return;
    const handler = () => {
      if (editor.isActive('image')) {
        const a = editor.getAttributes('image');
        let w = a.width || '';
        let h = a.height || '';
        const img = editor.view.dom.querySelector(
          '.ProseMirror-selectednode',
        ) as HTMLImageElement | null;
        if (img && img.naturalWidth && img.naturalHeight) {
          if (!w) w = String(img.naturalWidth);
          if (!h) h = String(img.naturalHeight);
        }
        setImageAttrs({ width: w, height: h });
      } else {
        setImageAttrs(null);
      }
    };
    editor.on('selectionUpdate', handler);
    return () => {
      editor.off('selectionUpdate', handler);
    };
  }, [editor]);

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
        const { from } = editor.state.selection;
        const imgPos = from - 1;
        if (imgPos >= 0) {
          editor.commands.setTextSelection({ from: imgPos, to: from });
        }
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

  const handleImageResize = useCallback(
    (w: string, h: string) => {
      if (!editor) return;
      const payload: Record<string, string> = {};
      if (w) payload.width = w;
      if (h) payload.height = h;
      editor.chain().updateAttributes('image', payload).run();
      setImageAttrs(null);
    },
    [editor],
  );

  const handleImageDelete = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().deleteSelection().run();
  }, [editor]);

  return (
    <div className={className}>
      {label && <label className="form-label">{label}</label>}
      <div className="admin-rich-text-editor">
        <EditorToolbar editor={editor} uploading={uploading} onAddImage={addImage} onSetLink={setLink} />
        {imageAttrs && (
          <ImageResizeBar
            width={imageAttrs.width}
            height={imageAttrs.height}
            onChange={handleImageResize}
            onDelete={handleImageDelete}
            onCancel={() => setImageAttrs(null)}
          />
        )}
        <div className="admin-rich-text-editor__content" style={{ minHeight }}>
          <EditorContent editor={editor} />
        </div>
      </div>
      {hint && <p className="text-muted fs-12 mt-1 mb-0">{hint}</p>}
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="d-none" onChange={handleFilePicked} />
    </div>
  );
}

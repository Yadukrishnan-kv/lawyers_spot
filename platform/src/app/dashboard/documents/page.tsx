'use client';

import { useEffect, useState, useRef } from 'react';
import { FileText, Upload, Download, Trash2, File, Image, FileArchive, FileSpreadsheet } from 'lucide-react';
import { fetchDocuments, uploadDocument, deleteDocument } from '@/lib/user-auth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Document = {
  id: number;
  fileUrl: string;
  fileName: string;
  fileSize: number | null;
  mimeType: string | null;
  createdAt: string;
};

function formatSize(bytes: number | null): string {
  if (!bytes || bytes === 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileIcon(mimeType: string | null, fileName: string) {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
  if (mimeType?.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext))
    return <Image className="h-5 w-5" />;
  if (['pdf'].includes(ext)) return <FileText className="h-5 w-5" />;
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return <FileArchive className="h-5 w-5" />;
  if (['xls', 'xlsx', 'csv'].includes(ext)) return <FileSpreadsheet className="h-5 w-5" />;
  return <File className="h-5 w-5" />;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadDocs = () =>
    fetchDocuments()
      .then((data) => setDocuments(data.documents))
      .catch(() => {});

  useEffect(() => {
    loadDocs().finally(() => setLoading(false));
  }, []);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        await uploadDocument(file.name, base64, file.type);
        await loadDocs();
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setUploading(false);
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteDocument(id);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch {}
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-royal-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-950/40 dark:text-violet-300">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-navy-900 dark:text-white">Documents</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Upload and manage your legal documents</p>
          </div>
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileUpload}
            disabled={uploading}
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <Upload className="h-4 w-4" />
            {uploading ? 'Uploading…' : 'Upload Document'}
          </Button>
        </div>
      </div>

      {documents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-50 dark:bg-violet-950/30">
              <FileText className="h-6 w-6 text-violet-400" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-navy-900 dark:text-white">No documents uploaded yet</p>
              <p className="mt-1 text-xs text-slate-500">Upload case files, agreements, and other legal documents.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="divide-y divide-slate-100 dark:divide-navy-700">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex flex-wrap items-center gap-4 px-6 py-4 transition hover:bg-slate-50/50 dark:hover:bg-navy-800/30"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50 text-violet-600 dark:bg-violet-950/30 dark:text-violet-300">
                  {fileIcon(doc.mimeType, doc.fileName)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-navy-900 dark:text-white">
                    {doc.fileName}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatSize(doc.fileSize)} &middot; Uploaded {formatDate(doc.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="sm" asChild>
                    <a href={`/api/user/documents/${doc.id}/download`} download>
                      <Download className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(doc.id)}
                    className="text-red-500 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/30"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

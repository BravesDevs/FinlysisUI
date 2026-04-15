'use client';

import { useEffect, useState } from 'react';
import Papa from 'papaparse';
import { FileText, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { ImportBatch } from '@/lib/types';

// ---------------------------------------------------------------------------
// CSV preview
// ---------------------------------------------------------------------------

function CsvPreview({ url }: { url: string }) {
  const [rows, setRows] = useState<string[][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(url)
      .then((r) => r.text())
      .then((text) => {
        const result = Papa.parse<string[]>(text, { skipEmptyLines: true });
        setRows(result.data.slice(0, 51)); // header + up to 50 data rows
        setLoading(false);
      })
      .catch(() => {
        setError('Unable to load file preview.');
        setLoading(false);
      });
  }, [url]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="h-4 w-32 rounded-full bg-[var(--muted)] animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-[13px] font-sans text-[#991b1b] py-6 text-center" style={{ fontStyle: 'normal' }}>
        {error}
      </p>
    );
  }

  const headers = rows[0] ?? [];
  const dataRows = rows.slice(1);

  return (
    <div className="overflow-auto max-h-[480px] rounded-[8px] border border-[color:var(--border)]">
      <table className="min-w-full text-[12px] font-sans" style={{ fontStyle: 'normal' }}>
        <thead className="sticky top-0 bg-[var(--bg-page)]">
          <tr>
            {headers.map((h, i) => (
              <th
                key={i}
                className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--text-muted)] whitespace-nowrap border-b border-[color:var(--border)]"
                style={{ fontStyle: 'normal' }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dataRows.map((row, ri) => (
            <tr
              key={ri}
              className="border-b border-[color:var(--border)] hover:bg-[var(--bg-card-hover)] transition-colors"
            >
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  className="px-3 py-2 text-[12px] text-[var(--text-secondary)] whitespace-nowrap max-w-[200px] truncate"
                  style={{ fontStyle: 'normal' }}
                  title={cell}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length > 51 && (
        <p
          className="px-3 py-2 text-[12px] font-sans text-[var(--text-muted)]"
          style={{ fontStyle: 'normal' }}
        >
          Showing first 50 rows.
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// PDF preview
// ---------------------------------------------------------------------------

function PdfPreview({ url }: { url: string }) {
  return (
    <div className="rounded-[8px] overflow-hidden border border-[color:var(--border)]" style={{ height: 520 }}>
      <iframe src={url} className="w-full h-full" title="PDF Preview" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// FilePreviewModal
// ---------------------------------------------------------------------------

interface Props {
  batch: ImportBatch | null;
  onClose: () => void;
}

function getFileType(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
  if (ext === 'pdf') return 'pdf';
  if (ext === 'csv') return 'csv';
  return 'other';
}

export function FilePreviewModal({ batch, onClose }: Props) {
  const open = !!batch;
  const fileType = batch ? getFileType(batch.fileName) : 'other';

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="sm:max-w-4xl w-full"
        showCloseButton={false}
        style={{ maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
      >
        {/* Header */}
        <DialogHeader className="flex-shrink-0 flex flex-row items-center justify-between pb-3 border-b border-[color:var(--border)]">
          <div className="flex items-center gap-2">
            <FileText style={{ width: 16, height: 16, color: 'var(--color-azure)' }} />
            <DialogTitle
              className="text-[14px] font-medium font-sans text-[var(--text-primary)] truncate max-w-[480px]"
              style={{ fontStyle: 'normal' }}
            >
              {batch?.fileName ?? ''}
            </DialogTitle>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center size-7 rounded-[6px] text-[var(--text-muted)] hover:bg-[var(--muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X style={{ width: 14, height: 14 }} />
          </button>
        </DialogHeader>

        {/* Body */}
        <div className="flex-1 overflow-auto pt-4">
          {batch?.fileUrl ? (
            fileType === 'csv' ? (
              <CsvPreview url={batch.fileUrl} />
            ) : fileType === 'pdf' ? (
              <PdfPreview url={batch.fileUrl} />
            ) : (
              <div className="flex items-center justify-center h-48">
                <p
                  className="text-[13px] font-sans text-[var(--text-muted)]"
                  style={{ fontStyle: 'normal' }}
                >
                  Preview not available for this file type.
                </p>
              </div>
            )
          ) : (
            <div className="flex items-center justify-center h-48">
              <p
                className="text-[13px] font-sans text-[var(--text-muted)]"
                style={{ fontStyle: 'normal' }}
              >
                File not available.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

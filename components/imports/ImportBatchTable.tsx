'use client';

import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import {
  FileText,
  Eye,
  Download,
  AlertCircle,
  FolderOpen,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useImportBatchDetail } from '@/hooks/imports/useImportBatchDetail';
import type { ImportBatch, ImportStatus } from '@/lib/types';

// ---------------------------------------------------------------------------
// Formatters
// ---------------------------------------------------------------------------

function formatFileSize(bytes: number): string {
  if (bytes >= 1_048_576) return (bytes / 1_048_576).toFixed(2) + ' MB';
  return (bytes / 1024).toFixed(1) + ' KB';
}

function getFileType(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
  if (ext === 'csv') return 'CSV';
  if (ext === 'pdf') return 'PDF';
  if (ext === 'ofx' || ext === 'qfx') return 'OFX';
  return 'API';
}

// ---------------------------------------------------------------------------
// Badges
// ---------------------------------------------------------------------------

function TypeBadge({ fileName }: { fileName: string }) {
  const type = getFileType(fileName);
  const styles: Record<string, string> = {
    CSV: 'bg-[#e0f2fe] text-[#0369a1] border border-[#7dd3fc]',
    PDF: 'bg-[#fce7f3] text-[#9d174d] border border-[#f9a8d4]',
    OFX: 'bg-[#ede9fe] text-[#6d28d9] border border-[#c4b5fd]',
    API: 'bg-[#dcfce7] text-[#166534] border border-[#86efac]',
  };
  return (
    <span
      className={`inline-flex items-center rounded-[99px] px-[10px] py-[2px] text-[11px] font-medium font-sans ${styles[type] ?? styles.API}`}
      style={{ fontStyle: 'normal' }}
    >
      {type}
    </span>
  );
}

function StatusBadge({ status }: { status: ImportStatus }) {
  const configs: Record<ImportStatus, { label: string; classes: string; pulse: boolean }> = {
    PROCESSING: {
      label: 'Processing…',
      classes: 'bg-[#fef3c7] text-[#92400e] border border-[#fcd34d]',
      pulse: true,
    },
    COMPLETED: {
      label: 'Completed',
      classes: 'bg-[#dcfce7] text-[#166534] border border-[#86efac]',
      pulse: false,
    },
    FAILED: {
      label: 'Failed',
      classes: 'bg-[#fee2e2] text-[#991b1b] border border-[#fca5a5]',
      pulse: false,
    },
    PENDING: {
      label: 'Pending',
      classes: 'bg-[#f3f4f6] text-[#6b7280] border border-[#d1d5db]',
      pulse: false,
    },
  };

  const cfg = configs[status] ?? configs.PENDING;
  const dotColor =
    status === 'PROCESSING'
      ? '#92400e'
      : status === 'COMPLETED'
        ? '#166534'
        : status === 'FAILED'
          ? '#991b1b'
          : '#6b7280';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-[99px] px-[10px] py-[2px] text-[11px] font-medium font-sans ${cfg.classes}`}
      style={{ fontStyle: 'normal' }}
    >
      {cfg.pulse && (
        <span
          className="size-2 rounded-full flex-shrink-0"
          style={{
            backgroundColor: dotColor,
            animation: 'pulse-dot 1s ease-in-out infinite',
          }}
        />
      )}
      {cfg.label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Skeleton rows
// ---------------------------------------------------------------------------

const SKELETON_COLS = [
  ['w-28', 'w-16', 'w-20', 'w-32', 'w-28', 'w-36'],
  ['w-36', 'w-16', 'w-24', 'w-28', 'w-24', 'w-36'],
  ['w-24', 'w-12', 'w-20', 'w-24', 'w-32', 'w-36'],
  ['w-32', 'w-16', 'w-16', 'w-36', 'w-24', 'w-36'],
  ['w-28', 'w-16', 'w-20', 'w-28', 'w-28', 'w-36'],
  ['w-36', 'w-12', 'w-24', 'w-24', 'w-32', 'w-36'],
  ['w-24', 'w-16', 'w-20', 'w-28', 'w-24', 'w-36'],
  ['w-32', 'w-16', 'w-16', 'w-32', 'w-28', 'w-36'],
];

function SkeletonRow({ widths }: { widths: string[] }) {
  return (
    <TableRow className="border-b border-[color:var(--border)]">
      {widths.map((w, i) => (
        <TableCell key={i} className="py-3.5">
          <div className={`h-3.5 rounded-full bg-[var(--muted)] animate-pulse ${w}`} />
        </TableCell>
      ))}
    </TableRow>
  );
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function EmptyState() {
  return (
    <TableRow>
      <TableCell colSpan={6}>
        <div className="flex flex-col items-center justify-center min-h-[320px] gap-3 py-12">
          <FolderOpen
            className="text-[var(--text-muted)]"
            style={{ width: 48, height: 48 }}
            strokeWidth={1.5}
          />
          <p
            className="text-[16px] font-medium font-sans text-[var(--text-primary)]"
            style={{ fontStyle: 'normal' }}
          >
            No imports yet
          </p>
          <p
            className="text-[14px] font-sans text-[var(--text-muted)] text-center max-w-xs"
            style={{ fontStyle: 'normal' }}
          >
            Upload a CSV file to start importing your transactions.
          </p>
        </div>
      </TableCell>
    </TableRow>
  );
}

// ---------------------------------------------------------------------------
// Error log sheet
// ---------------------------------------------------------------------------

function ErrorLogSheet({
  batchId,
  open,
  onOpenChange,
}: {
  batchId: string | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { data, isLoading } = useImportBatchDetail(open ? batchId : null);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="pb-4 border-b border-[color:var(--border)]">
          <SheetTitle
            className="text-[15px] font-semibold font-sans text-[var(--text-primary)]"
            style={{ fontStyle: 'normal' }}
          >
            Import Errors
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4 px-1">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 rounded-lg bg-[var(--muted)] animate-pulse" />
              ))}
            </div>
          ) : !data?.errorLog?.length ? (
            <p className="text-[13px] font-sans text-[var(--text-muted)]" style={{ fontStyle: 'normal' }}>
              No errors found.
            </p>
          ) : (
            <ul className="space-y-2">
              {data.errorLog.map((err, i) => (
                <li
                  key={i}
                  className="rounded-[8px] border border-[#fca5a5] bg-[#fff7f7] px-3 py-2.5"
                >
                  <span
                    className="text-[11px] font-medium font-sans text-[#991b1b] uppercase tracking-wide"
                    style={{ fontStyle: 'normal' }}
                  >
                    Row {err.row}
                  </span>
                  <p
                    className="text-[13px] font-sans text-[var(--text-primary)] mt-0.5"
                    style={{ fontStyle: 'normal' }}
                  >
                    {err.reason}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ---------------------------------------------------------------------------
// Batch row
// ---------------------------------------------------------------------------

function BatchRow({
  batch,
  onPreview,
}: {
  batch: ImportBatch;
  onPreview: (batch: ImportBatch) => void;
}) {
  const [errorSheetOpen, setErrorSheetOpen] = useState(false);
  const canPreview = batch.fileUploadStatus === 'UPLOADED';

  return (
    <>
      <TableRow className="border-b border-[color:var(--border)] hover:bg-[var(--bg-card-hover)] transition-colors duration-100">
        {/* File */}
        <TableCell className="py-3.5">
          <div className="flex items-start gap-2">
            <FileText
              className="flex-shrink-0 mt-0.5"
              style={{ width: 16, height: 16, color: 'var(--color-azure)' }}
            />
            <div className="min-w-0">
              <p
                className="text-[14px] font-medium font-sans text-[var(--text-primary)] truncate max-w-[220px]"
                style={{ fontStyle: 'normal' }}
                title={batch.fileName}
              >
                {batch.fileName.length > 36 ? batch.fileName.slice(0, 36) + '…' : batch.fileName}
              </p>
              <p
                className="text-[12px] font-sans text-[var(--text-muted)] mt-0.5"
                style={{ fontStyle: 'normal' }}
              >
                {formatFileSize(batch.fileSizeBytes)}
              </p>
            </div>
          </div>
        </TableCell>

        {/* Type */}
        <TableCell className="py-3.5">
          <TypeBadge fileName={batch.fileName} />
        </TableCell>

        {/* Status */}
        <TableCell className="py-3.5">
          <StatusBadge status={batch.status} />
        </TableCell>

        {/* Rows */}
        <TableCell className="py-3.5">
          <span
            className="text-[13px] font-sans text-[var(--text-primary)]"
            style={{ fontStyle: 'normal' }}
          >
            {batch.successCount} / {batch.rowCount} imported
          </span>
          {batch.skippedCount > 0 && (
            <span
              className="text-[13px] font-sans text-[var(--text-muted)] ml-1"
              style={{ fontStyle: 'normal' }}
            >
              ({batch.skippedCount} skipped)
            </span>
          )}
          {batch.errorCount > 0 && (
            <span
              className="text-[13px] font-sans text-[#991b1b] ml-1"
              style={{ fontStyle: 'normal' }}
            >
              ({batch.errorCount} errors)
            </span>
          )}
        </TableCell>

        {/* Uploaded */}
        <TableCell className="py-3.5">
          <span
            className="text-[13px] font-sans text-[var(--text-muted)] whitespace-nowrap"
            style={{ fontStyle: 'normal' }}
          >
            {format(parseISO(batch.startedAt), 'MMM dd, yyyy hh:mm a')}
          </span>
        </TableCell>

        {/* Actions */}
        <TableCell className="py-3.5">
          <div className="flex items-center gap-3 justify-end">
            {/* Preview */}
            {canPreview ? (
              <button
                type="button"
                onClick={() => onPreview(batch)}
                className="inline-flex items-center gap-1 text-[13px] font-medium font-sans hover:opacity-70 transition-opacity"
                style={{ fontStyle: 'normal', color: 'var(--color-azure)' }}
              >
                <Eye style={{ width: 14, height: 14 }} />
                Preview
              </button>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    className="inline-flex items-center gap-1 text-[13px] font-medium font-sans opacity-35 cursor-not-allowed"
                    style={{ fontStyle: 'normal', color: 'var(--color-azure)' }}
                  >
                    <Eye style={{ width: 14, height: 14 }} />
                    Preview
                  </span>
                </TooltipTrigger>
                <TooltipContent>File not yet available.</TooltipContent>
              </Tooltip>
            )}

            {/* Download */}
            {batch.fileUrl && (
              <a
                href={batch.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[13px] font-medium font-sans text-[var(--text-secondary)] hover:opacity-70 transition-opacity"
                style={{ fontStyle: 'normal' }}
              >
                <Download style={{ width: 14, height: 14 }} />
                Download
              </a>
            )}

            {/* Errors */}
            {batch.errorCount > 0 && (
              <button
                type="button"
                onClick={() => setErrorSheetOpen(true)}
                className="inline-flex items-center gap-1 text-[13px] font-medium font-sans text-[#991b1b] hover:opacity-70 transition-opacity"
                style={{ fontStyle: 'normal' }}
              >
                <AlertCircle style={{ width: 14, height: 14 }} />
                Errors
              </button>
            )}
          </div>
        </TableCell>
      </TableRow>

      <ErrorLogSheet
        batchId={batch.id}
        open={errorSheetOpen}
        onOpenChange={setErrorSheetOpen}
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// ImportBatchTable
// ---------------------------------------------------------------------------

interface Props {
  batches: ImportBatch[] | undefined;
  isLoading: boolean;
  onPreview: (batch: ImportBatch) => void;
}

export function ImportBatchTable({ batches, isLoading, onPreview }: Props) {
  const COLUMNS = ['File', 'Type', 'Status', 'Rows', 'Uploaded', 'Actions'];

  return (
    <>
      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
      <Table>
        <TableHeader>
          <TableRow className="bg-[var(--bg-page)] border-b-2 border-[color:var(--border-strong)]">
            {COLUMNS.map((col) => (
              <TableHead
                key={col}
                className={[
                  'py-3 text-[12px] font-semibold font-sans uppercase tracking-[0.06em] text-[var(--text-muted)]',
                  col === 'Actions' ? 'text-right' : '',
                ].join(' ')}
                style={{ fontStyle: 'normal' }}
              >
                {col}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading ? (
            SKELETON_COLS.map((widths, i) => <SkeletonRow key={i} widths={widths} />)
          ) : !batches?.length ? (
            <EmptyState />
          ) : (
            batches.map((batch) => (
              <BatchRow key={batch.id} batch={batch} onPreview={onPreview} />
            ))
          )}
        </TableBody>
      </Table>
    </>
  );
}

'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X, ChevronDown } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useAccountBalances } from '@/hooks/dashboard/useAccountBalances';
import { useUploadImport } from '@/hooks/imports/useUploadImport';

// ---------------------------------------------------------------------------
// File type validation
// ---------------------------------------------------------------------------

const ACCEPTED_TYPES: Record<string, string[]> = {
  'text/csv': ['.csv'],
  'application/pdf': ['.pdf'],
  'application/x-ofx': ['.ofx'],
  'application/vnd.intu.qfx': ['.qfx'],
};

function formatFileSize(bytes: number): string {
  if (bytes >= 1_048_576) return (bytes / 1_048_576).toFixed(2) + ' MB';
  return (bytes / 1024).toFixed(1) + ' KB';
}

// ---------------------------------------------------------------------------
// ImportDrawer
// ---------------------------------------------------------------------------

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function ImportDrawer({ open, onOpenChange }: Props) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');

  const { data: accountsData, isLoading: accountsLoading } = useAccountBalances();
  const accounts = accountsData?.accounts ?? [];

  const { mutate: upload, isPending } = useUploadImport(() => {
    // On success: close drawer and reset state
    setSelectedFile(null);
    setSelectedAccountId('');
    onOpenChange(false);
  });

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted.length > 0) setSelectedFile(accepted[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: 10 * 1024 * 1024, // 10 MB
    multiple: false,
  });

  function handleSubmit() {
    if (!selectedFile || !selectedAccountId) return;
    upload({ file: selectedFile, bankAccountId: selectedAccountId });
  }

  function handleClose() {
    if (isPending) return;
    setSelectedFile(null);
    setSelectedAccountId('');
    onOpenChange(false);
  }

  const canSubmit = !!selectedFile && !!selectedAccountId && !isPending;

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col">
        <SheetHeader className="pb-4 border-b border-[color:var(--border)]">
          <SheetTitle
            className="text-[15px] font-semibold font-sans text-[var(--text-primary)]"
            style={{ fontStyle: 'normal' }}
          >
            Import Transactions
          </SheetTitle>
          <p
            className="text-[13px] font-sans text-[var(--text-muted)] mt-1"
            style={{ fontStyle: 'normal' }}
          >
            Upload a CSV, PDF, or OFX file exported from your bank.
          </p>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-5 space-y-5">
          {/* Drop zone */}
          <div>
            <label
              className="block text-[12px] font-medium font-sans text-[var(--text-secondary)] mb-2 uppercase tracking-wide"
              style={{ fontStyle: 'normal' }}
            >
              File
            </label>
            <div
              {...getRootProps()}
              className={[
                'relative flex flex-col items-center justify-center rounded-[12px] border-2 border-dashed px-6 py-10 cursor-pointer transition-colors',
                isDragActive
                  ? 'border-[var(--color-azure)] bg-[#f0fafd]'
                  : selectedFile
                    ? 'border-[var(--color-azure)] bg-[#f0fafd]'
                    : 'border-[color:var(--border-strong)] bg-[var(--bg-page)] hover:border-[var(--color-azure)] hover:bg-[#f0fafd]',
              ].join(' ')}
            >
              <input {...getInputProps()} />

              {selectedFile ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center gap-2">
                    <FileText
                      style={{ width: 20, height: 20, color: 'var(--color-azure)' }}
                    />
                    <span
                      className="text-[14px] font-medium font-sans text-[var(--text-primary)] truncate max-w-[220px]"
                      style={{ fontStyle: 'normal' }}
                    >
                      {selectedFile.name}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                      }}
                      className="flex-shrink-0 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                    >
                      <X style={{ width: 14, height: 14 }} />
                    </button>
                  </div>
                  <span
                    className="text-[12px] font-sans text-[var(--text-muted)]"
                    style={{ fontStyle: 'normal' }}
                  >
                    {formatFileSize(selectedFile.size)}
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div
                    className="flex items-center justify-center size-11 rounded-full"
                    style={{ background: 'rgba(58,180,232,0.1)' }}
                  >
                    <Upload style={{ width: 20, height: 20, color: 'var(--color-azure)' }} />
                  </div>
                  <div className="text-center">
                    <p
                      className="text-[14px] font-medium font-sans text-[var(--text-primary)]"
                      style={{ fontStyle: 'normal' }}
                    >
                      {isDragActive ? 'Drop your file here' : 'Drag & drop or click to upload'}
                    </p>
                    <p
                      className="text-[12px] font-sans text-[var(--text-muted)] mt-1"
                      style={{ fontStyle: 'normal' }}
                    >
                      CSV, PDF, OFX — max 10 MB
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Account selector */}
          <div>
            <label
              className="block text-[12px] font-medium font-sans text-[var(--text-secondary)] mb-2 uppercase tracking-wide"
              style={{ fontStyle: 'normal' }}
            >
              Bank Account
            </label>
            <div className="relative">
              <select
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                disabled={accountsLoading}
                className={[
                  'w-full appearance-none rounded-[10px] border border-[color:var(--border)] bg-[var(--bg-card)] px-3 py-2.5 pr-8',
                  'text-[14px] font-sans text-[var(--text-primary)] outline-none',
                  'focus:border-[var(--color-azure)] focus:ring-2 focus:ring-[rgba(58,180,232,0.15)]',
                  'transition-colors',
                  accountsLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
                  !selectedAccountId ? 'text-[var(--text-muted)]' : '',
                ].join(' ')}
                style={{ fontStyle: 'normal' }}
              >
                <option value="" disabled>
                  {accountsLoading ? 'Loading accounts…' : 'Select an account'}
                </option>
                {accounts.map((acc) => {
                  const label =
                    acc.nickname ??
                    acc.accountNumberMasked ??
                    acc.accountType.label;
                  const bank = acc.bank.name ? ` · ${acc.bank.name}` : '';
                  return (
                    <option key={acc.id} value={acc.id}>
                      {label}{bank}
                    </option>
                  );
                })}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                style={{ width: 14, height: 14 }}
              />
            </div>
          </div>

          {/* CSV format hint */}
          <div className="rounded-[10px] bg-[rgba(58,180,232,0.06)] border border-[rgba(58,180,232,0.18)] px-4 py-3">
            <p
              className="text-[12px] font-medium font-sans text-[var(--color-deep)] mb-1"
              style={{ fontStyle: 'normal' }}
            >
              Supported CSV columns
            </p>
            <p
              className="text-[11px] font-sans text-[var(--text-muted)] leading-relaxed"
              style={{ fontStyle: 'normal' }}
            >
              Date, Description, Amount — or separate Debit / Credit columns. Balance and Reference
              columns are optional. Headers are auto-detected (case-insensitive).
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 pt-4 border-t border-[color:var(--border)] flex items-center gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={isPending}
            className="flex-1 rounded-[10px] border border-[color:var(--border)] bg-transparent px-4 py-2.5 text-[14px] font-medium font-sans text-[var(--text-secondary)] hover:bg-[var(--muted)] transition-colors disabled:opacity-50"
            style={{ fontStyle: 'normal' }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="flex-1 rounded-[10px] grad-button px-4 py-2.5 text-[14px] font-medium font-sans text-white hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
            style={{ fontStyle: 'normal' }}
          >
            {isPending ? 'Uploading…' : 'Import'}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

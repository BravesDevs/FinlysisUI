'use client';

import { useState } from 'react';
import { Upload } from 'lucide-react';
import { useImportBatches } from '@/hooks/imports/useImportBatches';
import { ImportBatchTable } from '@/components/imports/ImportBatchTable';
import { FilePreviewModal } from '@/components/imports/FilePreviewModal';
import { ImportDrawer } from '@/components/imports/ImportDrawer';
import type { ImportBatch } from '@/lib/types';

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ImportPage() {
  const { data: batches, isLoading } = useImportBatches();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [previewBatch, setPreviewBatch] = useState<ImportBatch | null>(null);

  return (
    <div className="flex flex-col min-h-full bg-[var(--bg-page)]" style={{ fontStyle: 'normal' }}>
      {/* Page header */}
      <header className="grad-hero border-b border-[color:var(--border)] px-8 py-5 flex items-start justify-between">
        <div>
          <h1
            className="font-heading font-bold text-[32px] tracking-[-0.02em] leading-tight text-[var(--color-ink)]"
            style={{ fontStyle: 'normal' }}
          >
            Imports
          </h1>
          <p
            className="text-[14px] font-sans text-[var(--text-muted)] mt-0.5"
            style={{ fontStyle: 'normal' }}
          >
            Upload bank statements to sync your transactions
          </p>
        </div>

        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="inline-flex items-center gap-2 rounded-[10px] grad-button px-4 py-2.5 text-[14px] font-medium font-sans text-white hover:brightness-110 active:scale-[0.98] transition-all mt-1"
          style={{ fontStyle: 'normal' }}
        >
          <Upload style={{ width: 15, height: 15 }} />
          Import File
        </button>
      </header>

      {/* Table */}
      <div className="flex-1 px-8 py-6">
        <div className="rounded-[12px] bg-[var(--bg-card)] shadow-card overflow-hidden">
          <ImportBatchTable
            batches={batches}
            isLoading={isLoading}
            onPreview={setPreviewBatch}
          />
        </div>
      </div>

      {/* Modals / Drawers */}
      <FilePreviewModal
        batch={previewBatch}
        onClose={() => setPreviewBatch(null)}
      />
      <ImportDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
    </div>
  );
}

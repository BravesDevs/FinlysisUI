'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface UploadImportPayload {
  file: File;
  bankAccountId: string;
}

export function useUploadImport(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, bankAccountId }: UploadImportPayload) => {
      const form = new FormData();
      form.append('file', file);
      form.append('bankAccountId', bankAccountId);
      const res = await api.post<{ importBatchId: string }>('/import/transactions', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['import', 'batches'] });
      onSuccess?.();
      toast.success("Import started. We'll process your file shortly.");
    },
    onError: () => {
      toast.error('Upload failed. Please check your file and try again.');
    },
  });
}

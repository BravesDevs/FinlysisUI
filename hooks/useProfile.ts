'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, type SafeUser } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';

interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: string;
}

export function useProfile() {
  const accessToken = useAuthStore((s) => s.accessToken);

  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await api.get<SafeUser>('/profile');
      return res.data;
    },
    enabled: !!accessToken,
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: UpdateProfileDto) => {
      const res = await api.patch<SafeUser>('/profile', dto);
      return res.data;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(['profile'], updated);
    },
  });
}

import { useQuery } from '@tanstack/react-query';
import type { PublicUserDTO } from '@/core/user/types';

export function useCurrentUser() {
  return useQuery<PublicUserDTO>({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await fetch('/api/auth/me');
      if (!response.ok) {
        throw new Error('Failed to fetch user session');
      }
      const json = await response.json();
      return json.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

import { useQuery } from '@tanstack/react-query';
import type { ICurrentUser } from '@forge/shared-types';
import { API_CONFIG } from '../config/api';

export function useCurrentUser() {
  return useQuery<ICurrentUser>({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await fetch(API_CONFIG.endpoints.me, {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch user session');
      }
      const json = await response.json();
      return json.data;
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

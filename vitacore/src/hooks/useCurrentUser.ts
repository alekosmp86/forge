import { useQuery } from '@tanstack/react-query';
import type { ICurrentUser } from '@forge/shared-types';

export function useCurrentUser() {
  return useQuery<ICurrentUser>({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const token = localStorage.getItem('forge_auth_token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/auth/me', { headers });
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

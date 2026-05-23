import { useAuth } from '@clerk/react';

export function useApiFetch() {
  const { getToken } = useAuth();

  return async function apiFetch(url, options = {}) {
    const token = await getToken();
    return fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
      },
    });
  };
}

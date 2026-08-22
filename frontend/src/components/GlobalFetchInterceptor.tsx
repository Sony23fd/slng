"use client";

import { useEffect } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { useRouter } from 'next/navigation';

export default function GlobalFetchInterceptor() {
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();

  useEffect(() => {
    const originalFetch = window.fetch;

    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        
        // If 401 Unauthorized occurs, logout and redirect
        if (response.status === 401) {
          console.warn('401 Unauthorized detected. Logging out...');
          logout();
          router.push('/login');
        }
        
        return response;
      } catch (error) {
        throw error;
      }
    };

    return () => {
      // Restore original fetch on unmount
      window.fetch = originalFetch;
    };
  }, [logout, router]);

  return null;
}

"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../stores/useAuthStore';

export default function Home() {
  const { user, token, hasHydrated } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (hasHydrated) {
      if (!token || !user) {
        router.push('/login');
      } else {
        if (user.role === 'SALES') {
          router.push('/sales');
        } else if (user.role === 'PRODUCTION') {
          router.push('/admin/production');
        } else {
          router.push('/admin');
        }
      }
    }
  }, [token, user, router, hasHydrated]);

  if (!mounted || !hasHydrated || (!token && hasHydrated)) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f8fafc', color: '#64748b' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔄</div>
          <h2>Мэдээлэл шалгаж байна...</h2>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <p>Түр хүлээнэ үү...</p>
    </div>
  );
}

"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../stores/useAuthStore';

export default function Home() {
  const { user, token } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!token || !user) {
      router.push('/login');
    } else {
      if (user.role === 'SALES') {
        router.push('/sales');
      } else {
        router.push('/admin');
      }
    }
  }, [token, user, router]);

  if (!mounted) return null;

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <p>Түр хүлээнэ үү...</p>
    </div>
  );
}

"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../stores/useAuthStore';

export default function SalesLayout({ children }: { children: React.ReactNode }) {
  const { user, token, logout } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!token || !user || user.role !== 'SALES') {
      router.push('/login');
    }
  }, [token, user, router]);

  if (!mounted || !user || user.role !== 'SALES') return null;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-color)' }}>
      {/* Sidebar */}
      <aside style={{ width: '250px', background: 'var(--surface-color)', borderRight: '1px solid var(--border-color)', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-color)', marginBottom: '2rem' }}>Mini-ERP (Борлуулалт)</h2>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          <Link href="/sales" style={{ padding: '0.75rem', borderRadius: '0.5rem', background: '#f8fafc', fontWeight: 600, textDecoration: 'none', color: '#334155' }}>📊 Хянах самбар</Link>
          <Link href="/sales/orders/new" style={{ padding: '0.75rem', borderRadius: '0.5rem', background: '#f8fafc', fontWeight: 600, textDecoration: 'none', color: '#334155' }}>📝 Шинэ захиалга</Link>
          <Link href="/sales/orders" style={{ padding: '0.75rem', borderRadius: '0.5rem', background: '#f8fafc', fontWeight: 600, textDecoration: 'none', color: '#334155' }}>📋 Миний захиалгууд</Link>
          <Link href="/sales/profile" style={{ padding: '0.75rem', borderRadius: '0.5rem', background: '#f8fafc', fontWeight: 600, textDecoration: 'none', color: '#334155' }}>⚙️ Хувийн тохиргоо</Link>
        </nav>

        <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
          <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{user.name} ({user.role})</div>
          <button onClick={() => { logout(); router.push('/login'); }} className="btn btn-outline" style={{ width: '100%' }}>Гарах</button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
}

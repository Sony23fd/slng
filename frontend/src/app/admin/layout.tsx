"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../stores/useAuthStore';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, token, logout } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!token || !user) {
      router.push('/login');
    }
  }, [token, user, router]);

  if (!mounted || !user) return null;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-color)' }}>
      {/* Sidebar */}
      <aside style={{ width: '250px', background: 'var(--surface-color)', borderRight: '1px solid var(--border-color)', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-color)', marginBottom: '2rem' }}>Mini-ERP Admin</h2>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          <Link href="/admin" style={{ padding: '0.75rem', borderRadius: '0.5rem', background: '#f8fafc', fontWeight: 600 }}>📊 Хянах самбар (Dashboard)</Link>
          
          {(user.role === 'ADMIN' || user.role === 'FINANCE') && (
            <Link href="/admin/prices" style={{ padding: '0.75rem', borderRadius: '0.5rem', background: '#f8fafc', fontWeight: 600 }}>💰 Мастер үнэ</Link>
          )}
          
          {user.role === 'ADMIN' && (
            <>
              <Link href="/admin/users" style={{ padding: '0.75rem', borderRadius: '0.5rem', background: '#f8fafc', fontWeight: 600 }}>👥 Хэрэглэгчид</Link>
              <Link href="/admin/customers" style={{ padding: '0.75rem', borderRadius: '0.5rem', background: '#f8fafc', fontWeight: 600, marginTop: '0.5rem' }}>🤝 Харилцагчид</Link>
              <Link href="/admin/templates" style={{ padding: '0.75rem', borderRadius: '0.5rem', background: '#f8fafc', fontWeight: 600, marginTop: '0.5rem' }}>📄 Бэлэн загвар</Link>
              <div style={{ padding: '0.75rem', borderRadius: '0.5rem', background: '#f8fafc', fontWeight: 600, marginTop: '0.5rem' }}>⚙️ Динамик жагсаалт</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', paddingLeft: '1.5rem', marginTop: '-0.25rem' }}>
                <Link href="/admin/settings?type=CATEGORY" style={{ padding: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)', textDecoration: 'none' }}>- Бүтээгдэхүүний ангилал</Link>
                <Link href="/admin/settings?type=SIZE" style={{ padding: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)', textDecoration: 'none' }}>- Бүтээгдэхүүний хэмжээ</Link>
                <Link href="/admin/settings?type=COVER_COLOR" style={{ padding: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)', textDecoration: 'none' }}>- Хавтасны өнгө</Link>
                <Link href="/admin/settings?type=INNER_COLOR" style={{ padding: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)', textDecoration: 'none' }}>- Дотор өнгө</Link>
                <Link href="/admin/settings?type=PAYMENT_METHOD" style={{ padding: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)', textDecoration: 'none' }}>- Төлбөрийн хэлбэр</Link>
                <Link href="/admin/settings?type=NEXT_PROCESS" style={{ padding: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)', textDecoration: 'none' }}>- Дараагийн процесс</Link>
                <Link href="/admin/settings?type=OUTSOURCED_JOB" style={{ padding: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)', textDecoration: 'none' }}>- Гадуур ажлын нэр</Link>
                <Link href="/admin/settings?type=OUTSOURCED_CONTRACTOR" style={{ padding: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)', textDecoration: 'none' }}>- Гүйцэтгэгч байгууллага</Link>
                <div style={{ padding: '0.75rem', borderRadius: '0.5rem', background: '#f8fafc', fontWeight: 600, marginTop: '0.5rem', marginLeft: '-1.5rem' }}>⚙️ Үндсэн тохиргоо</div>
                <Link href="/admin/settings?type=ORDER_START_SEQ" style={{ padding: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)', textDecoration: 'none' }}>- Захиалгын эхлэх дугаар</Link>
                <Link href="/admin/settings?type=DEFAULT_PROFIT_MARGIN" style={{ padding: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)', textDecoration: 'none' }}>- Үндсэн ашгийн хувь</Link>
                <Link href="/admin/settings?type=DEFAULT_DEPOSIT_PERCENT" style={{ padding: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)', textDecoration: 'none' }}>- Урьдчилгаа төлбөр (%)</Link>
              </div>
            </>
          )}
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

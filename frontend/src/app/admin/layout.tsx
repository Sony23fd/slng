"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../stores/useAuthStore';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, token, logout } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

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
      <aside style={{
        width: collapsed ? '65px' : '220px',
        transition: 'width 0.25s ease',
        background: 'var(--surface-color)',
        borderRight: '1px solid var(--border-color)',
        padding: collapsed ? '1rem 0.5rem' : '1.25rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', justifyContent: collapsed ? 'center' : 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          {!collapsed && <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary-color)', margin: 0, whiteSpace: 'nowrap' }}>Mini-ERP Admin</h2>}
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? 'Цэс дэлгэх' : 'Цэс хумих'}
            style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '0.375rem', cursor: 'pointer', padding: '0.25rem 0.5rem', fontSize: '0.85rem' }}
          >
            {collapsed ? '▶' : '◀'}
          </button>
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1, overflowY: 'auto' }}>
          <Link href="/admin" title="Хянах самбар" style={{ padding: '0.6rem', borderRadius: '0.375rem', background: '#f8fafc', fontWeight: 600, textDecoration: 'none', color: '#334155', display: 'flex', alignItems: 'center', gap: '0.75rem', whiteSpace: 'nowrap', overflow: 'hidden' }}>
            <span style={{ fontSize: '1.1rem' }}>📊</span>
            {!collapsed && <span>Хянах самбар</span>}
          </Link>

          <Link href="/admin/production" title="Үйлдвэрлэл хяналт" style={{ padding: '0.6rem', borderRadius: '0.375rem', background: '#f8fafc', fontWeight: 600, textDecoration: 'none', color: '#334155', display: 'flex', alignItems: 'center', gap: '0.75rem', whiteSpace: 'nowrap', overflow: 'hidden', marginTop: '0.25rem' }}>
            <span style={{ fontSize: '1.1rem' }}>🏭</span>
            {!collapsed && <span>Үйлдвэрлэл хяналт</span>}
          </Link>
          
          {(user.role === 'ADMIN' || user.role === 'FINANCE') && (
            <Link href="/admin/prices" title="Мастер үнэ" style={{ padding: '0.6rem', borderRadius: '0.375rem', background: '#f8fafc', fontWeight: 600, textDecoration: 'none', color: '#334155', display: 'flex', alignItems: 'center', gap: '0.75rem', whiteSpace: 'nowrap', overflow: 'hidden' }}>
              <span style={{ fontSize: '1.1rem' }}>💰</span>
              {!collapsed && <span>Мастер үнэ</span>}
            </Link>
          )}
          
          {user.role === 'ADMIN' && (
            <>
              <Link href="/admin/users" title="Хэрэглэгчид" style={{ padding: '0.6rem', borderRadius: '0.375rem', background: '#f8fafc', fontWeight: 600, textDecoration: 'none', color: '#334155', display: 'flex', alignItems: 'center', gap: '0.75rem', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                <span style={{ fontSize: '1.1rem' }}>👥</span>
                {!collapsed && <span>Хэрэглэгчид</span>}
              </Link>
              <Link href="/admin/customers" title="Харилцагчид" style={{ padding: '0.6rem', borderRadius: '0.375rem', background: '#f8fafc', fontWeight: 600, textDecoration: 'none', color: '#334155', display: 'flex', alignItems: 'center', gap: '0.75rem', whiteSpace: 'nowrap', overflow: 'hidden', marginTop: '0.25rem' }}>
                <span style={{ fontSize: '1.1rem' }}>🤝</span>
                {!collapsed && <span>Харилцагчид</span>}
              </Link>
              <Link href="/admin/templates" title="Бэлэн загвар" style={{ padding: '0.6rem', borderRadius: '0.375rem', background: '#f8fafc', fontWeight: 600, textDecoration: 'none', color: '#334155', display: 'flex', alignItems: 'center', gap: '0.75rem', whiteSpace: 'nowrap', overflow: 'hidden', marginTop: '0.25rem' }}>
                <span style={{ fontSize: '1.1rem' }}>📄</span>
                {!collapsed && <span>Бэлэн загвар</span>}
              </Link>
              <Link href="/admin/product-categories" title="Бүтээгдэхүүний төрөл" style={{ padding: '0.6rem', borderRadius: '0.375rem', background: '#f8fafc', fontWeight: 600, textDecoration: 'none', color: '#334155', display: 'flex', alignItems: 'center', gap: '0.75rem', whiteSpace: 'nowrap', overflow: 'hidden', marginTop: '0.25rem' }}>
                <span style={{ fontSize: '1.1rem' }}>📦</span>
                {!collapsed && <span>Төрөл</span>}
              </Link>
              <Link href="/admin/cover-rules" title="Хавтасны дүрмүүд" style={{ padding: '0.6rem', borderRadius: '0.375rem', background: '#f8fafc', fontWeight: 600, textDecoration: 'none', color: '#334155', display: 'flex', alignItems: 'center', gap: '0.75rem', whiteSpace: 'nowrap', overflow: 'hidden', marginTop: '0.25rem' }}>
                <span style={{ fontSize: '1.1rem' }}>📐</span>
                {!collapsed && <span>Хавтасны дүрэм</span>}
              </Link>
              <Link href="/admin/formulas" title="Тооцооллын томъёо" style={{ padding: '0.6rem', borderRadius: '0.375rem', background: '#f8fafc', fontWeight: 600, textDecoration: 'none', color: '#334155', display: 'flex', alignItems: 'center', gap: '0.75rem', whiteSpace: 'nowrap', overflow: 'hidden', marginTop: '0.25rem' }}>
                <span style={{ fontSize: '1.1rem' }}>🧮</span>
                {!collapsed && <span>Томъёо</span>}
              </Link>
              
              {!collapsed && (
                <>
                  <div style={{ padding: '0.5rem', borderRadius: '0.375rem', background: '#f1f5f9', fontWeight: 600, marginTop: '0.5rem', fontSize: '0.85rem' }}>⚙️ Динамик жагсаалт</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem', paddingLeft: '0.75rem' }}>
                    <Link href="/admin/settings?type=CATEGORY" style={{ padding: '0.35rem', fontSize: '0.85rem', color: 'var(--text-secondary)', textDecoration: 'none' }}>- Ангилал</Link>
                    <Link href="/admin/settings?type=SIZE" style={{ padding: '0.35rem', fontSize: '0.85rem', color: 'var(--text-secondary)', textDecoration: 'none' }}>- Хэмжээ</Link>
                    <Link href="/admin/settings?type=COVER_COLOR" style={{ padding: '0.35rem', fontSize: '0.85rem', color: 'var(--text-secondary)', textDecoration: 'none' }}>- Хавтас өнгө</Link>
                    <Link href="/admin/settings?type=INNER_COLOR" style={{ padding: '0.35rem', fontSize: '0.85rem', color: 'var(--text-secondary)', textDecoration: 'none' }}>- Дотор өнгө</Link>
                    <Link href="/admin/settings?type=PAYMENT_METHOD" style={{ padding: '0.35rem', fontSize: '0.85rem', color: 'var(--text-secondary)', textDecoration: 'none' }}>- Төлбөр хэлбэр</Link>
                    <Link href="/admin/settings?type=NEXT_PROCESS" style={{ padding: '0.35rem', fontSize: '0.85rem', color: 'var(--text-secondary)', textDecoration: 'none' }}>- Дараагийн процесс</Link>
                    <Link href="/admin/settings?type=OUTSOURCED_JOB" style={{ padding: '0.35rem', fontSize: '0.85rem', color: 'var(--text-secondary)', textDecoration: 'none' }}>- Гадуур ажил</Link>
                    <Link href="/admin/settings?type=OUTSOURCED_CONTRACTOR" style={{ padding: '0.35rem', fontSize: '0.85rem', color: 'var(--text-secondary)', textDecoration: 'none' }}>- Гүйцэтгэгч</Link>
                  </div>
                  <div style={{ padding: '0.5rem', borderRadius: '0.375rem', background: '#f1f5f9', fontWeight: 600, marginTop: '0.5rem', fontSize: '0.85rem' }}>⚙️ Үндсэн тохиргоо</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem', paddingLeft: '0.75rem' }}>
                    <Link href="/admin/settings?type=ORDER_START_SEQ" style={{ padding: '0.35rem', fontSize: '0.85rem', color: 'var(--text-secondary)', textDecoration: 'none' }}>- Эхлэх дугаар</Link>
                    <Link href="/admin/settings?type=DEFAULT_PROFIT_MARGIN" style={{ padding: '0.35rem', fontSize: '0.85rem', color: 'var(--text-secondary)', textDecoration: 'none' }}>- Үндсэн ашиг (%)</Link>
                    <Link href="/admin/settings?type=DEFAULT_DEPOSIT_PERCENT" style={{ padding: '0.35rem', fontSize: '0.85rem', color: 'var(--text-secondary)', textDecoration: 'none' }}>- Урьдчилгаа (%)</Link>
                    <Link href="/admin/settings?type=COMPANY_LOGO" style={{ padding: '0.35rem', fontSize: '0.85rem', color: 'var(--text-secondary)', textDecoration: 'none' }}>- Компанийн Лого</Link>
                  </div>
                </>
              )}
            </>
          )}
        </nav>

        <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
          {!collapsed && <div style={{ fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name} ({user.role})</div>}
          <button onClick={() => { logout(); router.push('/login'); }} title="Гарах" className="btn btn-outline" style={{ width: '100%', padding: '0.4rem', fontSize: '0.85rem' }}>
            {collapsed ? '🚪' : 'Гарах'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '1.25rem', overflowY: 'auto', minWidth: 0 }}>
        {children}
      </main>
    </div>
  );
}

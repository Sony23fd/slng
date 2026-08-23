"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../stores/useAuthStore';
import Notifications from '../../components/Notifications';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, token, logout, hasHydrated } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (hasHydrated) {
      if (!token || !user) {
        router.push('/login');
      } else if (user.role === 'SALES') {
        router.push('/sales');
      }
    }
  }, [token, user, router, hasHydrated]);

  if (!mounted || !hasHydrated || !user || user.role === 'SALES') {
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
          
          {/* 1. ХЯНАЛТ & САМБАР */}
          {!collapsed && <div style={{ padding: '0.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.5rem' }}>Хяналт & Самбар</div>}
          <Link href="/admin" title="Хянах самбар" style={{ padding: '0.6rem', borderRadius: '0.375rem', background: '#f8fafc', fontWeight: 600, textDecoration: 'none', color: '#334155', display: 'flex', alignItems: 'center', gap: '0.75rem', whiteSpace: 'nowrap', overflow: 'hidden' }}>
            <span style={{ fontSize: '1.1rem' }}>📊</span>
            {!collapsed && <span>Хянах самбар</span>}
          </Link>

          <Link href="/admin/production" title="Үйлдвэрлэл хяналт" style={{ padding: '0.6rem', borderRadius: '0.375rem', background: '#f8fafc', fontWeight: 600, textDecoration: 'none', color: '#334155', display: 'flex', alignItems: 'center', gap: '0.75rem', whiteSpace: 'nowrap', overflow: 'hidden' }}>
            <span style={{ fontSize: '1.1rem' }}>🏭</span>
            {!collapsed && <span>Үйлдвэрлэл хяналт</span>}
          </Link>
          
          {/* 2. ЗАХИАЛГА & БҮРТГЭЛ */}
          {(user.role === 'ADMIN' || user.role === 'FINANCE') && (
            <>
              {!collapsed && <div style={{ padding: '0.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.75rem' }}>Захиалга & Бүртгэл</div>}
              
              <Link href="/admin/customers" title="Харилцагчид" style={{ padding: '0.6rem', borderRadius: '0.375rem', background: '#f8fafc', fontWeight: 600, textDecoration: 'none', color: '#334155', display: 'flex', alignItems: 'center', gap: '0.75rem', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                <span style={{ fontSize: '1.1rem' }}>🤝</span>
                {!collapsed && <span>Харилцагчид</span>}
              </Link>
              
              <Link href="/admin/history" title="Түүх" style={{ padding: '0.6rem', borderRadius: '0.375rem', background: '#f8fafc', fontWeight: 600, textDecoration: 'none', color: '#334155', display: 'flex', alignItems: 'center', gap: '0.75rem', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                <span style={{ fontSize: '1.1rem' }}>🗄️</span>
                {!collapsed && <span>Түүх</span>}
              </Link>
              
              <Link href="/admin/templates" title="Бэлэн загвар" style={{ padding: '0.6rem', borderRadius: '0.375rem', background: '#f8fafc', fontWeight: 600, textDecoration: 'none', color: '#334155', display: 'flex', alignItems: 'center', gap: '0.75rem', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                <span style={{ fontSize: '1.1rem' }}>📄</span>
                {!collapsed && <span>Бэлэн загвар</span>}
              </Link>
              
              {user.role === 'ADMIN' && (
                <Link href="/admin/users" title="Хэрэглэгчид" style={{ padding: '0.6rem', borderRadius: '0.375rem', background: '#f8fafc', fontWeight: 600, textDecoration: 'none', color: '#334155', display: 'flex', alignItems: 'center', gap: '0.75rem', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                  <span style={{ fontSize: '1.1rem' }}>👥</span>
                  {!collapsed && <span>Хэрэглэгчид</span>}
                </Link>
              )}

              {/* 3. ҮНЭ & ТООЦООЛОЛ */}
              {!collapsed && <div style={{ padding: '0.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.75rem' }}>Үнэ & Тооцоолол</div>}
              
              <Link href="/admin/product-categories" title="Бүтээгдэхүүний төрөл" style={{ padding: '0.6rem', borderRadius: '0.375rem', background: '#f8fafc', fontWeight: 600, textDecoration: 'none', color: '#334155', display: 'flex', alignItems: 'center', gap: '0.75rem', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                <span style={{ fontSize: '1.1rem' }}>📦</span>
                {!collapsed && <span>Бүтээгдэхүүний төрөл</span>}
              </Link>

              <Link href="/admin/prices" title="Мастер үнэ" style={{ padding: '0.6rem', borderRadius: '0.375rem', background: '#f8fafc', fontWeight: 600, textDecoration: 'none', color: '#334155', display: 'flex', alignItems: 'center', gap: '0.75rem', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                <span style={{ fontSize: '1.1rem' }}>💰</span>
                {!collapsed && <span>Мастер үнэ</span>}
              </Link>

              <Link href="/admin/formulas" title="Тооцооллын томъёо" style={{ padding: '0.6rem', borderRadius: '0.375rem', background: '#f8fafc', fontWeight: 600, textDecoration: 'none', color: '#334155', display: 'flex', alignItems: 'center', gap: '0.75rem', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                <span style={{ fontSize: '1.1rem' }}>🧮</span>
                {!collapsed && <span>Томъёо</span>}
              </Link>

              <Link href="/admin/cover-rules" title="Хавтасны дүрмүүд" style={{ padding: '0.6rem', borderRadius: '0.375rem', background: '#f8fafc', fontWeight: 600, textDecoration: 'none', color: '#334155', display: 'flex', alignItems: 'center', gap: '0.75rem', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                <span style={{ fontSize: '1.1rem' }}>📐</span>
                {!collapsed && <span>Хавтасны дүрэм</span>}
              </Link>

              {/* 4. ТОХИРГОО */}
              {!collapsed && <div style={{ padding: '0.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.75rem' }}>Тохиргоо</div>}
              
              <Link href="/admin/settings" title="Системийн Тохиргоо" style={{ padding: '0.6rem', borderRadius: '0.375rem', background: '#f8fafc', fontWeight: 600, textDecoration: 'none', color: '#334155', display: 'flex', alignItems: 'center', gap: '0.75rem', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                <span style={{ fontSize: '1.1rem' }}>⚙️</span>
                {!collapsed && <span>Системийн Тохиргоо</span>}
              </Link>
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
      <main style={{ flex: 1, padding: '1.25rem', overflowY: 'auto', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
          <Notifications />
        </div>
        {children}
      </main>
    </div>
  );
}

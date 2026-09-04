"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '../../stores/useAuthStore';
import Notifications from '../../components/Notifications';

export default function SalesLayout({ children }: { children: React.ReactNode }) {
  const { user, token, logout, hasHydrated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (hasHydrated) {
      if (!token || !user) {
        router.push('/login');
      } else if (user.role === 'PRODUCTION') {
        router.push('/admin/production');
      }
    }
  }, [token, user, router, hasHydrated]);

  if (!mounted || !hasHydrated || !user || user.role === 'PRODUCTION') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f8fafc', color: '#64748b' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔄</div>
          <h2>Мэдээлэл шалгаж байна...</h2>
        </div>
      </div>
    );
  }

  const navLinks = [
    { href: '/sales', label: 'Үнэ бодолт', icon: '🧮', exact: true },
    { href: '/sales/quotes', label: 'Үнийн санал', icon: '📄' },
    { href: '/sales/orders', label: 'Захиалгууд', icon: '📋' },
    { href: '/sales/reports', label: 'Тайлан', icon: '📊' },
    { href: '/sales/history', label: 'Түүх', icon: '🗄️' },
    { href: '/sales/profile', label: 'Тохиргоо', icon: '⚙️' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--paper)', overflow: 'hidden' }}>
      {/* Top Header Navbar */}
      <header className="erp-top-header">
        <div className="erp-top-left">
          <Link href="/sales" className="erp-top-brand" title="Mini-ERP">
            <span className="mark">⚡</span>
            <span>Mini-ERP</span>
          </Link>

          <nav className="erp-top-nav">
            {navLinks.map((link) => {
              const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={isActive ? 'active' : ''}
                >
                  <span>{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="erp-top-right">
          <Notifications />

          <div className="erp-user-badge">
            <div className="erp-user-avatar">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <span><b>{user.name}</b> ({user.role})</span>
          </div>

          <button
            onClick={() => { logout(); router.push('/login'); }}
            title="Системээс гарах"
            className="erp-logout-btn"
          >
            <span>🚪</span>
            <span>Гарах</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Area */}
      <main style={{ flex: 1, overflowY: 'auto', minWidth: 0, position: 'relative' }}>
        {children}
      </main>
    </div>
  );
}

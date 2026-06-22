"use client";

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../stores/useAuthStore';

export default function SalesDashboardPage() {
  const { user, token } = useAuthStore();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (token) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/analytics/sales`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => setStats(data))
        .catch(console.error);
    }
  }, [token]);

  if (!stats) return <div style={{ padding: '2rem' }}>Уншиж байна...</div>;

  return (
    <div>
      <h1 className="title" style={{ marginBottom: '2rem' }}>👋 Сайн байна уу, {user?.name}? (Таны энэ сарын үзүүлэлт)</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card" style={{ borderLeft: '4px solid #3b82f6' }}>
          <h3 style={{ fontSize: '1rem', color: '#64748b', fontWeight: 500 }}>Таны нийт борлуулалт (Орлого)</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 700, margin: '0.5rem 0 0', color: '#0f172a' }}>{stats.myRevenue?.toLocaleString()} ₮</p>
        </div>
        <div className="card" style={{ borderLeft: '4px solid #10b981' }}>
          <h3 style={{ fontSize: '1rem', color: '#64748b', fontWeight: 500 }}>Хүлээн авсан захиалга</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 700, margin: '0.5rem 0 0', color: '#0f172a' }}>{stats.myTotalOrders} ширхэг</p>
        </div>
        <div className="card" style={{ borderLeft: '4px solid #f59e0b' }}>
          <h3 style={{ fontSize: '1rem', color: '#64748b', fontWeight: 500 }}>Хийгдэж буй (Идэвхтэй)</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 700, margin: '0.5rem 0 0', color: '#0f172a' }}>{stats.myActiveOrders} ширхэг</p>
        </div>
      </div>
    </div>
  );
}

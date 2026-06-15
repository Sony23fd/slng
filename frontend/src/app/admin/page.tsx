"use client";

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../stores/useAuthStore';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalOrders: 0, totalRevenue: 0, pendingJobs: 0 });
  const { token } = useAuthStore();

  useEffect(() => {
    if (token) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/admin/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (!data.error) setStats(data);
      })
      .catch(console.error);
    }
  }, [token]);

  return (
    <div>
      <h1 className="title">📊 Хянах самбар (Dashboard)</h1>
      
      <div className="grid grid-cols-2 gap-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card" style={{ marginBottom: 0, borderLeft: '4px solid var(--primary-color)' }}>
          <h3 style={{ color: 'var(--text-secondary)', margin: 0 }}>Нийт захиалга</h3>
          <p style={{ fontSize: '2rem', fontWeight: 800, margin: '0.5rem 0 0' }}>{stats.totalOrders}</p>
        </div>
        <div className="card" style={{ marginBottom: 0, borderLeft: '4px solid var(--success-color)' }}>
          <h3 style={{ color: 'var(--text-secondary)', margin: 0 }}>Нийт орлого</h3>
          <p style={{ fontSize: '2rem', fontWeight: 800, margin: '0.5rem 0 0' }}>{stats.totalRevenue.toLocaleString()} ₮</p>
        </div>
        <div className="card" style={{ marginBottom: 0, borderLeft: '4px solid var(--danger-color)' }}>
          <h3 style={{ color: 'var(--text-secondary)', margin: 0 }}>Хүлээгдэж буй ажил</h3>
          <p style={{ fontSize: '2rem', fontWeight: 800, margin: '0.5rem 0 0' }}>{stats.pendingJobs}</p>
        </div>
      </div>

      <div className="card">
        <h3 className="section-title">Сүүлийн үйлдэл (Audit)</h3>
        <p style={{ color: 'var(--text-muted)' }}>Тун удахгүй: Хэн ямар захиалга нэмсэн, төлөв өөрчилсөн болон үнэ өөрчилсөн түүхүүд энд жагсаалтаар харагдана.</p>
      </div>
    </div>
  );
}

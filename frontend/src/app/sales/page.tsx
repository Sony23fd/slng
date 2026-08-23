"use client";

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../stores/useAuthStore';
import Link from 'next/link';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';

export default function SalesDashboardPage() {
  const { user, token } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/analytics/sales`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => {
          if (!res.ok) throw new Error('Серверээс алдаатай хариу ирлээ');
          return res.json();
        })
        .then(data => {
          setStats(data);
          setError(null);
        })
        .catch(err => {
          setError('Сервертэй холбогдоход алдаа гарлаа. (Backend ажиллаж байгаа эсэхийг шалгана уу)');
        });
    }
  }, [token]);

  if (error) return <div style={{ padding: '2rem', color: '#ef4444' }}>{error}</div>;
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        {/* Trend Line Chart */}
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem', color: '#475569' }}>Миний борлуулалт (Сүүлийн 7 хоног)</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.myTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val / 1000}к ₮`} />
                <RechartsTooltip formatter={(value: any) => [`${Number(value || 0).toLocaleString()} ₮`, 'Орлого']} />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem', color: '#475569' }}>Миний сүүлийн захиалгууд</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '0.75rem 0.5rem', color: 'var(--text-secondary)' }}>Дугаар</th>
                  <th style={{ padding: '0.75rem 0.5rem', color: 'var(--text-secondary)' }}>Огноо</th>
                  <th style={{ padding: '0.75rem 0.5rem', color: 'var(--text-secondary)' }}>Харилцагч</th>
                  <th style={{ padding: '0.75rem 0.5rem', color: 'var(--text-secondary)' }}>Бүтээгдэхүүн</th>
                  <th style={{ padding: '0.75rem 0.5rem', color: 'var(--text-secondary)' }}>Үнэ</th>
                  <th style={{ padding: '0.75rem 0.5rem', color: 'var(--text-secondary)' }}>Төлөв</th>
                </tr>
              </thead>
              <tbody>
                {stats.myRecentOrders?.length > 0 ? stats.myRecentOrders.map((o: any) => (
                  <tr key={o.id} style={{ borderBottom: '1px dashed var(--border-color)' }}>
                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>
                      <Link href={`/sales/orders/${o.id}`} style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>
                        {o.order_number}
                      </Link>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>{o.customer_name}</td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>{o.product_name}</td>
                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>{Number(o.final_price).toLocaleString()} ₮</td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <span style={{ 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '0.25rem', 
                        fontSize: '0.75rem', 
                        fontWeight: 600,
                        background: o.current_status === 'Бэлэн' ? '#dcfce7' : o.current_status === 'Олгосон' ? '#e2e8f0' : o.current_status === 'Цуцлагдсан' ? '#fee2e2' : '#fef9c3',
                        color: o.current_status === 'Бэлэн' ? '#166534' : o.current_status === 'Олгосон' ? '#475569' : o.current_status === 'Цуцлагдсан' ? '#991b1b' : '#854d0e'
                      }}>
                        {o.current_status}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>Одоогоор захиалга байхгүй байна.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

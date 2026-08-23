"use client";

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../stores/useAuthStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8b5cf6', '#ec4899'];

export default function AdminDashboardPage() {
  const { user, token } = useAuthStore();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [period, setPeriod] = useState('this_month');

  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      router.push('/');
    } else if (token) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/analytics/admin?period=${period}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => setStats(data))
        .catch(console.error);
    }
  }, [user, router, token, period]);

  if (!stats) return <div style={{ padding: '2rem' }}>Уншиж байна...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="title">📊 Удирдлагын хянах самбар</h1>
        <select 
          className="input" 
          style={{ width: '200px' }} 
          value={period} 
          onChange={e => setPeriod(e.target.value)}
        >
          <option value="this_month">Энэ сар</option>
          <option value="last_month">Өмнөх сар</option>
          <option value="this_year">Энэ жил</option>
        </select>
      </div>
      
      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: 'white' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 500, opacity: 0.9 }}>Нийт борлуулалт (Орлого)</h3>
          <p style={{ fontSize: '2rem', fontWeight: 700, margin: '0.5rem 0 0' }}>{stats.totalRevenue?.toLocaleString()} ₮</p>
        </div>
        <div className="card" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 500, opacity: 0.9 }}>Нийт захиалга</h3>
          <p style={{ fontSize: '2rem', fontWeight: 700, margin: '0.5rem 0 0' }}>{stats.totalOrders} ширхэг</p>
        </div>
        <div className="card" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: 'white' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 500, opacity: 0.9 }}>Хийгдэж буй (Идэвхтэй)</h3>
          <p style={{ fontSize: '2rem', fontWeight: 700, margin: '0.5rem 0 0' }}>{stats.activeOrdersCount} захиалга</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
        {/* Trend Line Chart */}
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem', color: '#475569' }}>Сүүлийн 7 хоногийн борлуулалт</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.trend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val / 1000}к ₮`} />
                <RechartsTooltip formatter={(value: any) => [`${Number(value || 0).toLocaleString()} ₮`, 'Орлого']} />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Pie Chart */}
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem', color: '#475569' }}>Бүтээгдэхүүний төрлөөр (Захиалгын тоо)</h3>
          <div style={{ height: '300px', display: 'flex' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats.categoryStats} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                  {stats.categoryStats.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(value: any) => [`${value} ш`, 'Захиалга']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Salesperson Bar Chart */}
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem', color: '#475569' }}>Борлуулагчдын гүйцэтгэл (Орлогоор)</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.salespersonStats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val / 1000}к ₮`} />
                <RechartsTooltip formatter={(value: any) => [`${Number(value || 0).toLocaleString()} ₮`, 'Орлого']} cursor={{ fill: '#f1f5f9' }} />
                <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Customers */}
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem', color: '#475569' }}>Шилдэг харилцагчид (Топ 5)</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '0.75rem 0.5rem', color: 'var(--text-secondary)' }}>Харилцагч</th>
                <th style={{ padding: '0.75rem 0.5rem', color: 'var(--text-secondary)' }}>Орлого (₮)</th>
              </tr>
            </thead>
            <tbody>
              {stats.topCustomers?.length > 0 ? stats.topCustomers.map((c: any, index: number) => (
                <tr key={index} style={{ borderBottom: '1px dashed var(--border-color)' }}>
                  <td style={{ padding: '0.75rem 0.5rem', fontWeight: 500 }}>{c.name}</td>
                  <td style={{ padding: '0.75rem 0.5rem', color: '#10b981', fontWeight: 600 }}>{Number(c.revenue).toLocaleString()} ₮</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={2} style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>Мэдээлэл олдсонгүй</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="card">
        <h3 style={{ marginBottom: '1.5rem', color: '#475569' }}>Сүүлд нэмэгдсэн захиалгууд</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '0.75rem 0.5rem', color: 'var(--text-secondary)' }}>Дугаар</th>
                <th style={{ padding: '0.75rem 0.5rem', color: 'var(--text-secondary)' }}>Огноо</th>
                <th style={{ padding: '0.75rem 0.5rem', color: 'var(--text-secondary)' }}>Харилцагч</th>
                <th style={{ padding: '0.75rem 0.5rem', color: 'var(--text-secondary)' }}>Бүтээгдэхүүн</th>
                <th style={{ padding: '0.75rem 0.5rem', color: 'var(--text-secondary)' }}>Тоо</th>
                <th style={{ padding: '0.75rem 0.5rem', color: 'var(--text-secondary)' }}>Үнэ</th>
                <th style={{ padding: '0.75rem 0.5rem', color: 'var(--text-secondary)' }}>Төлөв</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders?.length > 0 ? stats.recentOrders.map((o: any) => (
                <tr key={o.id} style={{ borderBottom: '1px dashed var(--border-color)' }}>
                  <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>
                    <Link href={`/admin/orders/${o.id}`} style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>
                      {o.order_number}
                    </Link>
                  </td>
                  <td style={{ padding: '0.75rem 0.5rem' }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: '0.75rem 0.5rem' }}>{o.customer_name}</td>
                  <td style={{ padding: '0.75rem 0.5rem' }}>{o.product_name}</td>
                  <td style={{ padding: '0.75rem 0.5rem' }}>{Number(o.total_qty).toLocaleString()} ш</td>
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
                  <td colSpan={7} style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>Одоогоор захиалга байхгүй байна.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

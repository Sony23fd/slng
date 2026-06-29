"use client";

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../stores/useAuthStore';
import { useRouter } from 'next/navigation';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8b5cf6', '#ec4899'];

export default function AdminDashboardPage() {
  const { user, token } = useAuthStore();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      router.push('/');
    } else if (token) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/analytics/admin`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => setStats(data))
        .catch(console.error);
    }
  }, [user, router, token]);

  if (!stats) return <div style={{ padding: '2rem' }}>Уншиж байна...</div>;

  return (
    <div>
      <h1 className="title" style={{ marginBottom: '2rem' }}>📊 Удирдлагын хянах самбар (Энэ сар)</h1>
      
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
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
        <div className="card" style={{ gridColumn: '1 / -1' }}>
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
      </div>
    </div>
  );
}

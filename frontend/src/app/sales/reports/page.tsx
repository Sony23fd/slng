"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuthStore } from '../../../stores/useAuthStore';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface OrderItem {
  id: number;
  order_number: string;
  customer_name: string;
  company_name: string | null;
  product_name: string;
  category: string;
  total_qty: number;
  final_price: number;
  paid_amount: number;
  balance: number;
  current_status: string;
  createdAt: string;
  deadline: string | null;
  is_urgent: boolean;
  order_type: string;
}

interface ReportData {
  targetUser: {
    id: number;
    name: string;
    role: string;
  };
  period: {
    type: string;
    startDate: string;
    endDate: string;
  };
  summary: {
    totalRevenue: number;
    totalOrders: number;
    completedRevenue: number;
    completedCount: number;
    inProductionRevenue: number;
    inProductionCount: number;
    cancelledCount: number;
    cancelledRevenue: number;
    totalPaid: number;
    totalReceivables: number;
    target: number;
    achievementRate: number;
  };
  trend: Array<{ date: string; revenue: number; count: number }>;
  categoryBreakdown: Array<{ category: string; count: number; revenue: number; percent: number }>;
  statusBreakdown: Array<{ status: string; count: number; revenue: number }>;
  topCustomers: Array<{ name: string; count: number; totalAmount: number }>;
  orders: OrderItem[];
  availableSalespersons: Array<{ id: number; name: string; role: string }>;
}

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];

const formatMNT = (amount: number) => {
  return (Math.round(amount) || 0).toLocaleString('en-US') + '₮';
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('mn-MN', { year: 'numeric', month: '2-digit', day: '2-digit' });
};

export default function SalesReportPage() {
  const { token, user } = useAuthStore();

  const [periodPreset, setPeriodPreset] = useState<'today' | 'this_week' | 'this_month' | 'last_month' | 'custom'>('this_month');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedSalesPersonId, setSelectedSalesPersonId] = useState<string>('');

  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Table filters
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Initialize custom dates with current month
  useEffect(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    setStartDate(firstDay);
    setEndDate(lastDay);
  }, []);

  const fetchReport = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const params = new URLSearchParams();
      params.set('period', periodPreset);
      if (periodPreset === 'custom') {
        if (startDate) params.set('startDate', startDate);
        if (endDate) params.set('endDate', endDate);
      }
      if (selectedSalesPersonId) {
        params.set('salesPersonId', selectedSalesPersonId);
      }

      const res = await fetch(`${apiUrl}/api/reports/sales?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error('Тайлан татахад алдаа гарлаа');
      }

      const data: ReportData = await res.json();
      setReport(data);
    } catch (err: any) {
      setError(err.message || 'Алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  }, [token, periodPreset, startDate, endDate, selectedSalesPersonId]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  // Filtered orders in table
  const filteredOrders = useMemo(() => {
    if (!report?.orders) return [];
    return report.orders.filter(o => {
      const matchSearch =
        !searchTerm ||
        o.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (o.company_name && o.company_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        o.product_name?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === 'ALL' || o.current_status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [report, searchTerm, statusFilter]);

  // Sums for table footer
  const tableSums = useMemo(() => {
    return filteredOrders.reduce(
      (acc, o) => {
        acc.qty += o.total_qty || 0;
        acc.revenue += o.final_price || 0;
        acc.paid += o.paid_amount || 0;
        acc.balance += o.balance || 0;
        return acc;
      },
      { qty: 0, revenue: 0, paid: 0, balance: 0 }
    );
  }, [filteredOrders]);

  // CSV / Excel Export with UTF-8 BOM
  const handleExportCSV = () => {
    if (!filteredOrders || filteredOrders.length === 0) {
      alert('Экспортлох захиалгын өгөгдөл олдсонгүй');
      return;
    }

    const headers = [
      'Огноо',
      'Захиалга №',
      'Харилцагч',
      'Байгууллага',
      'Бүтээгдэхүүн',
      'Ангилал',
      'Тоо ширхэг',
      'Нийт дүн (₮)',
      'Төлсөн (₮)',
      'Үлдэгдэл авлага (₮)',
      'Төлөв',
      'Яаралтай эсэх',
      'Төрөл'
    ];

    const rows = filteredOrders.map(o => [
      formatDate(o.createdAt),
      o.order_number || '',
      `"${(o.customer_name || '').replace(/"/g, '""')}"`,
      `"${(o.company_name || '').replace(/"/g, '""')}"`,
      `"${(o.product_name || '').replace(/"/g, '""')}"`,
      o.category || '',
      o.total_qty || 0,
      o.final_price || 0,
      o.paid_amount || 0,
      o.balance || 0,
      `"${(o.current_status || '').replace(/"/g, '""')}"`,
      o.is_urgent ? 'Тийм' : 'Үгүй',
      o.order_type || 'STANDARD'
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const fileName = `Borluulaltiin_tailan_${report?.targetUser?.name || 'sales'}_${new Date().toISOString().split('T')[0]}.csv`;
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const isManagerOrAdmin = user && ['ADMIN', 'FINANCE', 'MANAGER'].includes(user.role);

  return (
    <div className="erp-report-container" style={{ padding: '1.5rem', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Top Header Controls (Hidden during print) */}
      <div className="no-print" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: 'var(--text-main, #0f172a)' }}>
              📊 Борлуулалтын тайлан
            </h1>
            <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted, #64748b)', fontSize: '0.875rem' }}>
              Борлуулагч: <b>{report?.targetUser?.name || user?.name}</b> • Хугацаа: {formatDate(report?.period?.startDate || '')} - {formatDate(report?.period?.endDate || '')}
            </p>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={handleExportCSV}
              className="btn btn-outline"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.9rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: '#fff',
                color: '#0f172a'
              }}
              title="Excel (CSV) хэлбэрээр татаж авах"
            >
              <span>📥</span>
              <span>Excel татах</span>
            </button>
            <button
              onClick={handlePrint}
              className="btn btn-primary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.9rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                borderRadius: '6px',
                background: '#2563eb',
                color: '#fff',
                border: 'none'
              }}
              title="Тайланг шууд хэвлэх эсвэл PDF болгох"
            >
              <span>🖨️</span>
              <span>Хэвлэх</span>
            </button>
          </div>
        </div>

        {/* Filter Toolbar Card */}
        <div
          className="card"
          style={{
            marginTop: '1rem',
            padding: '0.85rem 1.25rem',
            background: '#ffffff',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem'
          }}
        >
          {/* Preset Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginRight: '0.25rem' }}>
              Хугацаа:
            </span>
            {(
              [
                { key: 'today', label: 'Өнөөдөр' },
                { key: 'this_week', label: 'Энэ 7 хоног' },
                { key: 'this_month', label: 'Энэ сар' },
                { key: 'last_month', label: 'Өнгөрсөн сар' },
                { key: 'custom', label: 'Дурын' }
              ] as const
            ).map(preset => {
              const active = periodPreset === preset.key;
              return (
                <button
                  key={preset.key}
                  onClick={() => setPeriodPreset(preset.key)}
                  style={{
                    padding: '0.35rem 0.75rem',
                    fontSize: '0.8rem',
                    borderRadius: '5px',
                    border: active ? '1px solid #2563eb' : '1px solid #e2e8f0',
                    background: active ? '#eff6ff' : '#ffffff',
                    color: active ? '#1d4ed8' : '#475569',
                    fontWeight: active ? 600 : 500,
                    cursor: 'pointer'
                  }}
                >
                  {preset.label}
                </button>
              );
            })}

            {/* Date Pickers for Custom */}
            {periodPreset === 'custom' && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginLeft: '0.5rem' }}>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  style={{
                    padding: '0.25rem 0.5rem',
                    fontSize: '0.8rem',
                    border: '1px solid #cbd5e1',
                    borderRadius: '4px'
                  }}
                />
                <span style={{ color: '#94a3b8' }}>-</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  style={{
                    padding: '0.25rem 0.5rem',
                    fontSize: '0.8rem',
                    border: '1px solid #cbd5e1',
                    borderRadius: '4px'
                  }}
                />
              </div>
            )}
          </div>

          {/* Salesperson Selector (Only for Admin / Manager) */}
          {isManagerOrAdmin && report?.availableSalespersons && report.availableSalespersons.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Борлуулагч:</span>
              <select
                value={selectedSalesPersonId || (report?.targetUser?.id ? String(report.targetUser.id) : '')}
                onChange={e => setSelectedSalesPersonId(e.target.value)}
                style={{
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.8rem',
                  borderRadius: '5px',
                  border: '1px solid #cbd5e1',
                  background: '#fff',
                  color: '#0f172a',
                  fontWeight: 500
                }}
              >
                {report.availableSalespersons.map(sp => (
                  <option key={sp.id} value={sp.id}>
                    {sp.name} ({sp.role})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Printable Report Header (Visible only when printing) */}
      <div className="print-only" style={{ display: 'none', marginBottom: '1.5rem', borderBottom: '2px solid #0f172a', paddingBottom: '0.75rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>БОРЛУУЛАЛТЫН ТАЙЛАН</h1>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.9rem' }}>
          <div>Борлуулагч: <b>{report?.targetUser?.name || user?.name}</b></div>
          <div>Хугацаа: {formatDate(report?.period?.startDate || '')} - {formatDate(report?.period?.endDate || '')}</div>
          <div>Хэвлэсэн: {new Date().toLocaleDateString('mn-MN')}</div>
        </div>
      </div>

      {/* Loading & Error States */}
      {loading && (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔄</div>
          <div>Тайлангийн өгөгдлийг уншиж байна...</div>
        </div>
      )}

      {error && (
        <div style={{ padding: '1.5rem', background: '#fef2f2', color: '#b91c1c', borderRadius: '8px', border: '1px solid #fecaca' }}>
          ⚠️ Алдаа: {error}
        </div>
      )}

      {!loading && !error && report && (
        <>
          {/* KPI CARDS GRID */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginBottom: '1.5rem'
            }}
          >
            {/* Total Revenue */}
            <div
              className="card"
              style={{
                background: '#ffffff',
                padding: '1.1rem 1.25rem',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}
            >
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                Нийт борлуулалт
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a', margin: '0.35rem 0' }}>
                {formatMNT(report.summary.totalRevenue)}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Нийт: <b>{report.summary.totalOrders}</b> захиалга
              </div>
            </div>

            {/* Completed / Delivered */}
            <div
              className="card"
              style={{
                background: '#ffffff',
                padding: '1.1rem 1.25rem',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}
            >
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#16a34a', textTransform: 'uppercase' }}>
                Олгосон / Бэлэн болсон
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#16a34a', margin: '0.35rem 0' }}>
                {formatMNT(report.summary.completedRevenue)}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Гүйцэтгэсэн: <b>{report.summary.completedCount}</b> захиалга
              </div>
            </div>

            {/* In Production */}
            <div
              className="card"
              style={{
                background: '#ffffff',
                padding: '1.1rem 1.25rem',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}
            >
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#2563eb', textTransform: 'uppercase' }}>
                Үйлдвэрлэлд яваа
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#2563eb', margin: '0.35rem 0' }}>
                {formatMNT(report.summary.inProductionRevenue)}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Явцтай: <b>{report.summary.inProductionCount}</b> захиалга
              </div>
            </div>

            {/* Receivables (Unpaid) */}
            <div
              className="card"
              style={{
                background: '#ffffff',
                padding: '1.1rem 1.25rem',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}
            >
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#d97706', textTransform: 'uppercase' }}>
                Хүлээгдэж буй авлага
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#d97706', margin: '0.35rem 0' }}>
                {formatMNT(report.summary.totalReceivables)}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Төлөгдсөн: <b>{formatMNT(report.summary.totalPaid)}</b>
              </div>
            </div>

            {/* Monthly Target & Achievement */}
            <div
              className="card"
              style={{
                background: '#ffffff',
                padding: '1.1rem 1.25rem',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}
            >
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#7c3aed', textTransform: 'uppercase' }}>
                Төлөвлөгөө ба Биелэлт
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#7c3aed', margin: '0.35rem 0' }}>
                {report.summary.target > 0 ? `${report.summary.achievementRate.toFixed(1)}%` : 'Тохируулаагүй'}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                {report.summary.target > 0 ? `Төлөвлөгөө: ${formatMNT(report.summary.target)}` : 'Сард зорилт тавигдаагүй'}
              </div>
            </div>
          </div>

          {/* VISUALS & BREAKDOWNS (TREND & CATEGORIES) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
              gap: '1rem',
              marginBottom: '1.5rem'
            }}
          >
            {/* Daily Trend Chart */}
            <div
              className="card"
              style={{
                background: '#ffffff',
                padding: '1.25rem',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}
            >
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 1rem 0', color: '#0f172a' }}>
                📈 Өдөр тутмын борлуулалтын динамик
              </h3>
              {report.trend.length > 0 ? (
                <div style={{ width: '100%', height: 240 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={report.trend}>
                      <XAxis
                        dataKey="date"
                        tickFormatter={val => val.slice(5)} // MM-DD
                        tick={{ fontSize: 11 }}
                      />
                      <YAxis
                        tickFormatter={val => `${Math.round(val / 1000)}k`}
                        tick={{ fontSize: 11 }}
                      />
                      <Tooltip
                        formatter={(val: any) => [formatMNT(Number(val)), 'Борлуулалт']}
                        labelFormatter={label => `Огноо: ${label}`}
                      />
                      <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Өгөгдөл олдсонгүй</div>
              )}
            </div>

            {/* Product Category Distribution */}
            <div
              className="card"
              style={{
                background: '#ffffff',
                padding: '1.25rem',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}
            >
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 1rem 0', color: '#0f172a' }}>
                🥧 Бүтээгдэхүүний ангиллын бүтэц
              </h3>
              {report.categoryBreakdown.length > 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ width: 180, height: 180, flexShrink: 0 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={report.categoryBreakdown}
                          dataKey="revenue"
                          nameKey="category"
                          cx="50%"
                          cy="50%"
                          outerRadius={75}
                          innerRadius={45}
                        >
                          {report.categoryBreakdown.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(val: any) => formatMNT(Number(val))} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={{ flex: 1, minWidth: 160 }}>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.8rem' }}>
                      {report.categoryBreakdown.map((cat, idx) => (
                        <li
                          key={cat.category}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '0.4rem'
                          }}
                        >
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span
                              style={{
                                width: 10,
                                height: 10,
                                borderRadius: '50%',
                                background: PIE_COLORS[idx % PIE_COLORS.length],
                                display: 'inline-block'
                              }}
                            />
                            <span>{cat.category}</span>
                          </span>
                          <span style={{ fontWeight: 600, color: '#334155' }}>
                            {cat.percent.toFixed(1)}% ({formatMNT(cat.revenue)})
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Өгөгдөл олдсонгүй</div>
              )}
            </div>
          </div>

          {/* TOP CUSTOMERS & STATUS SUMMARY */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1rem',
              marginBottom: '1.5rem'
            }}
          >
            {/* Top Customers */}
            <div
              className="card"
              style={{
                background: '#ffffff',
                padding: '1.25rem',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}
            >
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 0.75rem 0', color: '#0f172a' }}>
                🏆 Топ харилцагчид
              </h3>
              {report.topCustomers.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', textAlign: 'left' }}>
                        <th style={{ padding: '0.4rem 0' }}>Харилцагч</th>
                        <th style={{ padding: '0.4rem 0', textAlign: 'center' }}>Захиалга</th>
                        <th style={{ padding: '0.4rem 0', textAlign: 'right' }}>Нийт дүн</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.topCustomers.map((c, i) => (
                        <tr key={c.name} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '0.5rem 0', fontWeight: 600, color: '#1e293b' }}>
                            {i + 1}. {c.name}
                          </td>
                          <td style={{ padding: '0.5rem 0', textAlign: 'center', color: '#64748b' }}>
                            {c.count}
                          </td>
                          <td style={{ padding: '0.5rem 0', textAlign: 'right', fontWeight: 600, color: '#0f172a' }}>
                            {formatMNT(c.totalAmount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ padding: '1rem', textAlign: 'center', color: '#94a3b8' }}>Өгөгдөл олдсонгүй</div>
              )}
            </div>

            {/* Status Breakdown */}
            <div
              className="card"
              style={{
                background: '#ffffff',
                padding: '1.25rem',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}
            >
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 0.75rem 0', color: '#0f172a' }}>
                📋 Захиалгын төлөвүүд
              </h3>
              {report.statusBreakdown.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {report.statusBreakdown.map(st => (
                    <div
                      key={st.status}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '6px',
                        background: '#f8fafc',
                        fontSize: '0.825rem'
                      }}
                    >
                      <span style={{ fontWeight: 600, color: '#334155' }}>{st.status}</span>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <span style={{ color: '#64748b' }}>{st.count} захиалга</span>
                        <span style={{ fontWeight: 700, color: '#0f172a' }}>{formatMNT(st.revenue)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '1rem', textAlign: 'center', color: '#94a3b8' }}>Өгөгдөл олдсонгүй</div>
              )}
            </div>
          </div>

          {/* DETAILED ORDERS TABLE */}
          <div
            className="card"
            style={{
              background: '#ffffff',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              padding: '1.25rem'
            }}
          >
            <div
              className="no-print"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.75rem',
                marginBottom: '1rem'
              }}
            >
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                📑 Захиалгын дэлгэрэнгүй жагсаалт ({filteredOrders.length})
              </h3>

              {/* Table search & status filter */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="🔍 Хайх (дугаар, харилцагч...)"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  style={{
                    padding: '0.35rem 0.65rem',
                    fontSize: '0.8rem',
                    borderRadius: '5px',
                    border: '1px solid #cbd5e1',
                    width: '200px'
                  }}
                />
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  style={{
                    padding: '0.35rem 0.65rem',
                    fontSize: '0.8rem',
                    borderRadius: '5px',
                    border: '1px solid #cbd5e1',
                    background: '#fff'
                  }}
                >
                  <option value="ALL">Бүх төлөв</option>
                  {report.statusBreakdown.map(s => (
                    <option key={s.status} value={s.status}>
                      {s.status}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto' }}>
              <table
                className="table"
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '0.8rem'
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: '#f8fafc',
                      borderBottom: '1px solid #e2e8f0',
                      color: '#475569',
                      textAlign: 'left'
                    }}
                  >
                    <th style={{ padding: '0.6rem 0.75rem' }}>Огноо</th>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Захиалга №</th>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Харилцагч</th>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Бүтээгдэхүүн</th>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Ангилал</th>
                    <th style={{ padding: '0.6rem 0.75rem', textAlign: 'right' }}>Тоо</th>
                    <th style={{ padding: '0.6rem 0.75rem', textAlign: 'right' }}>Нийт дүн</th>
                    <th style={{ padding: '0.6rem 0.75rem', textAlign: 'right' }}>Төлсөн</th>
                    <th style={{ padding: '0.6rem 0.75rem', textAlign: 'right' }}>Үлдэгдэл</th>
                    <th style={{ padding: '0.6rem 0.75rem', textAlign: 'center' }}>Төлөв</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map(order => {
                      const isCancelled = order.current_status === 'Цуцлагдсан';
                      return (
                        <tr
                          key={order.id}
                          style={{
                            borderBottom: '1px solid #f1f5f9',
                            opacity: isCancelled ? 0.6 : 1
                          }}
                        >
                          <td style={{ padding: '0.55rem 0.75rem', color: '#64748b' }}>
                            {formatDate(order.createdAt)}
                          </td>
                          <td style={{ padding: '0.55rem 0.75rem', fontWeight: 600, color: '#2563eb' }}>
                            {order.order_number}
                            {order.is_urgent && (
                              <span
                                style={{
                                  marginLeft: '0.35rem',
                                  fontSize: '0.65rem',
                                  background: '#fee2e2',
                                  color: '#dc2626',
                                  padding: '0.1rem 0.3rem',
                                  borderRadius: '3px',
                                  fontWeight: 700
                                }}
                              >
                                ЯАРАЛТАЙ
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '0.55rem 0.75rem', color: '#0f172a' }}>
                            <b>{order.customer_name}</b>
                            {order.company_name && (
                              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{order.company_name}</div>
                            )}
                          </td>
                          <td style={{ padding: '0.55rem 0.75rem', color: '#334155' }}>
                            {order.product_name}
                          </td>
                          <td style={{ padding: '0.55rem 0.75rem', color: '#64748b' }}>
                            {order.category}
                          </td>
                          <td style={{ padding: '0.55rem 0.75rem', textAlign: 'right', fontWeight: 600 }}>
                            {order.total_qty.toLocaleString()}
                          </td>
                          <td style={{ padding: '0.55rem 0.75rem', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                            {formatMNT(order.final_price)}
                          </td>
                          <td style={{ padding: '0.55rem 0.75rem', textAlign: 'right', color: '#16a34a' }}>
                            {formatMNT(order.paid_amount)}
                          </td>
                          <td
                            style={{
                              padding: '0.55rem 0.75rem',
                              textAlign: 'right',
                              fontWeight: order.balance > 0 ? 700 : 400,
                              color: order.balance > 0 ? '#dc2626' : '#64748b'
                            }}
                          >
                            {formatMNT(order.balance)}
                          </td>
                          <td style={{ padding: '0.55rem 0.75rem', textAlign: 'center' }}>
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '0.2rem 0.5rem',
                                borderRadius: '4px',
                                fontSize: '0.7rem',
                                fontWeight: 600,
                                background:
                                  order.current_status === 'Олгосон' || order.current_status === 'Бэлэн'
                                    ? '#dcfce7'
                                    : order.current_status === 'Цуцлагдсан'
                                    ? '#fee2e2'
                                    : order.current_status === 'Үнийн санал'
                                    ? '#f1f5f9'
                                    : '#e0e7ff',
                                color:
                                  order.current_status === 'Олгосон' || order.current_status === 'Бэлэн'
                                    ? '#15803d'
                                    : order.current_status === 'Цуцлагдсан'
                                    ? '#b91c1c'
                                    : order.current_status === 'Үнийн санал'
                                    ? '#475569'
                                    : '#4338ca'
                              }}
                            >
                              {order.current_status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={10} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                        Шүүлтүүрт тохирох захиалга олдсонгүй
                      </td>
                    </tr>
                  )}
                </tbody>
                {/* Table Footer Totals */}
                {filteredOrders.length > 0 && (
                  <tfoot>
                    <tr
                      style={{
                        background: '#f8fafc',
                        borderTop: '2px solid #cbd5e1',
                        fontWeight: 700,
                        color: '#0f172a'
                      }}
                    >
                      <td colSpan={5} style={{ padding: '0.65rem 0.75rem' }}>
                        НИЙТ ДҮН:
                      </td>
                      <td style={{ padding: '0.65rem 0.75rem', textAlign: 'right' }}>
                        {tableSums.qty.toLocaleString()}
                      </td>
                      <td style={{ padding: '0.65rem 0.75rem', textAlign: 'right' }}>
                        {formatMNT(tableSums.revenue)}
                      </td>
                      <td style={{ padding: '0.65rem 0.75rem', textAlign: 'right', color: '#16a34a' }}>
                        {formatMNT(tableSums.paid)}
                      </td>
                      <td style={{ padding: '0.65rem 0.75rem', textAlign: 'right', color: tableSums.balance > 0 ? '#dc2626' : '#0f172a' }}>
                        {formatMNT(tableSums.balance)}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </>
      )}

      {/* Embedded CSS for Clean Printing */}
      <style jsx global>{`
        @media print {
          .no-print,
          .erp-top-header,
          nav {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
          body,
          main,
          .erp-report-container {
            height: auto !important;
            overflow: visible !important;
            padding: 0 !important;
            background: #fff !important;
            color: #000 !important;
          }
          .card {
            border: 1px solid #ccc !important;
            box-shadow: none !important;
            page-break-inside: avoid;
          }
          table {
            page-break-inside: auto;
          }
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
        }
      `}</style>
    </div>
  );
}

"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../../../../stores/useAuthStore';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Types
interface ReportData {
  period: { year: number; month: number; startDate: string; endDate: string };
  summary: {
    totalTarget: number;
    totalRevenue: number;
    achievementRate: number;
    totalOrdersCount: number;
    avgOrderValue: number;
    prevRevenue: number;
    momGrowthRate: number;
  };
  managerStats: Array<{
    name: string;
    target: number;
    actual: number;
    orderCount: number;
    barterAmount: number;
    donationAmount: number;
    achievementRate: number;
  }>;
  leadSources: Array<{
    source: string;
    count: number;
    revenue: number;
    percent: number;
  }>;
  orderTypes: Array<{
    key: string;
    name: string;
    count: number;
    revenue: number;
    percent: number;
  }>;
  customerSegments: Array<{
    name: string;
    count: number;
    revenue: number;
    percent: number;
  }>;
  topCustomers: Array<{
    rank: number;
    customer_name: string;
    company_name: string;
    orderCount: number;
    totalAmount: number;
    percentOfTotal: number;
  }>;
  productCategories: Array<{
    category: string;
    count: number;
    revenue: number;
    percent: number;
  }>;
  barterAndDonationOrders: Array<{
    id: number;
    order_number: string;
    customer_name: string;
    company_name: string | null;
    product_name: string;
    final_price: number;
    order_type: string;
    createdAt: string;
    notes: string;
  }>;
  orderPipeline: {
    statuses: Array<{ status: string; count: number; percent: number }>;
    totalOrders: number;
    completedOrdersCount: number;
    onTimeCount: number;
    delayedCount: number;
    onTimeRate: number;
  };
  financials: {
    totalInvoiced: number;
    totalPaid: number;
    totalReceivables: number;
    collectionRate: number;
    ebarimtCount: number;
    ebarimtAmount: number;
  };
  customerGifts: Array<{
    id: number;
    customer_name: string;
    gift_items: string;
    qty: number;
    year: number;
    month: number;
    notes?: string | null;
  }>;
}

const PIE_COLORS = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#64748b'];

const formatMoney = (amount: number) => {
  return (Math.round(amount) || 0).toLocaleString('en-US') + '₮';
};

export default function MonthlyReportPage() {
  const { token, user } = useAuthStore();
  const now = new Date();
  const [year, setYear] = useState<number>(now.getFullYear());
  const [month, setMonth] = useState<number>(now.getMonth() + 1);
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'presentation'>('dashboard');
  const [currentSlide, setCurrentSlide] = useState<number>(1);

  // Modal states
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);
  const [targetAmountInput, setTargetAmountInput] = useState<string>('0');
  const [managerTargetsList, setManagerTargetsList] = useState<Array<{ manager_name: string; target: number }>>([]);
  const [isSavingTarget, setIsSavingTarget] = useState(false);

  // Gift Modal states
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
  const [giftCustomerName, setGiftCustomerName] = useState('');
  const [giftItems, setGiftItems] = useState('');
  const [giftQty, setGiftQty] = useState('1');
  const [giftNotes, setGiftNotes] = useState('');
  const [isSavingGift, setIsSavingGift] = useState(false);

  const fetchReport = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const res = await fetch(`${apiUrl}/api/reports/monthly?year=${year}&month=${month}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) {
        throw new Error('Тайлан татахад алдаа гарлаа');
      }
      const data = await res.json();
      setReport(data);
    } catch (err: any) {
      setError(err.message || 'Алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  }, [year, month, token]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  // Open Target Modal
  const handleOpenTargetModal = async () => {
    if (!token) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const res = await fetch(`${apiUrl}/api/reports/targets?year=${year}&month=${month}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTargetAmountInput(String(data.target?.target_amount || 0));
        
        // Populate manager targets
        const managers = data.managers || [];
        const existingMgrTargets: Array<{ manager_name: string; target: number }> = data.target?.manager_targets || [];
        
        const merged = managers.map((m: any) => {
          const match = existingMgrTargets.find(t => t.manager_name === m.name);
          return {
            manager_name: m.name,
            target: match ? match.target : 0
          };
        });

        // Also add any other managers in existing list
        existingMgrTargets.forEach((em: { manager_name: string; target: number }) => {
          if (!merged.find((m: { manager_name: string; target: number }) => m.manager_name === em.manager_name)) {
            merged.push(em);
          }
        });

        setManagerTargetsList(merged);
      }
      setIsTargetModalOpen(true);
    } catch (e) {
      console.error(e);
      setIsTargetModalOpen(true);
    }
  };

  const handleSaveTarget = async () => {
    if (!token) return;
    setIsSavingTarget(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const res = await fetch(`${apiUrl}/api/reports/targets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          year,
          month,
          target_amount: parseFloat(targetAmountInput) || 0,
          manager_targets: managerTargetsList
        })
      });
      if (!res.ok) throw new Error('Зорилт хадгалахад алдаа гарлаа');
      setIsTargetModalOpen(false);
      fetchReport();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsSavingTarget(false);
    }
  };

  // Add Gift
  const handleSaveGift = async () => {
    if (!token || !giftCustomerName || !giftItems) {
      alert('Харилцагчийн нэр болон бэлгийн төрлийг бөглөнө үү!');
      return;
    }
    setIsSavingGift(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const res = await fetch(`${apiUrl}/api/reports/gifts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          customer_name: giftCustomerName,
          gift_items: giftItems,
          qty: parseInt(giftQty, 10) || 1,
          year,
          month,
          notes: giftNotes
        })
      });
      if (!res.ok) throw new Error('Бэлэг хадгалахад алдаа гарлаа');
      setIsGiftModalOpen(false);
      setGiftCustomerName('');
      setGiftItems('');
      setGiftQty('1');
      setGiftNotes('');
      fetchReport();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsSavingGift(false);
    }
  };

  // Delete Gift
  const handleDeleteGift = async (id: number) => {
    if (!token || !confirm('Энэ бэлгийн бүртгэлийг устгахдаа итгэлтэй байна уу?')) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      await fetch(`${apiUrl}/api/reports/gifts/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchReport();
    } catch (e) {
      console.error(e);
    }
  };

  // Download PPTX
  const handleDownloadPptx = async () => {
    setIsDownloading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const url = `${apiUrl}/api/reports/monthly/pptx?year=${year}&month=${month}`;
      
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!res.ok) throw new Error('PPTX үүсгэхэд алдаа гарлаа');
      
      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `Selenge_Sales_Report_${year}_${String(month).padStart(2, '0')}.pptx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err: any) {
      alert(err.message || 'PPTX татахад алдаа гарлаа');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
      {/* Top Header Card */}
      <div style={{
        background: '#ffffff',
        borderRadius: '0.75rem',
        border: '1px solid #e2e8f0',
        padding: '1.25rem 1.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '1.5rem' }}>📊</span>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Борлуулалтын Сарын Тайлан
            </h1>
            <span style={{
              background: '#eef2ff',
              color: '#4f46e5',
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '0.2rem 0.6rem',
              borderRadius: '9999px',
              border: '1px solid #c7d2fe'
            }}>
              PPTX Автоматжуулалт
            </span>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>
            Сэлэнгэ Пресс ХХК-ийн сарын нэгдсэн үзүүлэлт, төлөвлөгөөний биелэлт, менежерүүдийн гүйцэтгэл
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Year & Month Selectors */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#f8fafc', padding: '0.35rem 0.6rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }}>
            <select
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value, 10))}
              style={{ background: 'transparent', border: 'none', fontWeight: 600, fontSize: '0.9rem', color: '#0f172a', outline: 'none', cursor: 'pointer' }}
            >
              {[2024, 2025, 2026, 2027].map(y => (
                <option key={y} value={y}>{y} он</option>
              ))}
            </select>
            <span style={{ color: '#94a3b8' }}>/</span>
            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value, 10))}
              style={{ background: 'transparent', border: 'none', fontWeight: 600, fontSize: '0.9rem', color: '#0f172a', outline: 'none', cursor: 'pointer' }}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                <option key={m} value={m}>{m}-р сар</option>
              ))}
            </select>
          </div>

          {/* Target Settings Button */}
          {(user?.role === 'ADMIN' || user?.role === 'FINANCE' || user?.role === 'MANAGER') && (
            <button
              onClick={handleOpenTargetModal}
              title="Сарын төлөвлөгөө, менежерийн зорилт тохируулах"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                padding: '0.5rem 0.85rem',
                borderRadius: '0.5rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#334155',
                cursor: 'pointer'
              }}
            >
              🎯 <span>Зорилт тохируулах</span>
            </button>
          )}

          {/* Add Gift Button */}
          <button
            onClick={() => setIsGiftModalOpen(true)}
            title="Харилцагчид олгосон бэлэг бүртгэх"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              padding: '0.5rem 0.85rem',
              borderRadius: '0.5rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: '#334155',
              cursor: 'pointer'
            }}
          >
            🎁 <span>Бэлэг бүртгэх</span>
          </button>

          {/* Print Button */}
          <button
            onClick={() => window.print()}
            title="Хуудсыг хэвлэх эсвэл PDF болгон хадгалах"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              padding: '0.5rem 0.85rem',
              borderRadius: '0.5rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: '#334155',
              cursor: 'pointer'
            }}
          >
            🖨️ <span>Хэвлэх</span>
          </button>

          {/* PowerPoint PPTX Download Button */}
          <button
            onClick={handleDownloadPptx}
            disabled={isDownloading || loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
              border: 'none',
              padding: '0.55rem 1.1rem',
              borderRadius: '0.5rem',
              fontSize: '0.85rem',
              fontWeight: 700,
              color: '#ffffff',
              cursor: isDownloading ? 'wait' : 'pointer',
              boxShadow: '0 2px 4px rgba(79, 70, 229, 0.25)',
              transition: 'all 0.2s'
            }}
          >
            {isDownloading ? (
              <>⏳ <span>PPTX Бэлтгэж байна...</span></>
            ) : (
              <>📥 <span>PowerPoint (PPTX) Татах</span></>
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => setActiveTab('dashboard')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '0.375rem',
            border: 'none',
            background: activeTab === 'dashboard' ? '#4f46e5' : '#f1f5f9',
            color: activeTab === 'dashboard' ? '#ffffff' : '#475569',
            fontWeight: 600,
            fontSize: '0.85rem',
            cursor: 'pointer'
          }}
        >
          📊 Хяналтын самбар (Бүрэн тойм)
        </button>
        <button
          onClick={() => setActiveTab('presentation')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '0.375rem',
            border: 'none',
            background: activeTab === 'presentation' ? '#4f46e5' : '#f1f5f9',
            color: activeTab === 'presentation' ? '#ffffff' : '#475569',
            fontWeight: 600,
            fontSize: '0.85rem',
            cursor: 'pointer'
          }}
        >
          🖥️ Слайд харагдац (Presentation Mode)
        </button>
      </div>

      {/* Loading & Error States */}
      {loading && (
        <div style={{ padding: '3rem', textAlign: 'center', background: '#ffffff', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>⏳</div>
          <h3 style={{ color: '#0f172a', margin: 0 }}>Тайлангийн өгөгдлийг тооцоолж байна...</h3>
          <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.25rem' }}>Сарын захиалгууд, цаас, ажиллагаа, гүйцэтгэлүүдийг нэгтгэж байна</p>
        </div>
      )}

      {error && !loading && (
        <div style={{ padding: '1.5rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.75rem', color: '#b91c1c' }}>
          ⚠️ Алдаа гарлаа: {error}
        </div>
      )}

      {!loading && report && activeTab === 'dashboard' && (
        <>
          {/* 1. EXECUTIVE KPI SUMMARY (Slide 2) */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              {/* Total Revenue */}
              <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
                <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Нийт борлуулалт</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#4f46e5', margin: '0.5rem 0' }}>
                  {formatMoney(report.summary.totalRevenue)}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 600 }}>
                  Биелэлт: {report.summary.achievementRate.toFixed(1)}%
                </div>
              </div>

              {/* Monthly Target */}
              <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
                <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Төлөвлөгөө / Зорилт</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: '0.5rem 0' }}>
                  {formatMoney(report.summary.totalTarget)}
                </div>
                <div style={{ fontSize: '0.8rem', color: report.summary.totalRevenue >= report.summary.totalTarget ? '#059669' : '#d97706', fontWeight: 600 }}>
                  Зөрүү: {formatMoney(report.summary.totalRevenue - report.summary.totalTarget)}
                </div>
              </div>

              {/* Orders Count & Average */}
              <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
                <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Нийт захиалгын тоо</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: '0.5rem 0' }}>
                  {report.summary.totalOrdersCount} <span style={{ fontSize: '0.9rem', fontWeight: 500, color: '#64748b' }}>ш</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>
                  Нэг захиалгын дундаж: {formatMoney(report.summary.avgOrderValue)}
                </div>
              </div>

              {/* MoM Growth */}
              <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
                <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Өмнөх сараас өсөлт</div>
                <div style={{
                  fontSize: '1.6rem',
                  fontWeight: 800,
                  color: report.summary.momGrowthRate >= 0 ? '#059669' : '#dc2626',
                  margin: '0.5rem 0'
                }}>
                  {report.summary.momGrowthRate >= 0 ? '+' : ''}{report.summary.momGrowthRate.toFixed(1)}%
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>
                  Өмнөх сарын орлого: {formatMoney(report.summary.prevRevenue)}
                </div>
              </div>
            </div>

            {/* Target Progress Bar */}
            {report.summary.totalTarget > 0 && (
              <div style={{ background: '#ffffff', padding: '1rem 1.25rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                  <span>Зорилтын биелэлтийн явц:</span>
                  <span style={{ color: '#4f46e5' }}>{report.summary.achievementRate.toFixed(1)}%</span>
                </div>
                <div style={{ width: '100%', height: '12px', background: '#f1f5f9', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${Math.min(report.summary.achievementRate, 100)}%`,
                    height: '100%',
                    background: report.summary.achievementRate >= 100 ? '#059669' : '#4f46e5',
                    borderRadius: '9999px',
                    transition: 'width 0.5s ease-out'
                  }} />
                </div>
              </div>
            )}
          </section>

          {/* 2. MANAGERS PERFORMANCE (Slide 3) */}
          <section style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  👤 Борлуулалтын Менежерүүдийн Гүйцэтгэл
                </h2>
                <p style={{ color: '#64748b', fontSize: '0.8rem', margin: 0 }}>Хувийн төлөвлөгөө ба бодит борлуулалтын биелэлт</p>
              </div>
            </div>

            {/* Chart: Manager Target vs Actual */}
            <div style={{ height: '260px', width: '100%', marginBottom: '1.5rem' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={report.managerStats} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
                  <Tooltip formatter={(val: any) => formatMoney(Number(val))} />
                  <Legend />
                  <Bar dataKey="target" name="Зорилт" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="actual" name="Бодит борлуулалт" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Manager Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', textAlign: 'left' }}>
                    <th style={{ padding: '0.6rem 0.75rem' }}>№</th>
                    <th style={{ padding: '0.6rem 0.75rem' }}>Менежер</th>
                    <th style={{ padding: '0.6rem 0.75rem', textAlign: 'right' }}>Зорилт</th>
                    <th style={{ padding: '0.6rem 0.75rem', textAlign: 'right' }}>Гүйцэтгэл</th>
                    <th style={{ padding: '0.6rem 0.75rem', textAlign: 'center' }}>Биелэлт %</th>
                    <th style={{ padding: '0.6rem 0.75rem', textAlign: 'center' }}>Захиалга</th>
                    <th style={{ padding: '0.6rem 0.75rem', textAlign: 'right' }}>Бартер</th>
                    <th style={{ padding: '0.6rem 0.75rem', textAlign: 'right' }}>Хандив</th>
                  </tr>
                </thead>
                <tbody>
                  {report.managerStats.map((m, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.6rem 0.75rem', color: '#94a3b8' }}>{idx + 1}</td>
                      <td style={{ padding: '0.6rem 0.75rem', fontWeight: 600, color: '#0f172a' }}>{m.name}</td>
                      <td style={{ padding: '0.6rem 0.75rem', textAlign: 'right', color: '#64748b' }}>{formatMoney(m.target)}</td>
                      <td style={{ padding: '0.6rem 0.75rem', textAlign: 'right', fontWeight: 700, color: '#4f46e5' }}>{formatMoney(m.actual)}</td>
                      <td style={{ padding: '0.6rem 0.75rem', textAlign: 'center' }}>
                        <span style={{
                          padding: '0.2rem 0.5rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          background: m.achievementRate >= 100 ? '#dcfce7' : '#fef3c7',
                          color: m.achievementRate >= 100 ? '#166534' : '#b45309'
                        }}>
                          {m.achievementRate.toFixed(1)}%
                        </span>
                      </td>
                      <td style={{ padding: '0.6rem 0.75rem', textAlign: 'center' }}>{m.orderCount} ш</td>
                      <td style={{ padding: '0.6rem 0.75rem', textAlign: 'right', color: '#64748b' }}>{formatMoney(m.barterAmount)}</td>
                      <td style={{ padding: '0.6rem 0.75rem', textAlign: 'right', color: '#64748b' }}>{formatMoney(m.donationAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* 3. CHANNELS & PRODUCT CATEGORIES (Slides 4 & 7) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
            {/* Lead Sources & Order Types */}
            <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 1rem 0' }}>
                🌐 Борлуулалтын Суваг & Төрөл
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#475569', textAlign: 'left' }}>
                        <th style={{ padding: '0.5rem' }}>Эх үүсвэр / Суваг</th>
                        <th style={{ padding: '0.5rem', textAlign: 'center' }}>Захиалга</th>
                        <th style={{ padding: '0.5rem', textAlign: 'right' }}>Борлуулалт</th>
                        <th style={{ padding: '0.5rem', textAlign: 'right' }}>Хувь</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.leadSources.map((ls, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '0.5rem', fontWeight: 600 }}>{ls.source}</td>
                          <td style={{ padding: '0.5rem', textAlign: 'center' }}>{ls.count} ш</td>
                          <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 600 }}>{formatMoney(ls.revenue)}</td>
                          <td style={{ padding: '0.5rem', textAlign: 'right', color: '#4f46e5', fontWeight: 600 }}>{ls.percent.toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem' }}>Гэрээний төрлөөр:</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                    {report.orderTypes.map(ot => (
                      <div key={ot.key} style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{ot.name}</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: '0.2rem 0' }}>{formatMoney(ot.revenue)}</div>
                        <div style={{ fontSize: '0.7rem', color: '#4f46e5' }}>{ot.count} ш ({ot.percent.toFixed(1)}%)</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Product Categories */}
            <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 1rem 0' }}>
                📦 Бүтээгдэхүүний Ангилал
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ width: '180px', height: '180px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={report.productCategories}
                        dataKey="revenue"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        outerRadius={70}
                      >
                        {report.productCategories.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(val: any) => formatMoney(Number(val))} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div style={{ flex: 1, minWidth: '200px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                    <tbody>
                      {report.productCategories.slice(0, 6).map((cat, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '0.35rem 0.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: PIE_COLORS[idx % PIE_COLORS.length] }} />
                            <span style={{ fontWeight: 600 }}>{cat.category}</span>
                          </td>
                          <td style={{ padding: '0.35rem', textAlign: 'right', fontWeight: 600 }}>{formatMoney(cat.revenue)}</td>
                          <td style={{ padding: '0.35rem', textAlign: 'right', color: '#64748b' }}>{cat.percent.toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* 4. TOP 10 CUSTOMERS & SEGMENTS (Slides 5 & 6) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
            {/* Top 10 Customers */}
            <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 1rem 0' }}>
                🏆 Топ 10 Тэргүүлэгч Харилцагчид
              </h2>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#475569', textAlign: 'left' }}>
                      <th style={{ padding: '0.5rem' }}>№</th>
                      <th style={{ padding: '0.5rem' }}>Харилцагч</th>
                      <th style={{ padding: '0.5rem', textAlign: 'center' }}>Захиалга</th>
                      <th style={{ padding: '0.5rem', textAlign: 'right' }}>Борлуулалт</th>
                      <th style={{ padding: '0.5rem', textAlign: 'right' }}>Хувь</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.topCustomers.map((c) => (
                      <tr key={c.rank} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '0.5rem', fontWeight: 700, color: c.rank <= 3 ? '#4f46e5' : '#94a3b8' }}>
                          #{c.rank}
                        </td>
                        <td style={{ padding: '0.5rem', fontWeight: 600, color: '#0f172a' }}>
                          {c.customer_name}
                          {c.company_name && <span style={{ color: '#64748b', fontSize: '0.75rem', marginLeft: '0.4rem' }}>({c.company_name})</span>}
                        </td>
                        <td style={{ padding: '0.5rem', textAlign: 'center' }}>{c.orderCount} ш</td>
                        <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 700, color: '#4f46e5' }}>{formatMoney(c.totalAmount)}</td>
                        <td style={{ padding: '0.5rem', textAlign: 'right', color: '#64748b' }}>{c.percentOfTotal.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Customer Segments & Financials */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Segments */}
              <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 1rem 0' }}>
                  👥 Харилцагчийн Бүтэц
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  {report.customerSegments.map(cs => (
                    <div key={cs.name} style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>{cs.name}</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#4f46e5', margin: '0.3rem 0' }}>{formatMoney(cs.revenue)}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{cs.count} захиалга ({cs.percent.toFixed(1)}%)</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financials & Receivables */}
              <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 1rem 0' }}>
                  💳 Төлбөр Тооцоо & Авлага
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '0.5rem' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Хүлээн авсан төлбөр:</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#059669' }}>{formatMoney(report.financials.totalPaid)}</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Цуглуулалт: {report.financials.collectionRate.toFixed(1)}%</div>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '0.5rem' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Үлдэгдэл авлага:</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: report.financials.totalReceivables > 0 ? '#dc2626' : '#059669' }}>
                      {formatMoney(report.financials.totalReceivables)}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>И-Баримт: {report.financials.ebarimtCount} ш</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 5. BARTER & DONATIONS + GIFTS (Slides 8 & 11) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
            {/* Barter & Donation Orders */}
            <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 1rem 0' }}>
                🤝 Бартер & Хандивын Захиалгууд
              </h2>
              {report.barterAndDonationOrders.length === 0 ? (
                <div style={{ padding: '1.5rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                  Энэ сард бартер эсвэл хандивын захиалга бүртгэгдээгүй байна.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#475569', textAlign: 'left' }}>
                        <th style={{ padding: '0.5rem' }}>Дугаар</th>
                        <th style={{ padding: '0.5rem' }}>Харилцагч</th>
                        <th style={{ padding: '0.5rem' }}>Төрөл</th>
                        <th style={{ padding: '0.5rem', textAlign: 'right' }}>Дүн</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.barterAndDonationOrders.map(b => (
                        <tr key={b.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '0.5rem', fontWeight: 700 }}>{b.order_number}</td>
                          <td style={{ padding: '0.5rem' }}>{b.customer_name}</td>
                          <td style={{ padding: '0.5rem' }}>
                            <span style={{
                              padding: '0.15rem 0.4rem',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              background: b.order_type === 'Бартер' ? '#fef3c7' : '#e0e7ff',
                              color: b.order_type === 'Бартер' ? '#92400e' : '#3730a3'
                            }}>
                              {b.order_type}
                            </span>
                          </td>
                          <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 600 }}>{formatMoney(b.final_price)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Customer Gifts Registry */}
            <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  🎁 Харилцагчдад Өгсөн Бэлгийн Бүртгэл
                </h2>
                <button
                  onClick={() => setIsGiftModalOpen(true)}
                  style={{ background: '#eef2ff', color: '#4f46e5', border: 'none', padding: '0.35rem 0.75rem', borderRadius: '0.375rem', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  + Нэмэх
                </button>
              </div>

              {report.customerGifts.length === 0 ? (
                <div style={{ padding: '1.5rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                  Энэ сард харилцагчдад олгосон бэлэг бүртгэгдээгүй байна.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#475569', textAlign: 'left' }}>
                        <th style={{ padding: '0.5rem' }}>Харилцагч</th>
                        <th style={{ padding: '0.5rem' }}>Бэлгийн нэр төрөл</th>
                        <th style={{ padding: '0.5rem', textAlign: 'center' }}>Тоо</th>
                        <th style={{ padding: '0.5rem', textAlign: 'center' }}>Устгах</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.customerGifts.map(g => (
                        <tr key={g.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '0.5rem', fontWeight: 600 }}>{g.customer_name}</td>
                          <td style={{ padding: '0.5rem', color: '#475569' }}>{g.gift_items}</td>
                          <td style={{ padding: '0.5rem', textAlign: 'center', fontWeight: 700 }}>{g.qty} ш</td>
                          <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                            <button
                              onClick={() => handleDeleteGift(g.id)}
                              style={{ background: 'transparent', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '0.9rem' }}
                              title="Устгах"
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Presentation Mode (Slide-by-Slide 16:9 View) */}
      {!loading && report && activeTab === 'presentation' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
          {/* Slide Navigation Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#ffffff', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
            <button
              onClick={() => setCurrentSlide(Math.max(1, currentSlide - 1))}
              disabled={currentSlide === 1}
              style={{ padding: '0.4rem 0.8rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', cursor: currentSlide === 1 ? 'not-allowed' : 'pointer' }}
            >
              ◀ Өмнөх слайд
            </button>
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>
              Слайд {currentSlide} / 12
            </span>
            <button
              onClick={() => setCurrentSlide(Math.min(12, currentSlide + 1))}
              disabled={currentSlide === 12}
              style={{ padding: '0.4rem 0.8rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', cursor: currentSlide === 12 ? 'not-allowed' : 'pointer' }}
            >
              Дараагийн слайд ▶
            </button>
          </div>

          {/* 16:9 Slide Canvas Mockup */}
          <div style={{
            width: '100%',
            maxWidth: '1000px',
            aspectRatio: '16 / 9',
            background: currentSlide === 1 || currentSlide === 12 ? '#0f172a' : '#f8fafc',
            color: currentSlide === 1 || currentSlide === 12 ? '#ffffff' : '#0f172a',
            borderRadius: '0.75rem',
            border: '2px solid #cbd5e1',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
            padding: '2.5rem',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            overflow: 'hidden'
          }}>
            {/* Slide 1: Cover */}
            {currentSlide === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
                <div style={{ fontSize: '1.1rem', letterSpacing: '0.2em', color: '#94a3b8', fontWeight: 700, marginBottom: '0.5rem' }}>
                  СЭЛЭНГЭ ПРЕСС ХХК
                </div>
                <h1 style={{ fontSize: '2.8rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                  БОРЛУУЛАЛТЫН ТАЙЛАН
                </h1>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#60a5fa', margin: '0.5rem 0 1.5rem 0' }}>
                  {year} ОНЫ {month}-Р САР
                </h2>
                <div style={{ width: '80px', height: '4px', background: '#4f46e5', marginBottom: '1.5rem' }} />
                <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: 0 }}>
                  Хамрах хугацаа: {year}.{month}.01 — {year}.{month}.{new Date(year, month, 0).getDate()}
                </p>
              </div>
            )}

            {/* Slide 2: KPI */}
            {currentSlide === 2 && (
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>НИЙТ ГҮЙЦЭТГЭЛ БА KPI</h2>
                <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.5rem' }}>{year} оны {month}-р сарын борлуулалтын гол үзүүлэлтүүд</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Нийт борлуулалт</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#4f46e5' }}>{formatMoney(report.summary.totalRevenue)}</div>
                  </div>
                  <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Зорилт</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>{formatMoney(report.summary.totalTarget)}</div>
                  </div>
                  <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Биелэлт %</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#059669' }}>{report.summary.achievementRate.toFixed(1)}%</div>
                  </div>
                  <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Өмнөх сараас</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: report.summary.momGrowthRate >= 0 ? '#059669' : '#dc2626' }}>
                      {report.summary.momGrowthRate >= 0 ? '+' : ''}{report.summary.momGrowthRate.toFixed(1)}%
                    </div>
                  </div>
                </div>
                <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}>
                  <p>• Нийт <b>{report.summary.totalOrdersCount}</b> захиалга бүртгэгдсэн.</p>
                  <p>• Нэг захиалгын дундаж дүн: <b>{formatMoney(report.summary.avgOrderValue)}</b>.</p>
                </div>
              </div>
            )}

            {/* Slide 3: Manager Stats */}
            {currentSlide === 3 && (
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>МЕНЕЖЕРҮҮДИЙН ГҮЙЦЭТГЭЛ</h2>
                <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1rem' }}>Борлуулалтын ажилтнуудын зорилт ба биелэлт</p>
                <div style={{ background: '#ffffff', borderRadius: '0.5rem', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                    <thead style={{ background: '#1e293b', color: '#ffffff' }}>
                      <tr>
                        <th style={{ padding: '0.5rem' }}>Менежер</th>
                        <th style={{ padding: '0.5rem', textAlign: 'right' }}>Зорилт</th>
                        <th style={{ padding: '0.5rem', textAlign: 'right' }}>Гүйцэтгэл</th>
                        <th style={{ padding: '0.5rem', textAlign: 'center' }}>Биелэлт %</th>
                        <th style={{ padding: '0.5rem', textAlign: 'center' }}>Захиалга</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.managerStats.map((m, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ padding: '0.5rem', fontWeight: 600 }}>{m.name}</td>
                          <td style={{ padding: '0.5rem', textAlign: 'right' }}>{formatMoney(m.target)}</td>
                          <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 700, color: '#4f46e5' }}>{formatMoney(m.actual)}</td>
                          <td style={{ padding: '0.5rem', textAlign: 'center', fontWeight: 700 }}>{m.achievementRate.toFixed(1)}%</td>
                          <td style={{ padding: '0.5rem', textAlign: 'center' }}>{m.orderCount} ш</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Slide 4-11 generic summaries */}
            {currentSlide >= 4 && currentSlide <= 11 && (
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                  {currentSlide === 4 && 'БОРЛУУЛАЛТЫН СУВГУУД & ГЭРЭЭНИЙ ТӨРӨЛ'}
                  {currentSlide === 5 && 'ХАРИЛЦАГЧИЙН БҮТЦИЙН ШИНЖИЛГЭЭ (B2B vs B2C)'}
                  {currentSlide === 6 && 'ТОП 10 ТЭРГҮҮЛЭГЧ ХАРИЛЦАГЧИД'}
                  {currentSlide === 7 && 'БҮТЭЭГДЭХҮҮНИЙ АНГИЛЛЫН ШИНЖИЛГЭЭ'}
                  {currentSlide === 8 && 'БАРТЕР БОЛОН ХАНДИВЫН ЗАХИАЛГУУД'}
                  {currentSlide === 9 && 'ЗАХИАЛГЫН ТӨЛӨВ & ҮЙЛДВЭРЛЭЛИЙН ХУГАЦАА'}
                  {currentSlide === 10 && 'ТӨЛБӨР ТООЦОО БА ҮЛДЭГДЭЛ АВЛАГА'}
                  {currentSlide === 11 && 'ХАРИЛЦАГЧДАД ОЛГОСОН БЭЛЭГ, УРАМШУУЛАЛ'}
                </h2>
                <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Дэлгэрэнгүй тайлан болон бүтцийг PowerPoint файлд автоматаар бүрэн тусгасан болно.</p>
                <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', minHeight: '180px' }}>
                  <p style={{ color: '#334155', fontSize: '0.9rem' }}>
                    Энэ слайдын нарийвчилсан мэдээллийг дээрх Хяналтын самбараас үзэх эсвэл <b>PowerPoint (PPTX) Татах</b> товчийг дарж слайд хэлбэрээр татаж ашиглана уу.
                  </p>
                </div>
              </div>
            )}

            {/* Slide 12: Conclusion */}
            {currentSlide === 12 && (
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', marginBottom: '1.5rem' }}>
                  ДҮГНЭЛТ БА ЦААШДЫН ЗОРИЛТ
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div style={{ background: '#1e293b', padding: '1.25rem', borderRadius: '0.5rem' }}>
                    <h3 style={{ color: '#34d399', fontSize: '1rem', margin: '0 0 0.5rem 0' }}>✓ Амжилттай ажлууд</h3>
                    <p style={{ color: '#e2e8f0', fontSize: '0.85rem', margin: '0 0 0.25rem 0' }}>• Сарын нийт борлуулалт: {formatMoney(report.summary.totalRevenue)}</p>
                    <p style={{ color: '#e2e8f0', fontSize: '0.85rem', margin: 0 }}>• Хугацаандаа гарсан хувь: {report.orderPipeline.onTimeRate.toFixed(1)}%</p>
                  </div>
                  <div style={{ background: '#1e293b', padding: '1.25rem', borderRadius: '0.5rem' }}>
                    <h3 style={{ color: '#60a5fa', fontSize: '1rem', margin: '0 0 0.5rem 0' }}>→ Цаашид анхаарах</h3>
                    <p style={{ color: '#e2e8f0', fontSize: '0.85rem', margin: '0 0 0.25rem 0' }}>• Үлдэгдэл авлагыг шуурхай цуглуулах</p>
                    <p style={{ color: '#e2e8f0', fontSize: '0.85rem', margin: 0 }}>• Ирэх сарын захиалгын урсгалыг жигдрүүлэх</p>
                  </div>
                </div>
              </div>
            )}

            {/* Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: currentSlide === 1 || currentSlide === 12 ? '#94a3b8' : '#64748b' }}>
              <span>Сэлэнгэ Пресс ХХК</span>
              <span>Слайд {currentSlide} / 12</span>
            </div>
          </div>
        </div>
      )}

      {/* Target Modal */}
      {isTargetModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '0.75rem',
            width: '100%',
            maxWidth: '520px',
            padding: '1.5rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
          }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: '#0f172a' }}>
              🎯 {year} оны {month}-р сарын Зорилт тохируулах
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 1.25rem 0' }}>
              Компанийн нийт борлуулалтын төлөвлөгөө болон менежер тус бүрийн зорилтыг тогтооно
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '60vh', overflowY: 'auto' }}>
              {/* Total Company Target */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                  Компанийн нийт зорилт (₮):
                </label>
                <input
                  type="number"
                  value={targetAmountInput}
                  onChange={(e) => setTargetAmountInput(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}
                />
              </div>

              {/* Managers list */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
                  Менежер тус бүрийн зорилт:
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {managerTargetsList.map((m, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ width: '130px', fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>{m.manager_name}:</span>
                      <input
                        type="number"
                        value={m.target}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          const copy = [...managerTargetsList];
                          copy[idx].target = val;
                          setManagerTargetsList(copy);
                        }}
                        style={{ flex: 1, padding: '0.45rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                      />
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>₮</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
              <button
                onClick={() => setIsTargetModalOpen(false)}
                style={{ padding: '0.5rem 1rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', background: '#ffffff', cursor: 'pointer' }}
              >
                Болих
              </button>
              <button
                onClick={handleSaveTarget}
                disabled={isSavingTarget}
                style={{ padding: '0.5rem 1.25rem', borderRadius: '0.375rem', border: 'none', background: '#4f46e5', color: '#ffffff', fontWeight: 700, cursor: 'pointer' }}
              >
                {isSavingTarget ? 'Хадгалж байна...' : 'Хадгалах'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gift Modal */}
      {isGiftModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '0.75rem',
            width: '100%',
            maxWidth: '480px',
            padding: '1.5rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
          }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: '#0f172a' }}>
              🎁 Харилцагчид олгосон бэлэг бүртгэх
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 1rem 0' }}>
              {year} оны {month}-р сарын бэлгийн бүртгэлд нэмэгдэнэ
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>Харилцагчийн нэр:</label>
                <input
                  type="text"
                  placeholder="Байгууллага эсвэл харилцагчийн нэр..."
                  value={giftCustomerName}
                  onChange={(e) => setGiftCustomerName(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>Бэлгийн нэр төрөл:</label>
                <input
                  type="text"
                  placeholder="Жишээ: Календарь, Дурсгалын үзэг, Цүнх..."
                  value={giftItems}
                  onChange={(e) => setGiftItems(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>Тоо ширхэг:</label>
                <input
                  type="number"
                  min="1"
                  value={giftQty}
                  onChange={(e) => setGiftQty(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>Тэмдэглэл / Тайлбар:</label>
                <input
                  type="text"
                  placeholder="Нэмэлт тайлбар..."
                  value={giftNotes}
                  onChange={(e) => setGiftNotes(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
              <button
                onClick={() => setIsGiftModalOpen(false)}
                style={{ padding: '0.5rem 1rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', background: '#ffffff', cursor: 'pointer' }}
              >
                Болих
              </button>
              <button
                onClick={handleSaveGift}
                disabled={isSavingGift}
                style={{ padding: '0.5rem 1.25rem', borderRadius: '0.375rem', border: 'none', background: '#4f46e5', color: '#ffffff', fontWeight: 700, cursor: 'pointer' }}
              >
                {isSavingGift ? 'Хадгалж байна...' : 'Нэмэх'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

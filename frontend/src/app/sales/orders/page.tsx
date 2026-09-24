"use client";

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../../stores/useAuthStore';
import { useRouter } from 'next/navigation';
import Pagination from '../../../components/Pagination';
import JobTicketModal from '../../../components/production/JobTicketModal';
import ProductionInspectorDrawer from '../../../components/production/ProductionInspectorDrawer';

export default function AllOrdersPage() {
  const { token, user } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [orderStatuses, setOrderStatuses] = useState<any[]>([]);
  const [filterTab, setFilterTab] = useState<'ALL' | 'PENDING' | 'IN_PRODUCTION' | 'READY' | 'DELIVERED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyMine, setShowOnlyMine] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [viewingOrder, setViewingOrder] = useState<any>(null);
  const [inspectingOrder, setInspectingOrder] = useState<any>(null);
  const [loadingTicketId, setLoadingTicketId] = useState<number | null>(null);
  const limit = 20;
  
  const router = useRouter();

  const STAGE_KEYS = [
    { key: 'design', legacy: 'prep', label: 'Эх бэлтгэл' },
    { key: 'raw_material', legacy: 'material', label: 'Цаас/Материал' },
    { key: 'ctp', legacy: 'plate', label: 'CTP Хавтан' },
    { key: 'print', legacy: 'print', label: 'Хэвлэх' },
    { key: 'inspect', legacy: 'check', label: 'Шалгаа' },
    { key: 'fold', legacy: 'fold', label: 'Нугалаа' },
    { key: 'bind', legacy: 'bind', label: 'Үдэх/Савлах' },
  ];

  const getStageVal = (stages: any, item: { key: string, legacy: string }, status?: string) => {
    if (['Бэлэн болсон', 'Бэлэн', 'Хүлээлгэн өгсөн', 'Олгосон'].includes(status || '')) return 100;
    if (!stages) return 0;
    if (stages[item.key]?.status !== undefined) return Number(stages[item.key].status);
    if (stages[item.legacy]?.status !== undefined) return Number(stages[item.legacy].status);
    return 0;
  };

  const getCalculatedProgress = (o: any) => {
    if (['Бэлэн болсон', 'Бэлэн', 'Хүлээлгэн өгсөн', 'Олгосон'].includes(o.current_status || '')) return 100;
    const stages = o.production_stages;
    if (!stages) return 0;
    const total = STAGE_KEYS.reduce((acc, item) => acc + getStageVal(stages, item, o.current_status), 0);
    return Math.round(total / STAGE_KEYS.length);
  };

  const handleOpenTicket = async (orderSummary: any) => {
    if (orderSummary.materials && orderSummary.operations) {
      setViewingOrder(orderSummary);
      return;
    }
    setLoadingTicketId(orderSummary.id);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/orders/${orderSummary.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const fullOrder = await res.json();
        setViewingOrder(fullOrder);
      } else {
        setViewingOrder(orderSummary);
      }
    } catch {
      setViewingOrder(orderSummary);
    } finally {
      setLoadingTicketId(null);
    }
  };

  useEffect(() => {
    if (!token) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/order-statuses`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (Array.isArray(data)) setOrderStatuses(data);
      })
      .catch(() => {});
  }, [token]);

  useEffect(() => {
    if (!token) return;

    const query = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      search: searchTerm,
      statusType: filterTab,
      isMine: showOnlyMine.toString()
    });

    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/orders?${query}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data && data.data) {
          setOrders(data.data.filter((o:any) => o.current_status !== 'Үнийн санал')); 
          setTotalPages(data.meta?.totalPages || 1);
          setTotalCount(data.meta?.total || 0);
        } else if (Array.isArray(data)) {
          setOrders(data);
        }
      })
      .catch(console.error);
  }, [token, page, filterTab, showOnlyMine, searchTerm]);

  useEffect(() => {
    setPage(1);
  }, [filterTab, showOnlyMine, searchTerm]);

  // Color functions
  const deliveredStatusNames = orderStatuses.filter(s => s.type === 'DELIVERED').map(s => s.name);
  const effectiveDeliveredNames = deliveredStatusNames.length > 0 ? deliveredStatusNames : ['Олгосон', 'Хүлээлгэж өгсөн', 'Хүлээлгэн өгсөн'];
  const readyStatusNames = orderStatuses.filter(s => s.type === 'READY').map(s => s.name);
  const effectiveReadyNames = readyStatusNames.length > 0 ? readyStatusNames : ['Бэлэн', 'Бэлэн болсон'];
  const quoteStatusNames = orderStatuses.filter(s => s.type === 'QUOTE').map(s => s.name);
  const effectiveQuoteNames = quoteStatusNames.length > 0 ? quoteStatusNames : ['Үнийн санал'];
  const pendingStatusNames = orderStatuses.filter(s => s.type === 'PENDING').map(s => s.name);
  const effectivePendingNames = pendingStatusNames.length > 0 ? pendingStatusNames : ['Санхүү хүлээгдэж буй', 'Хүлээгдэж буй'];
  const isDeliveredOrder = (o: any) => effectiveDeliveredNames.includes(o.current_status || '');
  const isReadyOrder = (o: any) => !isDeliveredOrder(o) && (effectiveReadyNames.includes(o.current_status || '') || getCalculatedProgress(o) >= 100);
  const isQuoteOrder = (o: any) => effectiveQuoteNames.includes(o.current_status || '');
  const isPendingOrder = (o: any) => effectivePendingNames.includes(o.current_status || '');

  return (
    <div>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="title">Бүх захиалгууд</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Компанийн бүх захиалгын жагсаалт</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button onClick={() => router.push('/sales/production')} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            🏭 Үйлдвэрлэл явц
          </button>
          <button onClick={() => router.push('/sales/orders/board')} className="btn btn-outline">
            📋 Самбараар харах
          </button>
          <button onClick={() => router.push('/sales/orders/new')} className="btn btn-primary">
            + Шинэ захиалга
          </button>
        </div>
      </header>

      <div className="card" style={{ padding: '1.5rem', overflowX: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {[
              { key: 'ALL', label: 'Бүгд', color: '#64748b' },
              { key: 'PENDING', label: '⏳ Санхүү', color: '#f59e0b' },
              { key: 'IN_PRODUCTION', label: '⚙️ Үйлдвэрлэлд', color: '#3b82f6' },
              { key: 'READY', label: '✨ Бэлэн болсон', color: '#10b981' },
              { key: 'DELIVERED', label: '🤝 Олгосон', color: '#475569' }
            ].map((t: any) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setFilterTab(t.key)}
                style={{
                  padding: '0.4rem 0.8rem',
                  borderRadius: '0.375rem',
                  border: '1px solid #cbd5e1',
                  background: filterTab === t.key ? t.color : '#f8fafc',
                  color: filterTab === t.key ? '#fff' : '#334155',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  transition: 'all 0.2s'
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500, marginRight: '0.5rem' }}>
              <input 
                type="checkbox" 
                checked={showOnlyMine} 
                onChange={e => setShowOnlyMine(e.target.checked)} 
                style={{ cursor: 'pointer', accentColor: 'var(--primary-color)' }}
              />
              Зөвхөн минийхийг харах
            </label>
            <input
              type="text"
              placeholder="🔍 Хайх (дугаар, нэр...)"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ padding: '0.45rem 0.75rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', fontSize: '0.85rem', width: '220px' }}
            />
          </div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
              <th style={{ padding: '1rem' }}>Дугаар</th>
              <th style={{ padding: '1rem' }}>Огноо</th>
              <th style={{ padding: '1rem' }}>Харилцагч</th>
              <th style={{ padding: '1rem' }}>Борлуулагч</th>
              <th style={{ padding: '1rem' }}>Бүтээгдэхүүн</th>
              <th style={{ padding: '1rem' }}>Тоо ширхэг</th>
              <th style={{ padding: '1rem' }}>Үйлдвэрлэлийн явц</th>
              <th style={{ padding: '1rem' }}>Төлөв</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Үйлдэл</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => {
              const progress = getCalculatedProgress(o);
              const isFinished = progress >= 100 || ['Бэлэн болсон', 'Бэлэн', 'Хүлээлгэн өгсөн', 'Олгосон'].includes(o.current_status || '');
              const isCancelled = o.current_status === 'Цуцлагдсан';
              const isPending = o.current_status === 'Санхүү хүлээгдэж буй' || o.current_status === 'Хүлээгдэж буй';
              const inProduction = o.current_status === 'Үйлдвэрлэлд';
              
              let activeStageLabel = 'Бэлэн';
              if (!isFinished && !isCancelled) {
                const activeItem = STAGE_KEYS.find(sk => getStageVal(o.production_stages, sk, o.current_status) === 50) 
                  || STAGE_KEYS.find(sk => getStageVal(o.production_stages, sk, o.current_status) === 0) 
                  || STAGE_KEYS[0];
                activeStageLabel = activeItem.label;
              }

              const statusObj = orderStatuses.find(s => s.name === o.current_status);
              const statusColor = statusObj?.color || (isFinished ? '#10b981' : isCancelled ? '#ef4444' : inProduction ? '#3b82f6' : '#f59e0b');
              const barColor = isFinished ? '#10b981' : isCancelled ? '#ef4444' : inProduction ? '#3b82f6' : '#f59e0b';
              
              return (
              <tr key={o.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '1rem', fontWeight: 'bold' }}>{o.order_number || `ID: ${o.id}`}</td>
                <td style={{ padding: '1rem' }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                <td style={{ padding: '1rem' }}>{o.customer_name}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ background: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.8rem', color: '#475569' }}>
                    {o.user?.name || o.sales_person_name || '-'}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>{o.product_name}</td>
                <td style={{ padding: '1rem' }}>{o.total_qty}</td>
                <td style={{ padding: '0.85rem 1rem', minWidth: '175px' }}>
                  <div 
                    onClick={() => setInspectingOrder(o)}
                    style={{ cursor: 'pointer', padding: '0.25rem 0.4rem', borderRadius: '0.375rem', transition: 'background 0.15s' }}
                    title="Үйлдвэрлэлийн явцыг нарийвчлан харах (7 шатлал, машин, гүйцэтгэгч)"
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', marginBottom: '0.35rem', fontWeight: 600 }}>
                      <span style={{ 
                        color: isFinished ? '#15803d' : isCancelled ? '#b91c1c' : inProduction ? '#1d4ed8' : '#b45309',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}>
                        {isFinished ? '✓ Бэлэн (100%)' : isCancelled ? '✕ Цуцлагдсан' : isPending && progress === 0 ? '⏳ Эхлээгүй' : `⚙️ ${activeStageLabel}`}
                      </span>
                      <span style={{ color: barColor, fontSize: '0.8rem', fontWeight: 700 }}>
                        {progress}% 🔍
                      </span>
                    </div>

                    <div style={{ background: '#e2e8f0', borderRadius: '999px', height: '6px', overflow: 'hidden', marginBottom: '5px' }}>
                      <div style={{ 
                        background: barColor, 
                        width: `${progress}%`, 
                        height: '100%', 
                        transition: 'width 0.3s ease',
                        borderRadius: '999px' 
                      }} />
                    </div>

                    <div style={{ display: 'flex', gap: '3px' }}>
                      {STAGE_KEYS.map((item, idx) => {
                        const val = getStageVal(o.production_stages, item, o.current_status);
                        const c = val === 100 ? '#10b981' : val === 50 ? '#3b82f6' : '#cbd5e1';
                        return (
                          <div 
                            key={item.key} 
                            title={`${idx + 1}. ${item.label}: ${val}%`}
                            style={{ flex: 1, height: '4px', borderRadius: '2px', background: c, transition: 'background 0.2s' }} 
                          />
                        );
                      })}
                    </div>
                  </div>
                </td>
                <td style={{ padding: '1rem' }}>
                  <select 
                    value={o.current_status} 
                    disabled={!(o.sales_person_id === user?.id || user?.role === 'ADMIN')}
                    onChange={async (e) => {
                      const newStatus = e.target.value;
                      if (!confirm(`Төлөвийг '${newStatus}' болгож өөрчлөх үү?`)) return;
                      try {
                        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/orders/${o.id}/status`, {
                          method: 'PUT',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                          },
                          body: JSON.stringify({ new_status: newStatus, changed_by: user?.id || 1, notes: 'Жагсаалтаас өөрчлөв' })
                        });
                        if (res.ok) {
                          setOrders(orders.map(order => order.id === o.id ? { ...order, current_status: newStatus } : order));
                        } else {
                          alert('Төлөв өөрчлөхөд алдаа гарлаа.');
                        }
                      } catch (err) {
                        console.error(err);
                        alert('Алдаа гарлаа.');
                      }
                    }}
                    style={{ padding: '0.25rem 0.5rem', background: '#f1f5f9', borderRadius: '1rem', fontSize: '0.85rem', border: '1px solid #cbd5e1', outline: 'none', cursor: 'pointer' }}
                  >
                    {Array.from(new Set([...orderStatuses.map(s => s.name), o.current_status])).map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
                <td style={{ padding: '1rem', textAlign: 'right', gap: '0.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                  {(o.sales_person_id === user?.id || user?.role === 'ADMIN') ? (
                    <button onClick={() => router.push(`/sales/orders/${o.id}`)} className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem' }}>
                      Засах
                    </button>
                  ) : (
                    <button onClick={() => handleOpenTicket(o)} className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem' }} disabled={loadingTicketId === o.id}>
                      {loadingTicketId === o.id ? '...' : 'Харах'}
                    </button>
                  )}
                  <button onClick={() => router.push(`/sales/orders/${o.id}?duplicate=true`)} className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem' }}>
                    Хуулах
                  </button>
                  <button onClick={() => router.push(`/sales/orders/${o.id}/quote`)} className="btn btn-primary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem' }}>
                    Үнийн санал
                  </button>
                </td>
              </tr>
            ); })}
            {orders.length === 0 && (
              <tr>
                <td colSpan={9} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  Захиалга байхгүй байна.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        
        <Pagination 
          currentPage={page} 
          totalPages={totalPages} 
          totalCount={totalCount} 
          onPageChange={(p) => setPage(p)} 
        />
      </div>
      {viewingOrder && <JobTicketModal order={viewingOrder} onClose={() => setViewingOrder(null)} />}
      <ProductionInspectorDrawer
        order={inspectingOrder}
        isOpen={Boolean(inspectingOrder)}
        onClose={() => setInspectingOrder(null)}
      />
    </div>
  );
}

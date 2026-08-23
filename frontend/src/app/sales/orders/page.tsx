"use client";

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../../stores/useAuthStore';
import { useRouter } from 'next/navigation';

export default function AllOrdersPage() {
  const { token, user } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [orderStatuses, setOrderStatuses] = useState<any[]>([]);
  const [filterTab, setFilterTab] = useState<'ALL' | 'QUOTE' | 'PENDING' | 'IN_PRODUCTION' | 'READY' | 'DELIVERED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyMine, setShowOnlyMine] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!token) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/order-statuses`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setOrderStatuses(data);
      })
      .catch(console.error);

    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/orders`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setOrders(data);
      })
      .catch(console.error);
  }, [token]);

  const getOrderProgress = (o: any) => {
    const stages = o.production_stages || {};
    const stageKeys = ['design', 'raw_material', 'ctp', 'print', 'inspect', 'fold', 'bind'];
    const totalVal = stageKeys.reduce((acc, k) => acc + (stages[k]?.status || 0), 0);
    return Math.round(totalVal / stageKeys.length);
  };

  const deliveredStatusNames = orderStatuses.filter(s => s.type === 'DELIVERED').map(s => s.name) || ['Олгосон', 'Хүлээлгэж өгсөн'];
  const readyStatusNames = orderStatuses.filter(s => s.type === 'READY').map(s => s.name) || ['Бэлэн', 'Бэлэн болсон'];
  const quoteStatusNames = orderStatuses.filter(s => s.type === 'QUOTE').map(s => s.name) || ['Үнийн санал'];
  const pendingStatusNames = orderStatuses.filter(s => s.type === 'PENDING').map(s => s.name) || ['Хүлээгдэж буй'];

  const isDeliveredOrder = (o: any) => deliveredStatusNames.includes(o.current_status || '');
  const isReadyOrder = (o: any) => !isDeliveredOrder(o) && (readyStatusNames.includes(o.current_status || '') || getOrderProgress(o) >= 100);
  const isQuoteOrder = (o: any) => quoteStatusNames.includes(o.current_status || '');
  const isPendingOrder = (o: any) => pendingStatusNames.includes(o.current_status || '');
  const isInProductionOrder = (o: any) => !isPendingOrder(o) && !isReadyOrder(o) && !isDeliveredOrder(o) && !isQuoteOrder(o);

  const filteredOrders = orders.filter(o => {
    if (showOnlyMine && o.sales_person_id !== user?.id) return false;
    if (isQuoteOrder(o)) return false; // Hide quotes from orders list
    
    if (filterTab === 'PENDING' && !isPendingOrder(o)) return false;
    if (filterTab === 'IN_PRODUCTION' && !isInProductionOrder(o)) return false;
    if (filterTab === 'READY' && !isReadyOrder(o)) return false;
    if (filterTab === 'DELIVERED' && !isDeliveredOrder(o)) return false;

    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      const matchNo = (o.order_number || '').toLowerCase().includes(s);
      const matchCust = (o.customer_name || '').toLowerCase().includes(s);
      const matchProd = (o.product_name || '').toLowerCase().includes(s);
      const matchSales = (o.user?.name || o.sales_person_name || '').toLowerCase().includes(s);
      if (!matchNo && !matchCust && !matchProd && !matchSales) return false;
    }
    return true;
  });

  return (
    <div>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="title">Бүх захиалгууд</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Компанийн бүх захиалгын жагсаалт</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
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
              { key: 'ALL', label: 'Бүгд', count: orders.filter(o => !isQuoteOrder(o)).length, color: '#64748b' },
              { key: 'PENDING', label: '⏳ Хүлээгдэж буй', count: orders.filter(isPendingOrder).length, color: '#f59e0b' },
              { key: 'IN_PRODUCTION', label: '⚙️ Үйлдвэрлэлд', count: orders.filter(isInProductionOrder).length, color: '#3b82f6' },
              { key: 'READY', label: '✨ Бэлэн болсон', count: orders.filter(isReadyOrder).length, color: '#10b981' },
              { key: 'DELIVERED', label: '🤝 Олгосон', count: orders.filter(isDeliveredOrder).length, color: '#475569' }
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
                {t.label} <span style={{ background: filterTab === t.key ? 'rgba(255,255,255,0.25)' : '#e2e8f0', padding: '0.05rem 0.4rem', borderRadius: '10px', fontSize: '0.75rem' }}>{t.count}</span>
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
            {filteredOrders.map(o => {
              const stages = o.production_stages || {};
              const stageKeys = ['design', 'raw_material', 'ctp', 'print', 'inspect', 'fold', 'bind'];
              const totalVal = stageKeys.reduce((acc, k) => acc + (stages[k]?.status || 0), 0);
              const calculatedProgress = Math.round(totalVal / stageKeys.length);
              
              let progress = calculatedProgress;
              let statusText = o.current_status || 'Тодорхойгүй';
              
              // Determine color dynamically
              const statusObj = orderStatuses.find(s => s.name === o.current_status);
              let statusColor = statusObj?.color || '#3b82f6';
              let hideBar = false;

              // Fallback color logic if missing
              if (!statusObj) {
                if (isDeliveredOrder(o)) {
                  statusColor = '#64748b'; 
                  hideBar = true;
                } else if (o.current_status === 'Цуцлагдсан') {
                  statusColor = '#ef4444'; 
                  hideBar = true;
                } else if (isPendingOrder(o)) {
                  statusColor = '#f59e0b';
                  hideBar = true;
                } else if (isQuoteOrder(o)) {
                  statusColor = '#94a3b8';
                  hideBar = true;
                } else if (isReadyOrder(o)) {
                  statusColor = '#10b981';
                  hideBar = true;
                }
              }
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
                <td style={{ padding: '1rem', minWidth: '130px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: hideBar ? '0' : '0.25rem', fontWeight: 600 }}>
                    <span style={{ color: hideBar ? statusColor : '#334155' }}>{statusText}</span>
                    {!hideBar && <span>{progress}%</span>}
                  </div>
                  {!hideBar && (
                    <div style={{ background: '#e2e8f0', borderRadius: '999px', height: '8px', overflow: 'hidden' }}>
                      <div style={{ background: statusColor, width: `${progress}%`, height: '100%', transition: 'width 0.3s ease' }} />
                    </div>
                  )}
                </td>
                <td style={{ padding: '1rem' }}>
                  <select 
                    value={o.current_status} 
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
                  <button onClick={() => router.push(`/sales/orders/${o.id}`)} className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem' }}>
                    Засах
                  </button>
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
      </div>
    </div>
  );
}

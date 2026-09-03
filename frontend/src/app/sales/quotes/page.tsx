"use client";

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../../stores/useAuthStore';
import { useRouter } from 'next/navigation';
import Pagination from '../../../components/Pagination';

export default function AllQuotesPage() {
  const { token, user } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [orderStatuses, setOrderStatuses] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyMine, setShowOnlyMine] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 20;
  
  const router = useRouter();

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

    // QUOTE is the status type we want for quotes.
    const query = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      search: searchTerm,
      statusType: 'QUOTE',
      isMine: showOnlyMine.toString()
    });

    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/orders?${query}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data && data.data) {
          setOrders(data.data);
          setTotalPages(data.meta?.totalPages || 1);
          setTotalCount(data.meta?.total || 0);
        } else if (Array.isArray(data)) {
          // fallback
          const quoteNames = orderStatuses.filter(s => s.type === 'QUOTE').map(s => s.name);
          setOrders(data.filter(o => quoteNames.includes(o.current_status) || o.current_status === 'Үнийн санал'));
        }
      })
      .catch(console.error);
  }, [token, page, showOnlyMine, searchTerm]);

  useEffect(() => {
    setPage(1);
  }, [showOnlyMine, searchTerm]);

  return (
    <div>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="title">Үнийн саналууд</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Хадгалсан үнийн саналуудын жагсаалт</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => router.push('/sales/quotes/new')} className="btn btn-primary">
            + Шинэ үнийн санал
          </button>
        </div>
      </header>

      <div className="card" style={{ padding: '1.5rem', overflowX: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
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
                <td style={{ padding: '1rem', color: '#64748b', fontSize: '0.9rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#8b5cf6' }}></div>
                    {o.current_status || 'Үнийн санал'}
                  </div>
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
                  <button onClick={() => router.push(`/sales/quotes/${o.id}`)} className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem' }}>
                    ✎ Үзэх
                  </button>
                  <button onClick={() => router.push(`/sales/quotes/${o.id}?duplicate=true`)} className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem' }}>
                    📋 Хувилах
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
    </div>
  );
}

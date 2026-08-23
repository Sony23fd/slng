"use client";

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../../stores/useAuthStore';
import { useRouter } from 'next/navigation';
import Pagination from '../../../components/Pagination';

export default function HistoryPage() {
  const { token, user } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 20;
  
  const router = useRouter();

  useEffect(() => {
    if (!token) return;

    const query = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      search: searchTerm,
      statusType: 'DELIVERED',
      isMine: 'false'
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
          setOrders(data);
        }
      })
      .catch(console.error);
  }, [token, page, searchTerm]);

  return (
    <div>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="title">Түүх</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Хүлээлгэн өгсөн болон цуцлагдсан захиалгууд</p>
        </div>
      </header>

      <div className="card" style={{ padding: '1.5rem', overflowX: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '1.25rem' }}>
          <input
            type="text"
            placeholder="🔍 Хайх (дугаар, нэр...)"
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
            style={{ padding: '0.45rem 0.75rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', fontSize: '0.85rem', width: '220px' }}
          />
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '900px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
              <th style={{ padding: '1rem' }}>Дугаар</th>
              <th style={{ padding: '1rem' }}>Огноо</th>
              <th style={{ padding: '1rem' }}>Харилцагч</th>
              <th style={{ padding: '1rem' }}>Борлуулагч</th>
              <th style={{ padding: '1rem' }}>Бүтээгдэхүүн</th>
              <th style={{ padding: '1rem' }}>Тоо ширхэг</th>
              <th style={{ padding: '1rem' }}>Төлөв</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Үйлдэл</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem' }}>Захиалга олдсонгүй</td></tr>
            ) : (
              orders.map(o => (
                <tr key={o.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem', fontWeight: 'bold' }}>{o.order_number || `ID: ${o.id}`}</td>
                  <td style={{ padding: '1rem' }}>
                    <div>{new Date(o.createdAt).toLocaleDateString()}</div>
                    {o.deadline && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--primary-color)' }}>
                        Хүлээн авах: {new Date(o.deadline).toLocaleDateString()}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div>{o.customer_name}</div>
                    {o.phone && <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{o.phone}</div>}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ background: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.8rem', color: '#475569' }}>
                      {o.user?.name || o.sales_person_name || '-'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>{o.product_name}</td>
                  <td style={{ padding: '1rem' }}>{o.total_qty?.toLocaleString()} ш</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      background: o.current_status === 'Цуцлагдсан' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(100, 116, 139, 0.1)', 
                      color: o.current_status === 'Цуцлагдсан' ? '#ef4444' : '#64748b', 
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      fontSize: '0.85rem',
                      fontWeight: 600
                    }}>
                      {o.current_status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button onClick={() => router.push(`/${user?.role === 'ADMIN' ? 'admin' : 'sales'}/orders/${o.id}`)} className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem' }}>
                      Дэлгэрэнгүй
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div style={{ marginTop: '1.5rem' }}>
            <Pagination currentPage={page} totalPages={totalPages} totalCount={totalCount} onPageChange={setPage} />
          </div>
        )}
      </div>
    </div>
  );
}

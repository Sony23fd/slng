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
      <header style={{ marginBottom: '2rem' }}>
        <h1 className="title">Түүх</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Хүлээлгэн өгсөн болон цуцлагдсан захиалгууд</p>
      </header>

      <div className="card" style={{ padding: '1.5rem', overflowX: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.25rem' }}>
          <input 
            type="text" 
            className="input" 
            placeholder="Хайх (Нэр, Утас, Дугаар)..." 
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
            style={{ maxWidth: '300px' }}
          />
        </div>

        <table className="table" style={{ minWidth: '900px' }}>
          <thead>
            <tr>
              <th>Дугаар</th>
              <th>Харилцагч</th>
              <th>Бүтээгдэхүүн</th>
              <th>Тоо ширхэг</th>
              <th>Огноо</th>
              <th>Төлөв</th>
              <th>Үйлдэл</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>Захиалга олдсонгүй</td></tr>
            ) : (
              orders.map(o => (
                <tr key={o.id}>
                  <td><strong>{o.order_number || o.id}</strong></td>
                  <td>
                    <div>{o.customer_name}</div>
                    {o.phone && <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{o.phone}</div>}
                  </td>
                  <td>{o.product_name}</td>
                  <td>{o.total_qty?.toLocaleString()} ш</td>
                  <td>
                    <div>{new Date(o.createdAt).toLocaleDateString()}</div>
                    {o.deadline && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--primary-color)' }}>
                        Хүлээн авах: {new Date(o.deadline).toLocaleDateString()}
                      </div>
                    )}
                  </td>
                  <td>
                    <span style={{ 
                      background: 'rgba(100, 116, 139, 0.1)', 
                      color: '#64748b', 
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      fontSize: '0.85rem',
                      fontWeight: 600
                    }}>
                      {o.current_status}
                    </span>
                  </td>
                  <td>
                    <button onClick={() => router.push(`/${user?.role === 'ADMIN' ? 'admin' : 'sales'}/orders/${o.id}`)} className="btn btn-outline" style={{ padding: '0.3rem 0.6rem', fontSize: '0.85rem' }}>
                      Дэлгэрэнгүй
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {totalPages > 1 && (
          <Pagination currentPage={page} totalPages={totalPages} totalCount={totalCount} onPageChange={setPage} />
        )}
      </div>
    </div>
  );
}

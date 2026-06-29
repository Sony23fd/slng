"use client";

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../../stores/useAuthStore';
import { useRouter } from 'next/navigation';

export default function MyOrdersPage() {
  const { token, user } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/orders/my`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setOrders(data);
      })
      .catch(console.error);
  }, [token]);

  return (
    <div>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="title">Миний захиалгууд</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Таны үүсгэсэн бүх захиалгын жагсаалт</p>
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
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
              <th style={{ padding: '1rem' }}>Дугаар</th>
              <th style={{ padding: '1rem' }}>Огноо</th>
              <th style={{ padding: '1rem' }}>Харилцагч</th>
              <th style={{ padding: '1rem' }}>Бүтээгдэхүүн</th>
              <th style={{ padding: '1rem' }}>Тоо ширхэг</th>
              <th style={{ padding: '1rem' }}>Үйлдвэрлэлийн явц</th>
              <th style={{ padding: '1rem' }}>Төлөв</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Үйлдэл</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => {
              const stages = o.production_stages || {};
              const stageKeys = ['design', 'raw_material', 'ctp', 'print', 'inspect', 'fold', 'bind'];
              const totalVal = stageKeys.reduce((acc, k) => acc + (stages[k]?.status || 0), 0);
              const progress = Math.round(totalVal / stageKeys.length);

              return (
              <tr key={o.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '1rem', fontWeight: 'bold' }}>{o.order_number || `ID: ${o.id}`}</td>
                <td style={{ padding: '1rem' }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                <td style={{ padding: '1rem' }}>{o.customer_name}</td>
                <td style={{ padding: '1rem' }}>{o.product_name}</td>
                <td style={{ padding: '1rem' }}>{o.total_qty}</td>
                <td style={{ padding: '1rem', minWidth: '130px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.2rem', fontWeight: 600 }}>
                    <span>{progress === 100 ? '✅ Дууссан' : '⚙️ Явагдаж буй'}</span>
                    <span>{progress}%</span>
                  </div>
                  <div style={{ background: '#e2e8f0', borderRadius: '999px', height: '8px', overflow: 'hidden' }}>
                    <div style={{ background: progress === 100 ? '#22c55e' : 'var(--primary-color)', width: `${progress}%`, height: '100%', transition: 'width 0.3s ease' }} />
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
                    <option value="Хүлээгдэж буй">Хүлээгдэж буй</option>
                    <option value="Шинэ захиалга">Шинэ захиалга</option>
                    <option value="Эх бэлтгэл">Эх бэлтгэл</option>
                    <option value="Хэвлэл">Хэвлэл</option>
                    <option value="Дардас">Дардас</option>
                    <option value="Бэлэн">Бэлэн</option>
                    <option value="Олгосон">Олгосон</option>
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
                <td colSpan={8} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
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

"use client";

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../../stores/useAuthStore';
import { useRouter } from 'next/navigation';

export default function MyOrdersPage() {
  const { token } = useAuthStore();
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
        <button onClick={() => router.push('/sales/orders/new')} className="btn btn-primary">
          + Шинэ захиалга
        </button>
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
              <th style={{ padding: '1rem' }}>Төлөв</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Үйлдэл</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '1rem', fontWeight: 'bold' }}>{o.order_number || `ID: ${o.id}`}</td>
                <td style={{ padding: '1rem' }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                <td style={{ padding: '1rem' }}>{o.customer_name}</td>
                <td style={{ padding: '1rem' }}>{o.product_name}</td>
                <td style={{ padding: '1rem' }}>{o.total_qty}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ padding: '0.25rem 0.5rem', background: '#f1f5f9', borderRadius: '1rem', fontSize: '0.85rem' }}>
                    {o.current_status}
                  </span>
                </td>
                <td style={{ padding: '1rem', textAlign: 'right', gap: '0.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={() => router.push(`/sales/orders/${o.id}`)} className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem' }}>
                    Засах
                  </button>
                  <button onClick={() => router.push(`/sales/orders/${o.id}?duplicate=true`)} className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem' }}>
                    Хуулах
                  </button>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
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

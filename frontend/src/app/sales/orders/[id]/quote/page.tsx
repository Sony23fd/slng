"use client";

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../../../../stores/useAuthStore';
import { useRouter, useParams } from 'next/navigation';
import Head from 'next/head';

export default function QuotationPage() {
  const { token, user } = useAuthStore();
  const router = useRouter();
  const params = useParams();
  const { id } = params as { id: string };

  const [order, setOrder] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (token) {
      // Fetch order
      fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/orders/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => setOrder(data))
        .catch(console.error);

      // Fetch profile for the stamp
      fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/auth/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => setProfile(data))
        .catch(console.error);
    }
  }, [token, id]);

  if (!order || !profile) return <div>Түр хүлээнэ үү...</div>;

  const today = new Date().toLocaleDateString('mn-MN', { year: 'numeric', month: '2-digit', day: '2-digit' });

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '2rem', display: 'flex', justifyContent: 'center' }}>
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-area, #printable-area * {
            visibility: visible;
          }
          #printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
            box-shadow: none;
          }
          .no-print {
            display: none !important;
          }
        }
      `}} />

      <div style={{ maxWidth: '800px', width: '100%' }}>
        <div className="no-print" style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button className="btn btn-outline" onClick={() => router.back()}>Буцах</button>
          <button className="btn btn-primary" onClick={() => window.print()}>Хэвлэх (PDF)</button>
        </div>

        <div id="printable-area" style={{ background: 'white', padding: '3rem', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid var(--primary-color)', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
            <div>
              <h1 style={{ color: 'var(--primary-color)', fontSize: '2rem', margin: 0 }}>СЭЛЭНГЭ ПРЕСС</h1>
              <p style={{ margin: '0.5rem 0 0', color: '#64748b' }}>Хэвлэлийн нэгдсэн үйлдвэр</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <h2 style={{ fontSize: '1.5rem', margin: 0, color: '#334155' }}>ҮНИЙН САНАЛ</h2>
              <p style={{ margin: '0.5rem 0 0', fontWeight: 600 }}>Огноо: {today}</p>
              <p style={{ margin: '0.25rem 0 0' }}>Захиалгын №: {order.order_number}</p>
            </div>
          </div>

          {/* Customer Info */}
          <div style={{ marginBottom: '2rem', display: 'flex', gap: '2rem' }}>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '1.1rem', color: '#475569', marginBottom: '0.5rem' }}>Захиалагч:</h3>
              <p style={{ margin: 0, fontWeight: 600, fontSize: '1.1rem' }}>{order.customer_name}</p>
              <p style={{ margin: '0.25rem 0 0' }}>Утас: {order.phone}</p>
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '1.1rem', color: '#475569', marginBottom: '0.5rem' }}>Гүйцэтгэгч:</h3>
              <p style={{ margin: 0, fontWeight: 600, fontSize: '1.1rem' }}>Сэлэнгэ Пресс ХХК</p>
              <p style={{ margin: '0.25rem 0 0' }}>Менежер: {user?.name}</p>
            </div>
          </div>

          {/* Product Details */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#475569', marginBottom: '0.5rem' }}>Бүтээгдэхүүний мэдээлэл:</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f1f5f9' }}>
                  <th style={{ padding: '0.75rem', border: '1px solid #cbd5e1', textAlign: 'left' }}>Тайлбар</th>
                  <th style={{ padding: '0.75rem', border: '1px solid #cbd5e1', textAlign: 'center' }}>Тоо ширхэг</th>
                  <th style={{ padding: '0.75rem', border: '1px solid #cbd5e1', textAlign: 'right' }}>Нэгж үнэ</th>
                  <th style={{ padding: '0.75rem', border: '1px solid #cbd5e1', textAlign: 'right' }}>Нийт дүн</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '0.75rem', border: '1px solid #cbd5e1' }}>
                    <div style={{ fontWeight: 600 }}>{order.product_name}</div>
                    <div style={{ fontSize: '0.9rem', color: '#64748b' }}>{order.size} {order.sub_size ? `(${order.sub_size})` : ''}</div>
                  </td>
                  <td style={{ padding: '0.75rem', border: '1px solid #cbd5e1', textAlign: 'center' }}>{order.total_qty}</td>
                  <td style={{ padding: '0.75rem', border: '1px solid #cbd5e1', textAlign: 'right' }}>
                    {order.total_qty > 0 ? Math.round(order.final_price / order.total_qty).toLocaleString() : 0} ₮
                  </td>
                  <td style={{ padding: '0.75rem', border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 600 }}>
                    {order.final_price.toLocaleString()} ₮
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '3rem' }}>
            <div style={{ width: '300px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontWeight: 600 }}>
                <span>Нийт дүн:</span>
                <span style={{ fontSize: '1.25rem', color: 'var(--primary-color)' }}>{order.final_price.toLocaleString()} ₮</span>
              </div>
              {order.has_vat && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.9rem' }}>
                  <span>Үүнээс НӨАТ (10%):</span>
                  <span>{Math.round(order.final_price * 0.1 / 1.1).toLocaleString()} ₮</span>
                </div>
              )}
            </div>
          </div>

          {/* Signatures */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
            <div style={{ width: '45%' }}>
              <p style={{ fontWeight: 600, marginBottom: '3rem' }}>Зөвшөөрсөн: .......................................</p>
              <p style={{ color: '#64748b' }}>/Захиалагч/</p>
            </div>
            <div style={{ width: '45%', position: 'relative' }}>
              <p style={{ fontWeight: 600, marginBottom: '3rem' }}>Санал болгосон: .......................................</p>
              <p style={{ color: '#64748b' }}>/Менежер: {user?.name}/</p>
              {profile.stamp_url && (
                <div style={{ position: 'absolute', top: '10px', left: '100px', transform: 'rotate(-5deg)' }}>
                  <img src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}${profile.stamp_url}`} alt="Stamp" style={{ width: '150px', objectFit: 'contain', opacity: 0.8 }} />
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

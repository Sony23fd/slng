"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '../../../../../stores/useAuthStore';

export default function InvoicePage() {
  const { id } = useParams();
  const { token } = useAuthStore();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !id) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/orders/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setOrder(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id, token]);

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Уншиж байна...</div>;
  if (!order) return <div style={{ padding: '2rem', textAlign: 'center' }}>Захиалга олдсонгүй.</div>;

  const handlePrint = () => {
    window.print();
  };

  const today = new Date().toLocaleDateString('mn-MN');

  return (
    <div style={{ padding: '1rem', background: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
      {/* Non-printable action bar */}
      <div className="no-print" style={{ width: '100%', maxWidth: '800px', display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <button className="btn btn-outline" onClick={() => router.back()}>
          ← Буцах
        </button>
        <button className="btn btn-primary" onClick={handlePrint}>
          🖨 Хэвлэх / PDF татах
        </button>
      </div>

      {/* Invoice Document (A4 format) */}
      <div 
        className="invoice-document"
        style={{
          width: '100%',
          maxWidth: '800px',
          background: 'white',
          padding: '3rem',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          color: '#0f172a'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #e2e8f0', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ margin: '0 0 0.5rem 0', color: 'var(--primary-color)', fontSize: '2rem' }}>Сэлэнгэ Пресс ХХК</h1>
            <div style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.5' }}>
              Улаанбаатар хот, Сүхбаатар дүүрэг<br />
              Регистр: 2000000<br /> {/* Change according to real data */}
              Утас: 7000-0000<br />
              Имэйл: info@selengepress.mn
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.75rem', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Нэхэмжлэх</h2>
            <div style={{ fontSize: '0.9rem' }}>
              <strong>Огноо:</strong> {today}<br />
              <strong>Нэхэмжлэхийн дугаар:</strong> INV-{order.order_number}<br />
              <strong>Захиалгын дугаар:</strong> {order.order_number}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
          <div>
            <h3 style={{ fontSize: '0.9rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Төлөгч:</h3>
            <div style={{ fontSize: '1rem', fontWeight: 600 }}>{order.company_name || order.customer_name}</div>
            {order.company_registry && <div style={{ fontSize: '0.9rem' }}>Регистр: {order.company_registry}</div>}
            <div style={{ fontSize: '0.9rem' }}>Утас: {order.phone}</div>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #cbd5e1', background: '#f8fafc' }}>
              <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.9rem' }}>Бүтээгдэхүүний нэр</th>
              <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.9rem', width: '100px' }}>Тоо ширхэг</th>
              <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.9rem', width: '150px' }}>Нэгж үнэ</th>
              <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.9rem', width: '150px' }}>Нийт дүн</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '1rem 0.75rem' }}>
                <div style={{ fontWeight: 600 }}>{order.product_name}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>{order.category}</div>
              </td>
              <td style={{ padding: '1rem 0.75rem', textAlign: 'center' }}>{order.total_qty}</td>
              <td style={{ padding: '1rem 0.75rem', textAlign: 'right' }}>
                {((order.total_price || 0) / (order.total_qty || 1)).toLocaleString(undefined, { maximumFractionDigits: 2 })} ₮
              </td>
              <td style={{ padding: '1rem 0.75rem', textAlign: 'right', fontWeight: 600 }}>
                {(order.total_price || 0).toLocaleString()} ₮
              </td>
            </tr>
          </tbody>
        </table>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '3rem' }}>
          <div style={{ width: '300px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', fontWeight: 700, fontSize: '1.25rem', borderTop: '2px solid #cbd5e1' }}>
              <span>НИЙТ ДҮН:</span>
              <span>{(order.total_price || 0).toLocaleString()} ₮</span>
            </div>
            {order.needs_ebarimt && (
              <div style={{ textAlign: 'right', fontSize: '0.8rem', color: '#10b981', marginTop: '0.25rem' }}>
                * И-Баримт шаардлагатай
              </div>
            )}
          </div>
        </div>

        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
          <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>Төлбөрийн мэдээлэл:</h4>
          <div style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.6' }}>
            <strong>Хүлээн авагч банк:</strong> Хаан Банк<br />
            <strong>Дансны дугаар:</strong> 5000000000<br />
            <strong>Дансны нэр:</strong> Сэлэнгэ Пресс ХХК<br />
            <strong>Гүйлгээний утга:</strong> {order.order_number} {order.phone}
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          .invoice-document, .invoice-document * {
            visibility: visible;
          }
          .invoice-document {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            max-width: 100% !important;
            padding: 0 !important;
            box-shadow: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}} />
    </div>
  );
}

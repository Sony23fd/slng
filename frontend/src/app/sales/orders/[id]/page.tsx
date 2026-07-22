"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useAuthStore } from '../../../../stores/useAuthStore';
import OrderForm from '../../../../components/orders/OrderForm';

export default function EditOrderPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const isDuplicate = searchParams.get('duplicate') === 'true';
  const { token } = useAuthStore();
  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id && token) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/orders/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data && !data.error) {
            setInitialData(data);
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [id, token]);

  if (loading) return <div style={{ padding: '2rem' }}>Уншиж байна...</div>;
  if (!initialData) return <div style={{ padding: '2rem' }}>Захиалга олдсонгүй.</div>;

  return (
    <div>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="title">
            {isDuplicate ? 'Захиалга хуулах' : `Захиалга засах (Дугаар: ${initialData.order_number || initialData.id})`}
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            {isDuplicate 
              ? 'Энэхүү захиалга нь шинээр үүснэ. Мэдээллийг өөрчлөөд Хадгалах дарна уу.' 
              : 'Өөрчлөлтүүдээ оруулаад Хадгалах дарна уу.'}
          </p>
        </div>
        {!isDuplicate && (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button 
              className="btn btn-outline" 
              onClick={async () => {
                const name = window.prompt("Бэлэн загвар болгож хадгалах нэрээ оруулна уу (Жишээ: А5 24-нүүр Ширээний календарь):");
                if (!name) return;
                try {
                  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/templates/from-order/${id}`, {
                    method: 'POST',
                    headers: { 
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${token}` 
                    },
                    body: JSON.stringify({ template_name: name })
                  });
                  if (res.ok) {
                    alert("Амжилттай хадгалагдлаа! Одоо шинэ захиалга үүсгэхдээ энэ загварыг шууд сонгох боломжтой.");
                  } else {
                    const data = await res.json();
                    alert("Алдаа гарлаа: " + (data.error || "Тодорхойгүй алдаа"));
                  }
                } catch (e) {
                  alert("Сүлжээний алдаа гарлаа.");
                }
              }}
              style={{ borderColor: '#10b981', color: '#10b981', background: '#ecfdf5' }}
            >
              💾 Загвар болгож хадгалах
            </button>
            <button className="btn btn-outline" onClick={() => window.open(`/sales/orders/${id}/quote`, '_blank')} style={{ borderColor: 'var(--primary-color)', color: 'var(--primary-color)' }}>
              📄 Үнийн санал (PDF)
            </button>
          </div>
        )}
      </header>
      <div className="card">
        <OrderForm initialData={initialData} isEdit={!isDuplicate} orderId={Number(id)} />
      </div>
    </div>
  );
}

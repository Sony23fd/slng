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
    <OrderForm initialData={initialData} isEdit={!isDuplicate} orderId={Number(id)} />
  );

}

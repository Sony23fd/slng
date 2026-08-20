"use client";

import React from 'react';
import OrderForm from '../../../../components/orders/OrderForm';

export default function NewOrderPage() {
  return (
    <div>
      <header style={{ marginBottom: '2rem' }}>
        <h1 className="title">🧮 Шинэ захиалга / Үнэ бодох</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Захиалгын мэдээллийг оруулах эсвэл үнэ бодож үзээд хадгалах боломжтой.</p>
      </header>
      <div className="card">
        <OrderForm isCalculatorMode={true} />
      </div>
    </div>
  );
}

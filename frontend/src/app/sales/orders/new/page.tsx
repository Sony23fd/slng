"use client";

import React from 'react';
import OrderForm from '../../../../components/orders/OrderForm';

export default function NewOrderPage() {
  return (
    <div>
      <header style={{ marginBottom: '2rem' }}>
        <h1 className="title">Шинэ захиалга үүсгэх</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Захиалгын мэдээллийг үнэн зөв оруулна уу.</p>
      </header>
      <div className="card">
        <OrderForm />
      </div>
    </div>
  );
}

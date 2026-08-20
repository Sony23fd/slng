"use client";

import React from 'react';
import OrderForm from '../../../components/orders/OrderForm';

export default function CalculatorPage() {
  return (
    <div>
      <header style={{ marginBottom: '2rem' }}>
        <h1 className="title">🧮 Үнэ бодох (Тооны машин)</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Бүтээгдэхүүний өртөг болон эцсийн үнийг урьдчилан тооцоолох.</p>
      </header>
      
      <div className="card">
        <OrderForm isCalculatorMode={true} />
      </div>
    </div>
  );
}

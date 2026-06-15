"use client";

import React from 'react';
import KanbanBoard from '../../components/production/KanbanBoard';

export default function SalesDashboard() {
  return (
    <div>
      <header style={{ marginBottom: '2rem' }}>
        <h1 className="title">Хянах самбар</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Үйлдвэрлэлийн явцыг хянах хэсэг</p>
      </header>
      
      <section className="card" style={{ padding: '2rem 0' }}>
        <div style={{ padding: '0 2rem', marginBottom: '1rem' }}>
          <h2 className="title" style={{ fontSize: '1.25rem' }}>Захиалгуудын төлөв</h2>
        </div>
        <KanbanBoard />
      </section>
    </div>
  );
}

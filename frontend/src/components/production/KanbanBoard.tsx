"use client";

import React, { useState } from 'react';

const STATUSES = [
  "Эх бэлтгэл хүлээгдэж буй",
  "Түүхий эд татсан",
  "Хэвлэлтэнд орсон",
  "Ажиллагаа хийгдэж буй",
  "Гадуур ажил руу явсан",
  "Бэлэн болсон"
];

const INITIAL_ORDERS = [
  { id: 1, product_name: "А4 Танилцуулга", status: "Эх бэлтгэл хүлээгдэж буй" },
  { id: 2, product_name: "Нэрийн хуудас", status: "Хэвлэлтэнд орсон" }
];

export default function KanbanBoard() {
  const [orders, setOrders] = useState(INITIAL_ORDERS);

  const moveOrder = (id: number, newStatus: string) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
    console.log(`Order ${id} moved to ${newStatus}`);
  };

  return (
    <div className="kanban-board">
      {STATUSES.map(status => (
        <div key={status} className="kanban-column">
          <div className="kanban-header">{status}</div>
          <div className="kanban-items">
            {orders.filter(o => o.status === status).map(order => (
              <div key={order.id} className="kanban-card">
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{order.product_name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Захиалга #{order.id}
                </div>
                <select 
                  style={{ marginTop: '1rem', width: '100%' }}
                  value={order.status}
                  onChange={(e) => moveOrder(order.id, e.target.value)}
                >
                  {STATUSES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

"use client";

import React from 'react';
import { Order } from './ProductionMatrix';

const STATUSES = [
  "Шинэ захиалга",
  "Эх бэлтгэл",
  "Хэвлэл",
  "Дардас",
  "Бэлэн",
  "Олгосон"
];

interface Props {
  orders: Order[];
  onMoveStatus: (orderId: number, newStatus: string) => void;
}

export default function KanbanBoard({ orders, onMoveStatus }: Props) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', alignItems: 'start' }}>
      {STATUSES.map(status => {
        const columnOrders = orders.filter(o => o.current_status !== 'Хүлээгдэж буй' && (o.current_status || 'Шинэ захиалга') === status);
        return (
          <div key={status} style={{ background: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '0.75rem', padding: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--primary-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
              <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>{status}</h4>
              <span style={{ background: 'var(--primary-color)', color: '#fff', fontSize: '0.75rem', padding: '0.1rem 0.5rem', borderRadius: '999px', fontWeight: 600 }}>
                {columnOrders.length}
              </span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minHeight: '150px' }}>
              {columnOrders.length === 0 ? (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0', fontStyle: 'italic' }}>
                  Ажил байхгүй
                </div>
              ) : (
                columnOrders.map(order => (
                  <div key={order.id} style={{ background: 'var(--background-color)', border: '1px solid var(--border-color)', borderRadius: '0.5rem', padding: '0.75rem', transition: 'box-shadow 0.2s ease' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary-color)' }}>
                        {order.order_number || `#${order.id}`}
                      </span>
                      {order.is_urgent && <span title="Яаралтай" style={{ fontSize: '0.9rem' }}>🔥</span>}
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                      {order.product_name}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                      👤 {order.customer_name} | {order.total_qty} ш
                    </div>

                    {/* Notes Warning Block */}
                    {(() => {
                      const hasNotes = Boolean(order.notes) || (order.materials && order.materials.some((m: any) => m.notes)) || (order.operations && order.operations.some((o: any) => o.notes)) || (order.outsourcedJobs && order.outsourcedJobs.some((oj: any) => oj.notes));
                      if (!hasNotes) return null;
                      return (
                        <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '0.375rem', padding: '0.5rem', marginBottom: '0.5rem', fontSize: '0.75rem', color: '#92400e' }}>
                          <div style={{ fontWeight: 700, marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                            <span>⚠️</span> ОНЦГОЙ АНХААРАХ
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                            {order.notes && <div><b>Ерөнхий:</b> {order.notes}</div>}
                            {order.materials?.filter(m => m.notes).map((m, i) => (
                              <div key={`m-${m.id || i}`}><b>Материал ({m.material_name}):</b> {m.notes}</div>
                            ))}
                            {order.operations?.filter(o => o.notes).map((o, i) => (
                              <div key={`o-${o.id || i}`}><b>Ажиллагаа ({o.operation_name}):</b> {o.notes}</div>
                            ))}
                            {order.outsourcedJobs?.filter(oj => oj.notes).map((oj, i) => (
                              <div key={`oj-${oj.id || i}`}><b>Гадуур ажил ({oj.job_name}):</b> {oj.notes}</div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}

                    <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                      <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>Төлөв шилжүүлэх:</label>
                      <select 
                        style={{ width: '100%', padding: '0.35rem', borderRadius: '0.375rem', border: '1px solid var(--border-color)', fontSize: '0.8rem', fontWeight: 600, background: 'var(--surface-color)' }}
                        value={order.current_status || status}
                        onChange={(e) => onMoveStatus(order.id, e.target.value)}
                      >
                        {STATUSES.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

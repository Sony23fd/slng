"use client";

import React, { useState } from 'react';
import { Order, getOrderNotesList } from './ProductionMatrix';
import JobTicketModal from './JobTicketModal';

interface Props {
  orders: Order[];
  statuses: any[];
  onMoveStatus: (orderId: number, newStatus: string) => void;
}

export default function KanbanBoard({ orders, statuses, onMoveStatus }: Props) {
  const [ticketOrder, setTicketOrder] = useState<Order | null>(null);
  const [expandedCards, setExpandedCards] = useState<Record<number, boolean>>({});

  const toggleCardNotes = (orderId: number) => {
    setExpandedCards(prev => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', alignItems: 'start' }}>
      {statuses.map(statusObj => {
        const status = statusObj.name;
        const columnOrders = orders.filter(o => o.current_status !== 'Санхүү хүлээгдэж буй' && (o.current_status || 'Шинэ захиалга') === status);
        return (
          <div key={status} style={{ background: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '0.75rem', padding: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `2px solid ${statusObj.color || 'var(--primary-color)'}`, paddingBottom: '0.5rem', marginBottom: '1rem' }}>
              <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: statusObj.color, marginRight: '6px' }}></span>
                {status}
              </h4>
              <span style={{ background: statusObj.color || 'var(--primary-color)', color: '#fff', fontSize: '0.75rem', padding: '0.1rem 0.5rem', borderRadius: '999px', fontWeight: 600 }}>
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
                      <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                        <button
                          onClick={() => setTicketOrder(order)}
                          style={{
                            padding: '0.15rem 0.4rem',
                            fontSize: '0.7rem',
                            background: '#e2e8f0',
                            border: '1px solid #cbd5e1',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            color: '#475569',
                            fontWeight: 600
                          }}
                          title="Дэлгэрэнгүй хуудас харах"
                        >
                          📄
                        </button>
                        {order.is_urgent && <span title="Яаралтай" style={{ fontSize: '0.9rem' }}>🔥</span>}
                      </div>
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                      {order.product_name}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                      👤 {order.customer_name} | {order.total_qty} ш
                    </div>

                    {/* Payment Status & Warning */}
                    {(() => {
                      const finalPrice = Math.round(Number(order.final_price ?? order.total_price) || 0);
                      const paidAmount = Math.round(Number(order.paid_amount) || 0);
                      const remaining = Math.max(0, finalPrice - paidAmount);
                      const isReady = order.current_status === 'Бэлэн болсон' || order.current_status === 'Бэлэн';

                      if (finalPrice > 0 && remaining > 0 && isReady) {
                        return (
                          <div style={{
                            background: '#fef2f2',
                            border: '1px solid #f87171',
                            borderRadius: '4px',
                            padding: '3px 6px',
                            marginBottom: '0.4rem',
                            fontSize: '0.72rem',
                            color: '#dc2626',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            fontWeight: 700
                          }}>
                            ⚠️ ҮЛДЭГДЭЛ ТӨЛБӨРТЭЙ!
                          </div>
                        );
                      }

                      if (finalPrice > 0) {
                        const isPaid = paidAmount >= finalPrice;
                        return (
                          <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', marginBottom: '0.5rem', fontSize: '0.72rem' }}>
                            <span style={{ 
                              padding: '2px 8px', 
                              borderRadius: '4px', 
                              fontWeight: 700,
                              background: isPaid ? '#dcfce7' : paidAmount > 0 ? '#fef3c7' : '#fee2e2',
                              color: isPaid ? '#15803d' : paidAmount > 0 ? '#b45309' : '#b91c1c'
                            }}>
                              {isPaid ? '✓ Төлөгдсөн' : paidAmount > 0 ? '🟡 Урьдчилгаатай' : '🔴 Төлбөргүй'}
                            </span>
                          </div>
                        );
                      }
                      return null;
                    })()}

                    {/* Clean Collapsible Sales Directives / Notes Block */}
                    {(() => {
                      const notesList = getOrderNotesList(order);
                      if (notesList.length === 0) return null;
                      const isExpanded = Boolean(expandedCards[order.id]);

                      return (
                        <div style={{
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderLeft: '3px solid #0284c7',
                          borderRadius: '0.375rem',
                          padding: '0.35rem 0.5rem',
                          marginBottom: '0.5rem',
                          fontSize: '0.75rem'
                        }}>
                          <div
                            onClick={() => toggleCardNotes(order.id)}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              cursor: 'pointer',
                              fontWeight: 600,
                              color: '#0369a1'
                            }}
                          >
                            <span>💬 Заавар ({notesList.length})</span>
                            <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
                              {isExpanded ? '▲ Хураах' : '▼ Дэлгэх'}
                            </span>
                          </div>
                          {isExpanded ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.35rem', paddingTop: '0.35rem', borderTop: '1px dashed #cbd5e1' }}>
                              {notesList.map((n, i) => (
                                <div key={i} style={{ color: '#334155' }}>
                                  <b style={{ color: '#0284c7' }}>{n.category}:</b> {n.text}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div
                              style={{
                                color: '#64748b',
                                fontSize: '0.7rem',
                                marginTop: '0.15rem',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                              title={notesList[0].text}
                            >
                              {notesList[0].text}
                            </div>
                          )}
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
                        {statuses.map(s => (
                          <option key={s.name} value={s.name}>{s.name}</option>
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

      {ticketOrder && (
        <JobTicketModal order={ticketOrder} onClose={() => setTicketOrder(null)} />
      )}
    </div>
  );
}

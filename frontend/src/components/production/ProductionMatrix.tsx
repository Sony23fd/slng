"use client";

import React, { useState } from 'react';
import JobTicketModal from './JobTicketModal';

export interface OrderStageData {
  status: number; // 0 = 0%, 50 = 50%, 100 = 100%
  completed_qty?: number;
  waste_qty?: number;
  operator?: string;
  machine?: string;
  updatedAt?: string;
}

export interface ProductionStages {
  design?: OrderStageData;
  raw_material?: OrderStageData;
  ctp?: OrderStageData;
  print?: OrderStageData;
  inspect?: OrderStageData;
  fold?: OrderStageData;
  bind?: OrderStageData;
  [key: string]: OrderStageData | undefined;
}

export interface Order {
  id: number;
  order_number?: string;
  customer_name: string;
  product_name: string;
  total_qty: number;
  is_urgent: boolean;
  deadline?: string;
  createdAt: string;
  sales_person_name?: string;
  current_status: string;
  production_stages?: ProductionStages;
  notes?: string;
  materials?: any[];
  operations?: any[];
  outsourcedJobs?: any[];
}

const STAGES = [
  { key: 'design', label: 'Эх бэлтгэл', group: 'Үндсэн' },
  { key: 'raw_material', label: 'Түүхий эд бэлтгэх', group: 'Үндсэн' },
  { key: 'ctp', label: 'Хавтан', group: 'Хэвлэх' },
  { key: 'print', label: 'Хэвлэх', group: 'Хэвлэх', hasMachine: true },
  { key: 'inspect', label: 'Шалгаа', group: 'Дэвтэрлэх' },
  { key: 'fold', label: 'Нугалаа', group: 'Дэвтэрлэх' },
  { key: 'bind', label: 'Үдээ', group: 'Дэвтэрлэх' },
];

const MACHINES = ['DIGITAL KONIKA', 'KOMORI', 'KOMORI RYOBI', 'HEIDELBERG', 'CTP'];
const OPERATORS = ['Ч.Төрболд', 'Б.Тамир', 'Д.Отгонбаяр', 'И.Уранбилэг', 'Оператор 1', 'Оператор 2'];

interface Props {
  orders: Order[];
  statuses: any[];
  onUpdateStage: (orderId: number, stageKey: string, newData: OrderStageData) => void;
}

export default function ProductionMatrix({ orders, statuses, onUpdateStage }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUrgent, setFilterUrgent] = useState(false);
  const [statusTab, setStatusTab] = useState<'ACTIVE' | 'COMPLETED' | 'DELIVERED'>('ACTIVE');
  const [activeModal, setActiveModal] = useState<{ orderId: number; stageKey: string; data: OrderStageData } | null>(null);
  const [ticketOrder, setTicketOrder] = useState<Order | null>(null);

  // Helper to calculate overall % of an order
  const getOverallProgress = (stages?: ProductionStages) => {
    if (!stages) return 0;
    let total = 0;
    STAGES.forEach(s => {
      const val = stages[s.key]?.status || 0;
      total += val;
    });
    return Math.round(total / STAGES.length);
  };

  // Helper to check if deadline is bottleneck (<=24 hours or past due and <100% complete)
  const isBottleneck = (order: Order) => {
    const progress = getOverallProgress(order.production_stages);
    if (progress >= 100) return false;
    if (order.is_urgent) return true;
    if (!order.deadline) return false;
    const now = new Date().getTime();
    const deadline = new Date(order.deadline).getTime();
    const diffHours = (deadline - now) / (1000 * 60 * 60);
    return diffHours <= 24;
  };

  // Get status names by type
  const deliveredStatusNames = statuses?.filter(s => s.type === 'DELIVERED').map(s => s.name) || ['Олгосон', 'Хүлээлгэж өгсөн'];
  const readyStatusNames = statuses?.filter(s => s.type === 'READY').map(s => s.name) || ['Бэлэн', 'Бэлэн болсон'];

  const isDeliveredOrder = (o: Order) => deliveredStatusNames.includes(o.current_status || '');
  const isReadyOrder = (o: Order) => !isDeliveredOrder(o) && (readyStatusNames.includes(o.current_status || '') || getOverallProgress(o.production_stages) >= 100);
  const isActiveOrder = (o: Order) => o.current_status !== 'Санхүү хүлээгдэж буй' && !isReadyOrder(o) && !isDeliveredOrder(o);

  const activeCount = orders.filter(isActiveOrder).length;
  const completedCount = orders.filter(isReadyOrder).length;
  const deliveredCount = orders.filter(isDeliveredOrder).length;

  const filteredOrders = orders.filter(o => {
    if (o.current_status === 'Санхүү хүлээгдэж буй') return false;
    if (statusTab === 'ACTIVE' && !isActiveOrder(o)) return false;
    if (statusTab === 'COMPLETED' && !isReadyOrder(o)) return false;
    if (statusTab === 'DELIVERED' && !isDeliveredOrder(o)) return false;

    const matchesSearch = 
      (o.order_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.product_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUrgent = filterUrgent ? (o.is_urgent || isBottleneck(o)) : true;
    return matchesSearch && matchesUrgent;
  });

  const handleCellClick = (order: Order, stageKey: string) => {
    const currentData = order.production_stages?.[stageKey] || { status: 0 };
    setActiveModal({ orderId: order.id, stageKey, data: currentData });
  };

  return (
    <div className="production-matrix">
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.75rem', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => setStatusTab('ACTIVE')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            border: 'none',
            background: statusTab === 'ACTIVE' ? 'var(--primary-color)' : 'var(--surface-color)',
            color: statusTab === 'ACTIVE' ? '#fff' : 'var(--text-primary)',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s',
            boxShadow: statusTab === 'ACTIVE' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
          }}
        >
          🟢 Идэвхтэй үйлдвэрлэл <span style={{ background: statusTab === 'ACTIVE' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.06)', padding: '0.1rem 0.5rem', borderRadius: '12px', fontSize: '0.8rem' }}>{activeCount}</span>
        </button>
        <button
          type="button"
          onClick={() => setStatusTab('COMPLETED')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            border: 'none',
            background: statusTab === 'COMPLETED' ? '#10b981' : 'var(--surface-color)',
            color: statusTab === 'COMPLETED' ? '#fff' : 'var(--text-primary)',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s',
            boxShadow: statusTab === 'COMPLETED' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
          }}
        >
          ✅ Бэлэн болсон <span style={{ background: statusTab === 'COMPLETED' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.06)', padding: '0.1rem 0.5rem', borderRadius: '12px', fontSize: '0.8rem' }}>{completedCount}</span>
        </button>
        <button
          type="button"
          onClick={() => setStatusTab('DELIVERED')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            border: 'none',
            background: statusTab === 'DELIVERED' ? '#64748b' : 'var(--surface-color)',
            color: statusTab === 'DELIVERED' ? '#fff' : 'var(--text-primary)',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s',
            boxShadow: statusTab === 'DELIVERED' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
          }}
        >
          📦 Олгосон <span style={{ background: statusTab === 'DELIVERED' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.06)', padding: '0.1rem 0.5rem', borderRadius: '12px', fontSize: '0.8rem' }}>{deliveredCount}</span>
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flex: 1, minWidth: '300px' }}>
          <input
            type="text"
            placeholder="🔍 Захиалгын №, Харилцагч, Бүтээгдэхүүний нэрээр хайх..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              padding: '0.6rem 1rem',
              borderRadius: '0.5rem',
              border: '1px solid var(--border-color)',
              flex: 1,
              fontSize: '0.95rem'
            }}
          />
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600, color: filterUrgent ? '#e11d48' : 'inherit' }}>
            <input
              type="checkbox"
              checked={filterUrgent}
              onChange={e => setFilterUrgent(e.target.checked)}
              style={{ width: '1.2rem', height: '1.2rem' }}
            />
            🚨 Яаралтай & Эрсдэлтэй ажлууд
          </label>
        </div>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Нийт харуулж буй: <b>{filteredOrders.length}</b> захиалга
        </div>
      </div>

      <div style={{ overflowX: 'auto', borderRadius: '0.75rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid var(--border-color)', background: 'var(--surface-color)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ background: 'var(--primary-color)', color: '#fff', borderBottom: '2px solid var(--border-color)' }}>
              <th rowSpan={2} style={{ padding: '0.75rem 0.5rem', borderRight: '1px solid rgba(255,255,255,0.2)', minWidth: '90px' }}>Захиалга №</th>
              <th rowSpan={2} style={{ padding: '0.75rem 0.5rem', borderRight: '1px solid rgba(255,255,255,0.2)', minWidth: '130px' }}>Харилцагч</th>
              <th rowSpan={2} style={{ padding: '0.75rem 0.5rem', borderRight: '1px solid rgba(255,255,255,0.2)', minWidth: '150px' }}>Бүтээгдэхүүн</th>
              <th rowSpan={2} style={{ padding: '0.75rem 0.5rem', borderRight: '1px solid rgba(255,255,255,0.2)', width: '85px' }}>Эх бэлтгэл</th>
              <th rowSpan={2} style={{ padding: '0.75rem 0.5rem', borderRight: '1px solid rgba(255,255,255,0.2)', width: '85px' }}>Түүхий эд</th>
              <th colSpan={2} style={{ padding: '0.5rem', borderRight: '1px solid rgba(255,255,255,0.2)', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>Хэвлэх</th>
              <th colSpan={3} style={{ padding: '0.5rem', borderRight: '1px solid rgba(255,255,255,0.2)', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>Дэвтэрлэх</th>
              <th rowSpan={2} style={{ padding: '0.75rem 0.5rem', minWidth: '100px' }}>Хүлээлгэн өгөх / Явц</th>
            </tr>
            <tr style={{ background: '#1e293b', color: '#fff', fontSize: '0.8rem' }}>
              <th style={{ padding: '0.4rem', borderRight: '1px solid rgba(255,255,255,0.1)', width: '85px' }}>Хавтан</th>
              <th style={{ padding: '0.4rem', borderRight: '1px solid rgba(255,255,255,0.1)', width: '100px' }}>Хэвлэх</th>
              <th style={{ padding: '0.4rem', borderRight: '1px solid rgba(255,255,255,0.1)', width: '75px' }}>Шалгаа</th>
              <th style={{ padding: '0.4rem', borderRight: '1px solid rgba(255,255,255,0.1)', width: '75px' }}>Нугалаа</th>
              <th style={{ padding: '0.4rem', borderRight: '1px solid rgba(255,255,255,0.1)', width: '75px' }}>Үдээ</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={11} style={{ padding: '2rem', color: 'var(--text-muted)' }}>Одоохондоо захиалга эсвэл хайлтад тохирох ажил байхгүй байна.</td>
              </tr>
            ) : (
              filteredOrders.map((order, index) => {
                const bottleneck = isBottleneck(order);
                const calculatedProgress = getOverallProgress(order.production_stages);
                let progress = calculatedProgress;
                if (readyStatusNames.includes(order.current_status || '') || deliveredStatusNames.includes(order.current_status || '')) {
                  progress = 100;
                }
                const hasNotes = Boolean(order.notes) || (order.materials && order.materials.some((m: any) => m.notes)) || (order.operations && order.operations.some((o: any) => o.notes)) || (order.outsourcedJobs && order.outsourcedJobs.some((oj: any) => oj.notes));

                return (
                  <React.Fragment key={order.id}>
                    <tr style={{ background: index % 2 === 0 ? '#fff' : '#f8fafc', transition: 'background 0.2s', borderBottom: hasNotes ? 'none' : '1px solid var(--border-color)' }}>
                      <td style={{ padding: '0.6rem 0.4rem', fontWeight: 700, color: 'var(--primary-color)', borderRight: '1px solid var(--border-color)' }}>
                        {order.order_number || `#${order.id}`}
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400, marginBottom: '0.25rem' }}>
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
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
                          📄 Дэлгэрэнгүй
                        </button>
                      </td>
                      <td style={{ padding: '0.6rem 0.4rem', textAlign: 'left', borderRight: '1px solid var(--border-color)', fontWeight: 600 }}>
                        {order.customer_name}
                        {order.sales_person_name && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                            👤 {order.sales_person_name}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '0.6rem 0.4rem', textAlign: 'left', borderRight: '1px solid var(--border-color)' }}>
                        <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          {order.is_urgent && <span title="Яаралтай захиалга" style={{ color: '#e11d48' }}>🔥</span>}
                          {order.product_name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Тоо: <b>{order.total_qty.toLocaleString()} ш</b>
                        </div>
                      </td>

                      {/* Render 7 Stages */}
                      {STAGES.map(stage => {
                        const stData = order.production_stages?.[stage.key] || { status: 0 };
                        let bgColor = '#ef4444'; // Red 0%
                        let textColor = '#fff';
                        if (stData.status === 100) {
                          bgColor = '#22c55e'; // Green 100%
                        } else if (stData.status > 0) {
                          bgColor = '#eab308'; // Yellow/Orange in progress
                          textColor = '#000';
                        }

                        return (
                          <td key={stage.key} style={{ padding: '0.3rem', borderRight: '1px solid var(--border-color)' }}>
                            <div
                              onClick={() => handleCellClick(order, stage.key)}
                              title="Дэлгэрэнгүй бүртгэх"
                              style={{
                                background: bgColor,
                                color: textColor,
                                padding: '0.4rem 0.2rem',
                                borderRadius: '0.375rem',
                                cursor: 'pointer',
                                fontWeight: 700,
                                fontSize: '0.8rem',
                                transition: 'transform 0.1s ease',
                                position: 'relative',
                                minHeight: '50px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                              }}
                            >
                              <div style={{ fontSize: '0.9rem' }}>{stData.status}%</div>
                              {stData.completed_qty !== undefined && stData.completed_qty > 0 && (
                                <div style={{ fontSize: '0.7rem', fontWeight: 600, opacity: 0.9 }}>
                                  {stData.completed_qty.toLocaleString()} / {order.total_qty.toLocaleString()}
                                </div>
                              )}
                              {(stData.operator || stData.machine) && (
                                <div style={{ fontSize: '0.65rem', fontWeight: 500, lineHeight: 1.1, marginTop: '2px', opacity: 0.9 }}>
                                  {stData.machine || stData.operator}
                                </div>
                              )}
                              {stData.waste_qty ? (
                                <div style={{ fontSize: '0.6rem', color: '#7f1d1d', background: 'rgba(255,255,255,0.8)', padding: '1px 4px', borderRadius: '4px', marginTop: '2px' }}>
                                  Гологдол: {stData.waste_qty}
                                </div>
                              ) : null}
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveModal({ orderId: order.id, stageKey: stage.key, data: stData });
                              }}
                              style={{
                                background: 'none',
                                border: 'none',
                                fontSize: '0.7rem',
                                color: 'var(--text-muted)',
                                cursor: 'pointer',
                                marginTop: '2px',
                                textDecoration: 'underline'
                              }}
                            >
                              ✏️ Тохируулах
                            </button>
                          </td>
                        );
                      })}

                      <td style={{ padding: '0.6rem 0.4rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontWeight: bottleneck ? 700 : 500, color: bottleneck ? '#e11d48' : 'inherit' }}>
                          {bottleneck && <span title="Хугацаа тулсан эсвэл яаралтай!">🚨</span>}
                          {order.deadline ? new Date(order.deadline).toLocaleDateString() : 'Тодорхойгүй'}
                        </div>
                        <div style={{ marginTop: '0.3rem', background: '#e2e8f0', borderRadius: '999px', height: '6px', width: '80%', margin: '0.3rem auto 0' }}>
                          <div style={{ background: progress === 100 ? '#22c55e' : 'var(--primary-color)', height: '100%', borderRadius: '999px', width: `${progress}%` }}></div>
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          Явц: <b>{progress}%</b>
                        </div>
                      </td>
                    </tr>
                    {hasNotes && (
                      <tr style={{ background: '#fef2f2', borderBottom: '2px solid var(--border-color)', animation: 'pulse-light 2s infinite' }}>
                        <td colSpan={11} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.9rem', color: '#b91c1c', borderLeft: '4px solid #ef4444' }}>
                          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                            <div style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
                              <span style={{ animation: 'bounce-light 1s infinite' }}>🚨</span> ОНЦГОЙ АНХААРАХ:
                            </div>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                              {order.notes && <div style={{ fontWeight: 600 }}><b>Ерөнхий:</b> {order.notes}</div>}
                              {order.materials?.filter(m => m.notes).map((m, i) => (
                                <div key={`m-${m.id || i}`}><b>Материал ({m.material_name}):</b> <span style={{ fontWeight: 600 }}>{m.notes}</span></div>
                              ))}
                              {order.operations?.filter(o => o.notes).map((o, i) => (
                                <div key={`o-${o.id || i}`}><b>Ажиллагаа ({o.operation_name}):</b> <span style={{ fontWeight: 600 }}>{o.notes}</span></div>
                              ))}
                              {order.outsourcedJobs?.filter(oj => oj.notes).map((oj, i) => (
                                <div key={`oj-${oj.id || i}`}><b>Гадуур ажил ({oj.job_name}):</b> <span style={{ fontWeight: 600 }}>{oj.notes}</span></div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal for Setting Machine / Operator */}
      {activeModal && (() => {
        const modalOrder = orders.find(o => o.id === activeModal.orderId);
        const totalQty = modalOrder?.total_qty || 1;
        
        const handleQtyChange = (val: number) => {
          let newQty = val;
          if (newQty < 0) newQty = 0;
          if (newQty > totalQty) newQty = totalQty;
          let newStatus = Math.round((newQty / totalQty) * 100);
          setActiveModal({ ...activeModal, data: { ...activeModal.data, completed_qty: newQty, status: newStatus } });
        };

        const handleStatusChange = (val: number) => {
          let newStatus = val;
          if (newStatus < 0) newStatus = 0;
          if (newStatus > 100) newStatus = 100;
          let newQty = Math.round((newStatus / 100) * totalQty);
          setActiveModal({ ...activeModal, data: { ...activeModal.data, status: newStatus, completed_qty: newQty } });
        };

        return (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'var(--surface-color)', padding: '1.5rem', borderRadius: '0.75rem',
            width: '90%', maxWidth: '420px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
            maxHeight: '90vh', overflowY: 'auto'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              🛠️ Дамжлага дэлгэрэнгүй бүртгэх
            </h3>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <button type="button" className="btn btn-outline" style={{ flex: 1, padding: '0.5rem', fontSize: '0.85rem' }} onClick={() => handleStatusChange(10)}>
                ▶️ Эхлүүлэх
              </button>
              <button type="button" className="btn btn-outline" style={{ flex: 1, padding: '0.5rem', fontSize: '0.85rem', background: '#dcfce7', color: '#166534', borderColor: '#bbf7d0' }} onClick={() => handleStatusChange(100)}>
                ✅ Дуусгах
              </button>
            </div>

            <div className="form-group" style={{ marginBottom: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem' }}>
              <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 600 }}>
                <span>Хийгдсэн тоо:</span>
                <span style={{ color: 'var(--primary-color)' }}>{activeModal.data.status}%</span>
              </label>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <input
                  type="number"
                  value={activeModal.data.completed_qty !== undefined ? activeModal.data.completed_qty : Math.round((activeModal.data.status / 100) * totalQty)}
                  onChange={e => handleQtyChange(Number(e.target.value))}
                  style={{ flex: 1, padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid var(--border-color)', fontWeight: 'bold' }}
                  min={0}
                  max={totalQty}
                />
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>/ {totalQty.toLocaleString()} ш</span>
              </div>
              
              <input 
                type="range" 
                min="0" max="100" 
                value={activeModal.data.status} 
                onChange={e => handleStatusChange(Number(e.target.value))}
                style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--primary-color)' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 600, color: '#991b1b' }}>Гологдол / Хаягдал (ш):</label>
              <input
                type="number"
                value={activeModal.data.waste_qty || 0}
                onChange={e => setActiveModal({ ...activeModal, data: { ...activeModal.data, waste_qty: Number(e.target.value) } })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #fca5a5', background: '#fef2f2' }}
                min={0}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 600 }}>Тоног төхөөрөмж (Машин):</label>
              <select
                value={activeModal.data.machine || ''}
                onChange={e => setActiveModal({ ...activeModal, data: { ...activeModal.data, machine: e.target.value } })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid var(--border-color)' }}
              >
                <option value="">-- Сонгоогүй --</option>
                {MACHINES.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 600 }}>Хариуцсан ажилтан:</label>
              <select
                value={activeModal.data.operator || ''}
                onChange={e => setActiveModal({ ...activeModal, data: { ...activeModal.data, operator: e.target.value } })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid var(--border-color)' }}
              >
                <option value="">-- Сонгоогүй --</option>
                {OPERATORS.map(op => (
                  <option key={op} value={op}>{op}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setActiveModal(null)}
              >
                Цуцлах
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  onUpdateStage(activeModal.orderId, activeModal.stageKey, {
                    ...activeModal.data,
                    updatedAt: new Date().toISOString()
                  });
                  setActiveModal(null);
                }}
              >
                Хадгалах
              </button>
            </div>
          </div>
        </div>
        );
      })()}

      {ticketOrder && (
        <JobTicketModal order={ticketOrder} onClose={() => setTicketOrder(null)} />
      )}
    </div>
  );
}

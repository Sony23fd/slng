"use client";

import React, { useState } from 'react';

export interface OrderStageData {
  status: number; // 0 = 0%, 50 = 50%, 100 = 100%
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
  onUpdateStage: (orderId: number, stageKey: string, newData: OrderStageData) => void;
}

export default function ProductionMatrix({ orders, onUpdateStage }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUrgent, setFilterUrgent] = useState(false);
  const [activeModal, setActiveModal] = useState<{ orderId: number; stageKey: string; data: OrderStageData } | null>(null);

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

  const filteredOrders = orders.filter(o => {
    const matchesSearch = 
      (o.order_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.product_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUrgent = filterUrgent ? (o.is_urgent || isBottleneck(o)) : true;
    return matchesSearch && matchesUrgent;
  });

  const handleCellClick = (order: Order, stageKey: string) => {
    const currentData = order.production_stages?.[stageKey] || { status: 0 };
    // Cycle status: 0 -> 100 -> 50 -> 0
    let nextStatus = 100;
    if (currentData.status === 0) nextStatus = 100;
    else if (currentData.status === 100) nextStatus = 50;
    else nextStatus = 0;

    const newData: OrderStageData = {
      ...currentData,
      status: nextStatus,
      updatedAt: new Date().toISOString()
    };
    onUpdateStage(order.id, stageKey, newData);
  };

  return (
    <div className="production-matrix">
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
              filteredOrders.map(order => {
                const bottleneck = isBottleneck(order);
                const progress = getOverallProgress(order.production_stages);
                return (
                  <tr key={order.id} style={{ borderBottom: '1px solid var(--border-color)', background: bottleneck ? 'rgba(254, 226, 226, 0.3)' : 'inherit' }}>
                    <td style={{ padding: '0.6rem 0.4rem', fontWeight: 700, color: 'var(--primary-color)', borderRight: '1px solid var(--border-color)' }}>
                      {order.order_number || `#${order.id}`}
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
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
                            title="Дээр нь дарж төлөв солино (0% -> 100% -> 50%)"
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
                              minHeight: '44px',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'center',
                              alignItems: 'center',
                              boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                            }}
                          >
                            <div>{stData.status}%</div>
                            {(stData.operator || stData.machine) && (
                              <div style={{ fontSize: '0.65rem', fontWeight: 500, lineHeight: 1.1, marginTop: '2px', opacity: 0.9 }}>
                                {stData.machine || stData.operator}
                              </div>
                            )}
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
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal for Setting Machine / Operator */}
      {activeModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'var(--surface-color)',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            width: '90%',
            maxWidth: '400px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem', color: 'var(--text-primary)' }}>
              🛠️ Дамжлага дэлгэрэнгүй бүртгэх
            </h3>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 600 }}>Гүйцэтгэлийн хувь:</label>
              <select
                value={activeModal.data.status}
                onChange={e => setActiveModal({ ...activeModal, data: { ...activeModal.data, status: Number(e.target.value) } })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid var(--border-color)' }}
              >
                <option value={0}>0% (Эхлээгүй - Улаан)</option>
                <option value={50}>50% (Явагдаж буй - Шар)</option>
                <option value={100}>100% (Дууссан - Ногоон)</option>
              </select>
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
      )}
    </div>
  );
}

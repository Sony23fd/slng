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
  additional_ops?: OrderStageData;
  inspect?: OrderStageData;
  bind?: OrderStageData;
  cut?: OrderStageData;
  qc_pack?: OrderStageData;
  // Legacy keys
  prep?: OrderStageData;
  material?: OrderStageData;
  plate?: OrderStageData;
  check?: OrderStageData;
  fold?: OrderStageData;
  [key: string]: OrderStageData | undefined;
}

export interface Order {
  id: number;
  order_number?: string;
  customer_name: string;
  phone?: string;
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
  final_price?: number;
  total_price?: number;
  paid_amount?: number;
  remaining_balance?: number;
  payment_status?: string;
  paid_percent?: number;
}

export const STAGES = [
  { key: 'design', label: 'Эх бэлтгэл', group: 'Бэлтгэл', icon: '🎨' },
  { key: 'raw_material', label: 'Түүхий эд', group: 'Бэлтгэл', icon: '📦' },
  { key: 'ctp', label: 'Хавтан', group: 'Хэвлэх', icon: '💿' },
  { key: 'print', label: 'Хэвлэх', group: 'Хэвлэх', icon: '🖨️', hasMachine: true },
  { key: 'additional_ops', label: 'Нэмэлт ажил', group: 'Боловсруулалт', icon: '✨', isSpecial: true },
  { key: 'inspect', label: 'Шалгах/Цуглуулах', group: 'Дэвтэрлэх', icon: '🔍' },
  { key: 'bind', label: 'Үдэх/Наах', group: 'Дэвтэрлэх', icon: '📚' },
  { key: 'cut', label: 'Огтлоо', group: 'Эцсийн', icon: '✂️' },
  { key: 'qc_pack', label: 'Чанар/Савлалт', group: 'Эцсийн', icon: '📦' },
];

export const MACHINES = [
  'KOMORI',
  'Komori. Ryobi',
  'Ryobi 750',
  'Ryobi 680',
  'CTP',
  'Digital Konica',
];

export const getStageData = (stages?: any, key?: string): OrderStageData => {
  if (!stages || !key) return { status: 0 };
  if (stages[key]) return stages[key];
  const legacyMap: Record<string, string> = {
    design: 'prep',
    raw_material: 'material',
    ctp: 'plate',
    inspect: 'check',
    cut: 'fold',
  };
  const lk = legacyMap[key];
  if (lk && stages[lk]) return stages[lk];
  return { status: 0 };
};

export const getAdditionalOps = (order: Order) => {
  const coreKeywords = ['хэвлэх', 'шалгах', 'цуглуулга', 'үдээ', 'наалт', 'огтлоо', 'чанарын эцсийн хяналт'];
  const ops = (order.operations || []).filter((o: any) => {
    const name = (o.operation_name || '').toLowerCase();
    return !coreKeywords.some(kw => name.includes(kw));
  });
  const outsourced = (order.outsourcedJobs || []).map((j: any) => ({
    operation_name: `Гадуур: ${j.job_name}`,
    qty: j.qty || order.total_qty,
    notes: j.notes
  }));
  return [...ops, ...outsourced];
};

interface Props {
  orders: Order[];
  statuses: any[];
  operators?: string[];
  onUpdateStage: (orderId: number, stageKey: string, newData: OrderStageData) => void;
}

export default function ProductionMatrix({ orders, statuses, operators = [], onUpdateStage }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUrgent, setFilterUrgent] = useState(false);
  const [statusTab, setStatusTab] = useState<'ACTIVE' | 'COMPLETED' | 'DELIVERED'>('ACTIVE');
  const [selectedMachine, setSelectedMachine] = useState<string>('ALL');
  const [activeModal, setActiveModal] = useState<{ orderId: number; stageKey: string; data: OrderStageData } | null>(null);
  const [ticketOrder, setTicketOrder] = useState<Order | null>(null);

  // Helper to calculate overall % of an order
  const getOverallProgress = (stages?: ProductionStages, order?: Order) => {
    if (!stages) return 0;
    const additionalOps = order ? getAdditionalOps(order) : [];
    const relevantStages = STAGES.filter(s => {
      if (s.key === 'additional_ops' && additionalOps.length === 0) return false;
      return true;
    });
    if (relevantStages.length === 0) return 0;

    let total = 0;
    relevantStages.forEach(s => {
      const st = getStageData(stages, s.key);
      total += (st.status || 0);
    });
    return Math.round(total / relevantStages.length);
  };

  // Helper to check if deadline is bottleneck (<=24 hours or past due and <100% complete)
  const isBottleneck = (order: Order) => {
    const progress = getOverallProgress(order.production_stages, order);
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
  const isReadyOrder = (o: Order) => !isDeliveredOrder(o) && (readyStatusNames.includes(o.current_status || '') || getOverallProgress(o.production_stages, o) >= 100);
  const isActiveOrder = (o: Order) => o.current_status !== 'Санхүү хүлээгдэж буй' && !isReadyOrder(o) && !isDeliveredOrder(o);

  const activeCount = orders.filter(isActiveOrder).length;
  const completedCount = orders.filter(isReadyOrder).length;
  const deliveredCount = orders.filter(isDeliveredOrder).length;

  const filteredOrders = orders.filter(o => {
    if (o.current_status === 'Санхүү хүлээгдэж буй') return false;
    if (statusTab === 'ACTIVE' && !isActiveOrder(o)) return false;
    if (statusTab === 'COMPLETED' && !isReadyOrder(o)) return false;
    if (statusTab === 'DELIVERED' && !isDeliveredOrder(o)) return false;

    // Machine filter
    if (selectedMachine !== 'ALL') {
      const stages = o.production_stages || {};
      const matchesMachine = Object.values(stages).some((st: any) => st?.machine === selectedMachine);
      if (!matchesMachine) return false;
    }

    const matchesSearch = 
      (o.order_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.product_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesUrgent = filterUrgent ? (o.is_urgent || isBottleneck(o)) : true;
    return matchesSearch && matchesUrgent;
  });

  const handleCellClick = (order: Order, stageKey: string) => {
    const currentData = getStageData(order.production_stages, stageKey);
    setActiveModal({ orderId: order.id, stageKey, data: { ...currentData } });
  };

  return (
    <div className="production-matrix">
      {/* Status Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.75rem', flexWrap: 'wrap' }}>
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

      {/* Machine Filter Bar */}
      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '1rem', background: 'var(--surface-color)', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', marginRight: '0.25rem' }}>🖨️ Машин сонголт:</span>
        <button
          type="button"
          onClick={() => setSelectedMachine('ALL')}
          style={{
            padding: '0.25rem 0.7rem',
            borderRadius: '999px',
            border: '1px solid var(--border-color)',
            fontSize: '0.8rem',
            fontWeight: 700,
            background: selectedMachine === 'ALL' ? 'var(--primary-color)' : '#f8fafc',
            color: selectedMachine === 'ALL' ? '#fff' : 'var(--text-primary)',
            cursor: 'pointer',
            transition: 'all 0.15s'
          }}
        >
          Бүх төхөөрөмж
        </button>
        {MACHINES.map(m => (
          <button
            key={m}
            type="button"
            onClick={() => setSelectedMachine(m)}
            style={{
              padding: '0.25rem 0.7rem',
              borderRadius: '999px',
              border: '1px solid var(--border-color)',
              fontSize: '0.8rem',
              fontWeight: 700,
              background: selectedMachine === m ? 'var(--primary-color)' : '#f8fafc',
              color: selectedMachine === m ? '#fff' : 'var(--text-primary)',
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Search & Urgency Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
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

      {/* Main Table */}
      <div style={{ overflowX: 'auto', borderRadius: '0.75rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid var(--border-color)', background: 'var(--surface-color)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ background: 'var(--primary-color)', color: '#fff', borderBottom: '2px solid var(--border-color)' }}>
              <th rowSpan={2} style={{ padding: '0.75rem 0.5rem', borderRight: '1px solid rgba(255,255,255,0.2)', minWidth: '95px' }}>Захиалга №</th>
              <th rowSpan={2} style={{ padding: '0.75rem 0.5rem', borderRight: '1px solid rgba(255,255,255,0.2)', minWidth: '140px' }}>Харилцагч</th>
              <th rowSpan={2} style={{ padding: '0.75rem 0.5rem', borderRight: '1px solid rgba(255,255,255,0.2)', minWidth: '150px' }}>Бүтээгдэхүүн</th>
              <th colSpan={2} style={{ padding: '0.5rem', borderRight: '1px solid rgba(255,255,255,0.2)', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>Бэлтгэл</th>
              <th colSpan={2} style={{ padding: '0.5rem', borderRight: '1px solid rgba(255,255,255,0.2)', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>Хэвлэх</th>
              <th rowSpan={2} style={{ padding: '0.75rem 0.5rem', borderRight: '1px solid rgba(255,255,255,0.2)', minWidth: '100px', background: '#0284c7', color: '#fff' }}>✨ Нэмэлт ажил</th>
              <th colSpan={2} style={{ padding: '0.5rem', borderRight: '1px solid rgba(255,255,255,0.2)', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>Дэвтэрлэх</th>
              <th colSpan={2} style={{ padding: '0.5rem', borderRight: '1px solid rgba(255,255,255,0.2)', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>Эцсийн шат</th>
              <th rowSpan={2} style={{ padding: '0.75rem 0.5rem', minWidth: '105px' }}>Хугацаа / Явц</th>
            </tr>
            <tr style={{ background: '#1e293b', color: '#fff', fontSize: '0.8rem' }}>
              <th style={{ padding: '0.4rem', borderRight: '1px solid rgba(255,255,255,0.1)', width: '80px' }}>🎨 Эх бэлтгэл</th>
              <th style={{ padding: '0.4rem', borderRight: '1px solid rgba(255,255,255,0.1)', width: '80px' }}>📦 Түүхий эд</th>
              <th style={{ padding: '0.4rem', borderRight: '1px solid rgba(255,255,255,0.1)', width: '80px' }}>💿 CTP</th>
              <th style={{ padding: '0.4rem', borderRight: '1px solid rgba(255,255,255,0.1)', width: '90px' }}>🖨️ Хэвлэх</th>
              <th style={{ padding: '0.4rem', borderRight: '1px solid rgba(255,255,255,0.1)', width: '85px' }}>🔍 Шалгах</th>
              <th style={{ padding: '0.4rem', borderRight: '1px solid rgba(255,255,255,0.1)', width: '80px' }}>📚 Үдэх/Наах</th>
              <th style={{ padding: '0.4rem', borderRight: '1px solid rgba(255,255,255,0.1)', width: '75px' }}>✂️ Огтлоо</th>
              <th style={{ padding: '0.4rem', borderRight: '1px solid rgba(255,255,255,0.1)', width: '80px' }}>📦 Чанар/Савлах</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={13} style={{ padding: '2rem', color: 'var(--text-muted)' }}>Одоохондоо захиалга эсвэл хайлтад тохирох ажил байхгүй байна.</td>
              </tr>
            ) : (
              filteredOrders.map((order, index) => {
                const bottleneck = isBottleneck(order);
                const calculatedProgress = getOverallProgress(order.production_stages, order);
                let progress = calculatedProgress;
                if (readyStatusNames.includes(order.current_status || '') || deliveredStatusNames.includes(order.current_status || '')) {
                  progress = 100;
                }
                const hasNotes = Boolean(order.notes) || (order.materials && order.materials.some((m: any) => m.notes)) || (order.operations && order.operations.some((o: any) => o.notes)) || (order.outsourcedJobs && order.outsourcedJobs.some((oj: any) => oj.notes));
                const additionalOps = getAdditionalOps(order);

                // Financial Confidentiality: STRICTLY NO ₮ FIGURES
                const isPaid = order.payment_status === 'PAID' || Boolean(order.paid_amount && order.final_price && order.paid_amount >= order.final_price);
                const hasAdvance = !isPaid && Boolean(order.paid_amount && order.paid_amount > 0);
                const hasRemaining = !isPaid && Boolean(order.remaining_balance && order.remaining_balance > 0);

                return (
                  <React.Fragment key={order.id}>
                    <tr style={{ background: index % 2 === 0 ? '#fff' : '#f8fafc', transition: 'background 0.2s', borderBottom: hasNotes ? 'none' : '1px solid var(--border-color)' }}>
                      {/* Order Number & Ticket */}
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
                          title="Дэлгэрэнгүй ажлын хуудас"
                        >
                          📄 Ажлын хуудас
                        </button>
                      </td>

                      {/* Customer & Price-Free Payment Status */}
                      <td style={{ padding: '0.6rem 0.4rem', textAlign: 'left', borderRight: '1px solid var(--border-color)', fontWeight: 600 }}>
                        <div>{order.customer_name}</div>
                        {order.sales_person_name && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                            👤 {order.sales_person_name}
                          </div>
                        )}
                        {/* Price-Free Payment Badges */}
                        <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                          {isPaid ? (
                            <span style={{ background: '#dcfce7', color: '#15803d', padding: '1px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700 }}>
                              ✓ Төлөгдсөн
                            </span>
                          ) : hasAdvance ? (
                            <span style={{ background: '#fef3c7', color: '#b45309', padding: '1px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700 }}>
                              🟡 Урьдчилгаатай
                            </span>
                          ) : (
                            <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '1px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700 }}>
                              🔴 Төлбөргүй
                            </span>
                          )}
                          {hasRemaining && (
                            <span title="Үлдэгдэлтэй захиалга" style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #f87171', padding: '1px 4px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: 800 }}>
                              ⚠️ ҮЛДЭГДЭЛТЭЙ!
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Product Name & Qty */}
                      <td style={{ padding: '0.6rem 0.4rem', textAlign: 'left', borderRight: '1px solid var(--border-color)' }}>
                        <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          {order.is_urgent && <span title="Яаралтай захиалга" style={{ color: '#e11d48' }}>🔥</span>}
                          {order.product_name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Тоо: <b>{order.total_qty.toLocaleString()} ш</b>
                        </div>
                      </td>

                      {/* Render 9 Stages */}
                      {STAGES.map(stage => {
                        const stData = getStageData(order.production_stages, stage.key);

                        // Special handling for additional_ops when order has none
                        if (stage.key === 'additional_ops' && additionalOps.length === 0) {
                          return (
                            <td key={stage.key} style={{ padding: '0.3rem', borderRight: '1px solid var(--border-color)', background: '#f8fafc' }}>
                              <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic', padding: '0.4rem 0.2rem' }}>
                                —
                              </div>
                            </td>
                          );
                        }

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
                              title={stage.key === 'additional_ops' ? `Нэмэлт ажиллагаанууд (${additionalOps.length} ажил)` : 'Гүйцэтгэл шинэчлэх'}
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
                                minHeight: '52px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                              }}
                            >
                              <div style={{ fontSize: '0.92rem' }}>{stData.status}%</div>
                              {stage.key === 'additional_ops' && additionalOps.length > 0 && (
                                <div style={{ fontSize: '0.62rem', fontWeight: 600, opacity: 0.95, maxWidth: '90px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={additionalOps.map(o => o.operation_name).join(', ')}>
                                  {additionalOps[0]?.operation_name?.replace(/Бүрэлт\s*/, '')}
                                  {additionalOps.length > 1 ? ` (+${additionalOps.length - 1})` : ''}
                                </div>
                              )}
                              {(stData.operator || stData.machine) && (
                                <div style={{ fontSize: '0.65rem', fontWeight: 500, lineHeight: 1.1, marginTop: '2px', opacity: 0.95 }}>
                                  {stData.machine || stData.operator}
                                </div>
                              )}
                              {stData.waste_qty ? (
                                <div style={{ fontSize: '0.6rem', color: '#7f1d1d', background: 'rgba(255,255,255,0.85)', padding: '1px 4px', borderRadius: '4px', marginTop: '2px' }}>
                                  Гологдол: {stData.waste_qty}
                                </div>
                              ) : null}
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveModal({ orderId: order.id, stageKey: stage.key, data: { ...stData } });
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
                              ✏️ Засах
                            </button>
                          </td>
                        );
                      })}

                      {/* Deadline & Overall Progress */}
                      <td style={{ padding: '0.6rem 0.4rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', fontWeight: bottleneck ? 700 : 500, color: bottleneck ? '#e11d48' : 'inherit' }}>
                          {bottleneck && <span title="Хугацаа тулсан эсвэл яаралтай!">🚨</span>}
                          {order.deadline ? new Date(order.deadline).toLocaleDateString() : 'Тодорхойгүй'}
                        </div>
                        <div style={{ marginTop: '0.3rem', background: '#e2e8f0', borderRadius: '999px', height: '6px', width: '80%', margin: '0.3rem auto 0' }}>
                          <div style={{ background: progress === 100 ? '#22c55e' : 'var(--primary-color)', height: '100%', borderRadius: '999px', width: `${progress}%` }}></div>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          Явц: <b>{progress}%</b>
                        </div>
                      </td>
                    </tr>

                    {/* Urgent Notes Section */}
                    {hasNotes && (
                      <tr style={{ background: '#fef2f2', borderBottom: '2px solid var(--border-color)', animation: 'pulse-light 2s infinite' }}>
                        <td colSpan={13} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.9rem', color: '#b91c1c', borderLeft: '4px solid #ef4444' }}>
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

      {/* Modal for Setting Stage Progress (%) / Machine / Operator */}
      {activeModal && (() => {
        const modalOrder = orders.find(o => o.id === activeModal.orderId);
        const totalQty = modalOrder?.total_qty || 1;
        const currentStageMeta = STAGES.find(s => s.key === activeModal.stageKey);
        const additionalOps = modalOrder ? getAdditionalOps(modalOrder) : [];

        const handleStatusChange = (val: number) => {
          let newStatus = Math.max(0, Math.min(100, Math.round(val)));
          let newQty = Math.round((newStatus / 100) * totalQty);
          setActiveModal({
            ...activeModal,
            data: {
              ...activeModal.data,
              status: newStatus,
              completed_qty: newQty
            }
          });
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
              width: '90%', maxWidth: '440px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
              maxHeight: '90vh', overflowY: 'auto'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.1rem' }}>
                  {currentStageMeta?.icon} {currentStageMeta?.label}
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {modalOrder?.order_number || `#${modalOrder?.id}`}
                </span>
              </div>

              {/* Additional Operations Details in Modal if active */}
              {activeModal.stageKey === 'additional_ops' && additionalOps.length > 0 && (
                <div style={{ marginBottom: '1rem', background: '#f0f9ff', padding: '0.6rem 0.8rem', borderRadius: '0.5rem', border: '1px solid #bae6fd' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0369a1', marginBottom: '0.3rem' }}>
                    ✨ Энэ захиалгын нэмэлт ажиллагаанууд:
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.8rem', color: '#0f172a' }}>
                    {additionalOps.map((op, idx) => (
                      <li key={idx} style={{ marginBottom: '0.2rem' }}>
                        <b>{op.operation_name}</b> {op.qty ? `(${op.qty} ш)` : ''} {op.notes ? `- ${op.notes}` : ''}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Quick % Preset Buttons */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-muted)' }}>
                  Хурдан тохируулах (%):
                </label>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  {[0, 25, 50, 75, 100].map(pct => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => handleStatusChange(pct)}
                      style={{
                        flex: 1,
                        padding: '0.45rem 0.2rem',
                        borderRadius: '0.375rem',
                        border: '1px solid var(--border-color)',
                        background: activeModal.data.status === pct ? 'var(--primary-color)' : '#f8fafc',
                        color: activeModal.data.status === pct ? '#fff' : '#1e293b',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                    >
                      {pct === 100 ? '100% ✓' : `${pct}%`}
                    </button>
                  ))}
                </div>
              </div>

              {/* % Direct Input & Slider */}
              <div className="form-group" style={{ marginBottom: '1rem', background: '#f8fafc', padding: '0.9rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
                <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 700 }}>
                  <span>Гүйцэтгэлийн хувь:</span>
                  <span style={{ color: 'var(--primary-color)', fontSize: '1.1rem' }}>{activeModal.data.status}%</span>
                </label>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                  <input
                    type="number"
                    value={activeModal.data.status}
                    onChange={e => handleStatusChange(Number(e.target.value))}
                    min={0}
                    max={100}
                    style={{ width: '80px', padding: '0.45rem', borderRadius: '0.375rem', border: '1px solid var(--border-color)', fontWeight: 'bold', fontSize: '1rem', textAlign: 'center' }}
                  />
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    ≈ {Math.round((activeModal.data.status / 100) * totalQty).toLocaleString()} / {totalQty.toLocaleString()} ш
                  </span>
                </div>
                
                <input 
                  type="range" 
                  min="0" max="100" 
                  value={activeModal.data.status} 
                  onChange={e => handleStatusChange(Number(e.target.value))}
                  style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--primary-color)' }}
                />
              </div>

              {/* Defect / Waste input */}
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 600, color: '#991b1b' }}>Гологдол / Хаягдал (ш):</label>
                <input
                  type="number"
                  value={activeModal.data.waste_qty || 0}
                  onChange={e => setActiveModal({ ...activeModal, data: { ...activeModal.data, waste_qty: Number(e.target.value) } })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #fca5a5', background: '#fef2f2' }}
                  min={0}
                />
              </div>

              {/* Machine Selection (6 Standard Machines) */}
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

              {/* Operator Selection */}
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 600 }}>Хариуцсан ажилтан:</label>
                <select
                  value={activeModal.data.operator || ''}
                  onChange={e => setActiveModal({ ...activeModal, data: { ...activeModal.data, operator: e.target.value } })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid var(--border-color)' }}
                >
                  <option value="">-- Сонгоогүй --</option>
                  {operators.map(op => (
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

      {/* Printable Job Ticket Modal */}
      {ticketOrder && (
        <JobTicketModal order={ticketOrder} onClose={() => setTicketOrder(null)} />
      )}
    </div>
  );
}

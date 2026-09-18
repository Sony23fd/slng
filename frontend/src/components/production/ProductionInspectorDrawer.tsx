"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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

export interface ProductionInspectorDrawerProps {
  order: any | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenTicket?: (order: any) => void;
}

export const STAGES_META = [
  { key: 'design', label: 'Эх бэлтгэл / Дизайн', shortLabel: 'Эх бэлтгэл', icon: '🎨', desc: 'Эх файл, макет шалгах, эцсийн баталгаажуулалт' },
  { key: 'raw_material', label: 'Түүхий эд / Цаас', shortLabel: 'Цаас/Материал', icon: '📦', desc: 'Үндсэн ба туслах цаас, картон, материалын зүсэлт' },
  { key: 'ctp', label: 'CTP Хавтан', shortLabel: 'CTP Хавтан', icon: '💿', desc: 'Хэвлэлийн хөнгөн цагаан хавтан шарах, тодруулах' },
  { key: 'print', label: 'Хэвлэх', shortLabel: 'Хэвлэх', icon: '🖨️', desc: 'Офсет / Дижитал машин дээр үндсэн хэвлэлт' },
  { key: 'inspect', label: 'Шалгаа / Чанар', shortLabel: 'Шалгаа', icon: '🔍', desc: 'Хэвлэмэл хуудасны чанар, будаг шалгах, ялгах' },
  { key: 'fold', label: 'Нугалаа / Зүсэлт', shortLabel: 'Нугалаа', icon: '📐', desc: 'Хэвлэлийн дараах хуудас нугалах, тэгшлэх' },
  { key: 'bind', label: 'Үдэх / Наах / Савлах', shortLabel: 'Үдэх/Савлах', icon: '📚', desc: 'Хавтаслах, үдэх, наах, савлаж бэлэн болгох' },
];

export const getOverallProgress = (stages?: ProductionStages) => {
  if (!stages) return 0;
  let total = 0;
  STAGES_META.forEach(s => {
    const val = stages[s.key]?.status || 0;
    total += val;
  });
  return Math.round(total / STAGES_META.length);
};

export const getActiveStageInfo = (stages?: ProductionStages) => {
  if (!stages) return { ...STAGES_META[0], state: 'PENDING' };
  const inProg = STAGES_META.find(s => stages[s.key]?.status === 50);
  if (inProg) return { ...inProg, state: 'IN_PROGRESS' };
  const pending = STAGES_META.find(s => (stages[s.key]?.status || 0) === 0);
  if (pending) return { ...pending, state: 'PENDING' };
  return { ...STAGES_META[STAGES_META.length - 1], state: 'COMPLETED' };
};

export const getDeadlineStatus = (deadlineStr?: string, isUrgent?: boolean, progress = 0) => {
  if (progress >= 100) {
    return { text: 'Үйлдвэрлэл дууссан (Бэлэн)', color: '#059669', bg: '#ecfdf5', border: '#a7f3d0', icon: '✅' };
  }
  if (isUrgent) {
    return { text: '⚡ Яаралтай захиалга', color: '#dc2626', bg: '#fef2f2', border: '#fecaca', icon: '🔥' };
  }
  if (!deadlineStr) {
    return { text: 'Хугацаа заагаагүй', color: '#64748b', bg: '#f8fafc', border: '#e2e8f0', icon: '⏱️' };
  }
  const now = new Date().getTime();
  const dl = new Date(deadlineStr).getTime();
  const diffMs = dl - now;
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 0) {
    return { text: `Хугацаа хэтэрсэн (${Math.abs(diffHours)}ц өмнө)`, color: '#b91c1c', bg: '#fef2f2', border: '#fca5a5', icon: '🚨' };
  }
  if (diffHours <= 24) {
    return { text: `Цаг дөхсөн (${diffHours} цаг үлдсэн)`, color: '#c2410c', bg: '#fff7ed', border: '#fed7aa', icon: '⚠️' };
  }
  if (diffDays <= 3) {
    return { text: `${diffDays} өдөр үлдсэн`, color: '#0369a1', bg: '#f0f9ff', border: '#bae6fd', icon: '⏳' };
  }
  return { text: `${diffDays} өдөр үлдсэн`, color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0', icon: '📅' };
};

export default function ProductionInspectorDrawer({ order, isOpen, onClose, onOpenTicket }: ProductionInspectorDrawerProps) {
  const [copied, setCopied] = useState(false);
  const [showInternalTicket, setShowInternalTicket] = useState(false);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !order) return null;

  const progress = getOverallProgress(order.production_stages);
  const activeStage = getActiveStageInfo(order.production_stages);
  const deadlineInfo = getDeadlineStatus(order.deadline, order.is_urgent, progress);

  const formattedDeadline = order.deadline
    ? new Date(order.deadline).toLocaleDateString('mn-MN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
    : 'Тодорхойгүй';

  const smsTemplate = `Сайн байна уу, ${order.customer_name}. Таны №${order.order_number || order.id} тоот "${order.product_name}" (${order.total_qty}ш) захиалгын үйлдвэрлэлийн явц ${progress}% (${activeStage.shortLabel}) байна. Тооцоолсон бэлэн болох хугацаа: ${formattedDeadline}. - Сэлэнгэ Хэвлэлийн Үйлдвэр`;

  const handleCopySms = () => {
    navigator.clipboard.writeText(smsTemplate);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleTicketClick = () => {
    if (onOpenTicket) {
      onOpenTicket(order);
    } else {
      setShowInternalTicket(true);
    }
  };

  return (
    <>
      <div 
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(3px)',
          zIndex: 9000,
          display: 'flex',
          justifyContent: 'flex-end',
          animation: 'fadeIn 0.2s ease-out'
        }}
        onClick={onClose}
      >
        <div 
          style={{
            width: '100%',
            maxWidth: '620px',
            height: '100vh',
            background: '#ffffff',
            boxShadow: '-8px 0 25px rgba(0, 0, 0, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'slideLeft 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #e2e8f0',
            background: '#f8fafc',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
                <span style={{
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  background: '#1e293b',
                  color: '#ffffff',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '0.25rem'
                }}>
                  {order.order_number || `ID: ${order.id}`}
                </span>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  padding: '0.2rem 0.6rem',
                  borderRadius: '999px',
                  background: deadlineInfo.bg,
                  color: deadlineInfo.color,
                  border: `1px solid ${deadlineInfo.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem'
                }}>
                  {deadlineInfo.icon} {deadlineInfo.text}
                </span>
              </div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Үйлдвэрлэлийн явцын хяналт
              </h2>
            </div>
            
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: '1px solid #cbd5e1',
                borderRadius: '0.375rem',
                width: '34px',
                height: '34px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#64748b',
                fontSize: '1.2rem',
                transition: 'all 0.15s'
              }}
              title="Хаах (Esc)"
            >
              ✕
            </button>
          </div>

          {/* Drawer Body (Scrollable) */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Quick Order Info Card */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '0.625rem',
              padding: '1.1rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '0.85rem'
            }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500, textTransform: 'uppercase' }}>Харилцагч</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b' }}>{order.customer_name}</div>
                {order.phone && (
                  <a href={`tel:${order.phone}`} style={{ fontSize: '0.8rem', color: '#2563eb', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.2rem', marginTop: '0.15rem' }}>
                    📞 {order.phone}
                  </a>
                )}
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500, textTransform: 'uppercase' }}>Бүтээгдэхүүн & Тоо</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b' }}>
                  {order.product_name}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 600 }}>
                  {order.total_qty?.toLocaleString()} ширхэг
                  {order.size ? ` • ${order.size}` : ''}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500, textTransform: 'uppercase' }}>Хүлээлгэн өгөх огноо</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                  📅 {formattedDeadline}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500, textTransform: 'uppercase' }}>Хариуцсан борлуулагч</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                  👤 {order.user?.name || order.sales_person_name || 'Тодорхойгүй'}
                </div>
              </div>
            </div>

            {/* Overall Progress Gauge Card */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '0.625rem',
              padding: '1.25rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  📊 Нийт үйлдвэрлэлийн явц
                </span>
                <span style={{
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  color: progress === 100 ? '#10b981' : progress > 0 ? '#2563eb' : '#64748b'
                }}>
                  {progress}%
                </span>
              </div>

              <div style={{ height: '10px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden', marginBottom: '0.75rem' }}>
                <div 
                  style={{
                    height: '100%',
                    width: `${progress}%`,
                    background: progress === 100 
                      ? 'linear-gradient(90deg, #10b981, #059669)'
                      : 'linear-gradient(90deg, #3b82f6, #1d4ed8)',
                    transition: 'width 0.4s ease',
                    borderRadius: '999px'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: '#64748b' }}>
                <span>Одоогийн идэвхтэй шат: <strong style={{ color: '#0f172a' }}>{activeStage.label}</strong></span>
                <span style={{
                  padding: '0.15rem 0.5rem',
                  borderRadius: '0.25rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  background: order.current_status === 'Бэлэн болсон' ? '#dcfce7' : '#f1f5f9',
                  color: order.current_status === 'Бэлэн болсон' ? '#166534' : '#334155'
                }}>
                  Төлөв: {order.current_status}
                </span>
              </div>
            </div>

            {/* 7 Stages Detailed Timeline */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  ⚙️ 7 Шатлалт процессын нарийвчилсан явц
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  {STAGES_META.filter(s => (order.production_stages?.[s.key]?.status || 0) === 100).length} / 7 дууссан
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {STAGES_META.map((stage, idx) => {
                  const stageData: OrderStageData | undefined = order.production_stages?.[stage.key];
                  const statusVal = stageData?.status || 0;
                  
                  let badgeBg = '#f1f5f9';
                  let badgeColor = '#64748b';
                  let badgeText = 'Хүлээгдэж буй (0%)';
                  let iconBg = '#f1f5f9';
                  let borderLeftColor = '#cbd5e1';

                  if (statusVal === 100) {
                    badgeBg = '#dcfce7';
                    badgeColor = '#15803d';
                    badgeText = 'Дууссан (100%)';
                    iconBg = '#dcfce7';
                    borderLeftColor = '#10b981';
                  } else if (statusVal === 50) {
                    badgeBg = '#dbeafe';
                    badgeColor = '#1d4ed8';
                    badgeText = 'Хийгдэж байна (50%)';
                    iconBg = '#dbeafe';
                    borderLeftColor = '#3b82f6';
                  }

                  const formattedUpdateTime = stageData?.updatedAt
                    ? new Date(stageData.updatedAt).toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit', month: '2-digit', day: '2-digit' })
                    : null;

                  return (
                    <div 
                      key={stage.key}
                      style={{
                        border: '1px solid #e2e8f0',
                        borderLeft: `4px solid ${borderLeftColor}`,
                        borderRadius: '0.5rem',
                        padding: '0.85rem 1rem',
                        background: statusVal === 50 ? '#f8fafc' : '#ffffff',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{
                            width: '26px',
                            height: '26px',
                            borderRadius: '50%',
                            background: iconBg,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.85rem'
                          }}>
                            {stage.icon}
                          </span>
                          <div>
                            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b' }}>
                              {idx + 1}. {stage.label}
                            </span>
                          </div>
                        </div>

                        <span style={{
                          fontSize: '0.725rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.5rem',
                          borderRadius: '0.25rem',
                          background: badgeBg,
                          color: badgeColor
                        }}>
                          {badgeText}
                        </span>
                      </div>

                      {/* Stage metadata (machine, operator, quantities) */}
                      <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.4rem', paddingLeft: '2.1rem' }}>
                        {stageData?.operator && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#334155' }}>
                            👷 Гүйцэтгэгч: <strong>{stageData.operator}</strong>
                          </span>
                        )}
                        {stageData?.machine && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#334155' }}>
                            ⚙️ Машин: <strong>{stageData.machine}</strong>
                          </span>
                        )}
                        {stageData?.completed_qty !== undefined && stageData.completed_qty > 0 && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#15803d' }}>
                            ✓ Гарсан: <strong>{stageData.completed_qty?.toLocaleString()} ш</strong>
                          </span>
                        )}
                        {stageData?.waste_qty !== undefined && stageData.waste_qty > 0 && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#b91c1c' }}>
                            ✗ Гологдол: <strong>{stageData.waste_qty?.toLocaleString()} ш</strong>
                          </span>
                        )}
                        {formattedUpdateTime && (
                          <span style={{ color: '#94a3b8', fontSize: '0.75rem', marginLeft: 'auto' }}>
                            🕒 {formattedUpdateTime}
                          </span>
                        )}
                        {!stageData?.operator && !stageData?.machine && statusVal === 0 && (
                          <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.75rem' }}>
                            {stage.desc}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 1-Click Customer SMS Generator Card */}
            <div style={{
              background: 'linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 100%)',
              border: '1px solid #bbf7d0',
              borderRadius: '0.625rem',
              padding: '1.1rem',
              marginTop: '0.5rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#166534', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  💬 Харилцагчид SMS / Мэдэгдэл илгээх загвар
                </span>
                <button
                  type="button"
                  onClick={handleCopySms}
                  style={{
                    background: copied ? '#10b981' : '#ffffff',
                    color: copied ? '#ffffff' : '#1e293b',
                    border: '1px solid #cbd5e1',
                    borderRadius: '0.375rem',
                    padding: '0.3rem 0.75rem',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {copied ? '✓ Хууллаа!' : '📋 Хуулах'}
                </button>
              </div>

              <div style={{
                background: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid rgba(0,0,0,0.06)',
                borderRadius: '0.375rem',
                padding: '0.75rem',
                fontSize: '0.8rem',
                lineHeight: 1.45,
                color: '#334155',
                userSelect: 'all'
              }}>
                {smsTemplate}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.4rem' }}>
                💡 Товч дээр дарахад харилцагчийн нэр, дугаар, одоогийн шатлал бүхий бэлэн SMS текст санах ойд хуулагдана.
              </div>
            </div>

            {/* Special Notes / Tech Directives if present */}
            {order.notes && (
              <div style={{
                background: '#fffbeb',
                border: '1px solid #fef3c7',
                borderRadius: '0.5rem',
                padding: '0.85rem 1rem',
                fontSize: '0.85rem'
              }}>
                <strong style={{ color: '#92400e', display: 'block', marginBottom: '0.25rem' }}>
                  📝 Захиалгын онцгой тэмдэглэл:
                </strong>
                <span style={{ color: '#78350f' }}>{order.notes}</span>
              </div>
            )}

          </div>

          {/* Drawer Footer Actions */}
          <div style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid #e2e8f0',
            background: '#f8fafc',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <button
              type="button"
              onClick={handleTicketClick}
              className="btn btn-outline"
              style={{
                fontSize: '0.85rem',
                padding: '0.5rem 1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              📄 Ажлын карт харах
            </button>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link
                href={`/sales/orders/${order.id}`}
                className="btn btn-outline"
                style={{
                  fontSize: '0.85rem',
                  padding: '0.5rem 1rem',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                ✏️ Захиалга нээх
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="btn"
                style={{
                  background: '#e2e8f0',
                  color: '#334155',
                  fontSize: '0.85rem',
                  padding: '0.5rem 1rem'
                }}
              >
                Хаах
              </button>
            </div>
          </div>
        </div>
      </div>

      {showInternalTicket && (
        <JobTicketModal
          order={order}
          onClose={() => setShowInternalTicket(false)}
        />
      )}

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideLeft {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}

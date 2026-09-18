"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useAuthStore } from '../../../stores/useAuthStore';
import { useRouter } from 'next/navigation';
import ProductionInspectorDrawer, {
  STAGES_META,
  getOverallProgress,
  getActiveStageInfo,
  getDeadlineStatus,
  OrderStageData,
  ProductionStages
} from '../../../components/production/ProductionInspectorDrawer';
import JobTicketModal from '../../../components/production/JobTicketModal';

export default function SalesProductionPage() {
  const { user, token, hasHydrated } = useAuthStore();
  const router = useRouter();

  const [orders, setOrders] = useState<any[]>([]);
  const [orderStatuses, setOrderStatuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyMine, setShowOnlyMine] = useState(true);
  const [filterTab, setFilterTab] = useState<'ALL' | 'IN_PROGRESS' | 'URGENT' | 'READY' | 'DELIVERED'>('ALL');
  const [viewMode, setViewMode] = useState<'CARDS' | 'MATRIX'>('CARDS');

  // Modal / Drawer states
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [ticketOrder, setTicketOrder] = useState<any | null>(null);
  const [copiedOrderId, setCopiedOrderId] = useState<number | null>(null);

  useEffect(() => {
    if (hasHydrated) {
      if (!token) {
        router.push('/login');
      } else {
        fetchStatuses();
        fetchOrders();
      }
    }
  }, [token, hasHydrated, router, showOnlyMine]);

  const fetchStatuses = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/order-statuses`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrderStatuses(data);
      }
    } catch (e) {
      console.error("Failed to load statuses:", e);
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        kanbanLimit: 'true',
        isMine: showOnlyMine.toString()
      });

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/orders?${query}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const list = data && data.data ? data.data : (Array.isArray(data) ? data : []);
        // Filter out Quotes and Pending Finance orders for production tracking
        const activeProd = list.filter((o: any) => 
          o.current_status !== 'Санхүү хүлээгдэж буй' && 
          o.current_status !== 'Үнийн санал'
        );
        setOrders(activeProd);
      }
    } catch (e) {
      console.error("Failed to load production orders:", e);
    } finally {
      setLoading(false);
    }
  };

  // Helper classification
  const deliveredStatusNames = orderStatuses.filter(s => s.type === 'DELIVERED').map(s => s.name) || ['Олгосон', 'Хүлээлгэж өгсөн'];
  const readyStatusNames = orderStatuses.filter(s => s.type === 'READY').map(s => s.name) || ['Бэлэн', 'Бэлэн болсон'];

  const isDelivered = (o: any) => deliveredStatusNames.includes(o.current_status || '');
  const isReady = (o: any) => !isDelivered(o) && (readyStatusNames.includes(o.current_status || '') || getOverallProgress(o.production_stages) >= 100);
  const isUrgentOrBottleneck = (o: any) => {
    if (isReady(o) || isDelivered(o)) return false;
    if (o.is_urgent) return true;
    if (!o.deadline) return false;
    const now = new Date().getTime();
    const deadline = new Date(o.deadline).getTime();
    const diffHours = (deadline - now) / (1000 * 60 * 60);
    return diffHours <= 24;
  };
  const isInProgress = (o: any) => !isDelivered(o) && !isReady(o);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      // Search term
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matchNumber = (o.order_number || `id:${o.id}`).toLowerCase().includes(q);
        const matchCust = (o.customer_name || '').toLowerCase().includes(q);
        const matchProd = (o.product_name || '').toLowerCase().includes(q);
        const matchPhone = (o.phone || '').includes(q);
        if (!matchNumber && !matchCust && !matchProd && !matchPhone) return false;
      }

      // Tab filter
      if (filterTab === 'IN_PROGRESS') return isInProgress(o);
      if (filterTab === 'URGENT') return isUrgentOrBottleneck(o);
      if (filterTab === 'READY') return isReady(o);
      if (filterTab === 'DELIVERED') return isDelivered(o);

      return true;
    });
  }, [orders, searchTerm, filterTab, orderStatuses]);

  // Counts for KPI ribbon
  const totalCount = orders.length;
  const inProgCount = orders.filter(isInProgress).length;
  const urgentCount = orders.filter(isUrgentOrBottleneck).length;
  const readyCount = orders.filter(isReady).length;
  const deliveredCount = orders.filter(isDelivered).length;

  const handleOpenDrawer = (order: any) => {
    setSelectedOrder(order);
    setIsDrawerOpen(true);
  };

  const handleCopySms = (e: React.MouseEvent, order: any) => {
    e.stopPropagation();
    const progress = getOverallProgress(order.production_stages);
    const activeStage = getActiveStageInfo(order.production_stages);
    const deadlineStr = order.deadline ? new Date(order.deadline).toLocaleDateString('mn-MN') : 'Удахгүй';
    const text = `Сайн байна уу, ${order.customer_name}. Таны №${order.order_number || order.id} тоот "${order.product_name}" (${order.total_qty}ш) захиалгын гүйцэтгэл ${progress}% (${activeStage.shortLabel}) байна. Бэлэн болох хугацаа: ${deadlineStr}. - Сэлэнгэ Хэвлэх Үйлдвэр`;
    
    navigator.clipboard.writeText(text);
    setCopiedOrderId(order.id);
    setTimeout(() => setCopiedOrderId(null), 2000);
  };

  return (
    <div style={{ padding: '0.5rem 0', maxWidth: '100%', margin: '0 auto' }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <h1 className="title" style={{ margin: 0 }}>🏭 Үйлдвэрлэлийн явцын хяналт</h1>
            <span style={{
              background: '#e0f2fe',
              color: '#0369a1',
              padding: '0.2rem 0.6rem',
              borderRadius: '999px',
              fontSize: '0.8rem',
              fontWeight: 700
            }}>
              {orders.length} захиалга
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>
            Борлуулалтын захиалгуудын үйлдвэрлэлийн 7 шатлалт процессын бодит цагийн явц, хариуцагч машин, хугацааны хяналт
          </p>
        </div>

        {/* View Mode & Refresh */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '0.375rem',
            display: 'flex',
            padding: '0.2rem',
            gap: '0.2rem'
          }}>
            <button
              type="button"
              onClick={() => setViewMode('CARDS')}
              style={{
                border: 'none',
                background: viewMode === 'CARDS' ? '#2563eb' : 'transparent',
                color: viewMode === 'CARDS' ? '#ffffff' : '#64748b',
                padding: '0.35rem 0.75rem',
                borderRadius: '0.25rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              🗂️ Картаар
            </button>
            <button
              type="button"
              onClick={() => setViewMode('MATRIX')}
              style={{
                border: 'none',
                background: viewMode === 'MATRIX' ? '#2563eb' : 'transparent',
                color: viewMode === 'MATRIX' ? '#ffffff' : '#64748b',
                padding: '0.35rem 0.75rem',
                borderRadius: '0.25rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              📊 Матрицаар
            </button>
          </div>

          <button
            type="button"
            onClick={fetchOrders}
            className="btn btn-outline"
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            title="Шинэчлэх"
          >
            🔄 Шинэчлэх
          </button>
        </div>
      </div>

      {/* KPI Pulse Ribbon */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem',
        marginBottom: '1.25rem'
      }}>
        {/* Total Active In-Progress */}
        <div 
          onClick={() => setFilterTab('IN_PROGRESS')}
          style={{
            background: filterTab === 'IN_PROGRESS' ? '#eff6ff' : '#ffffff',
            border: filterTab === 'IN_PROGRESS' ? '2px solid #3b82f6' : '1px solid #e2e8f0',
            borderRadius: '0.625rem',
            padding: '1rem 1.25rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.825rem', fontWeight: 600, color: '#1e40af' }}>⚙️ Үйлдвэрлэлд яваа</span>
            <span style={{ background: '#dbeafe', color: '#1d4ed8', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>
              ⚡
            </span>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e293b' }}>
            {inProgCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
            Машин, шатлалд ажиллаж буй
          </div>
        </div>

        {/* Urgent / Bottleneck */}
        <div 
          onClick={() => setFilterTab('URGENT')}
          style={{
            background: filterTab === 'URGENT' ? '#fff7ed' : '#ffffff',
            border: filterTab === 'URGENT' ? '2px solid #f97316' : '1px solid #e2e8f0',
            borderRadius: '0.625rem',
            padding: '1rem 1.25rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.825rem', fontWeight: 600, color: '#c2410c' }}>🚨 Хугацаа дөхсөн / Яаралтай</span>
            <span style={{ background: '#ffedd5', color: '#ea580c', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>
              🔥
            </span>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: urgentCount > 0 ? '#ea580c' : '#1e293b' }}>
            {urgentCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
            24 цаг дотор эсвэл яаралтай
          </div>
        </div>

        {/* Ready */}
        <div 
          onClick={() => setFilterTab('READY')}
          style={{
            background: filterTab === 'READY' ? '#ecfdf5' : '#ffffff',
            border: filterTab === 'READY' ? '2px solid #10b981' : '1px solid #e2e8f0',
            borderRadius: '0.625rem',
            padding: '1rem 1.25rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.825rem', fontWeight: 600, color: '#047857' }}>✨ Бэлэн болсон (Олгоход бэлэн)</span>
            <span style={{ background: '#dcfce7', color: '#15803d', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>
              ✓
            </span>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#059669' }}>
            {readyCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
            Үйлдвэрлэл 100% гүйцэтгэсэн
          </div>
        </div>

        {/* Delivered */}
        <div 
          onClick={() => setFilterTab('DELIVERED')}
          style={{
            background: filterTab === 'DELIVERED' ? '#f1f5f9' : '#ffffff',
            border: filterTab === 'DELIVERED' ? '2px solid #64748b' : '1px solid #e2e8f0',
            borderRadius: '0.625rem',
            padding: '1rem 1.25rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.825rem', fontWeight: 600, color: '#475569' }}>🤝 Хүлээлгэн өгсөн</span>
            <span style={{ background: '#f1f5f9', color: '#475569', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>
              📦
            </span>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#475569' }}>
            {deliveredCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
            Харилцагчид гардуулсан
          </div>
        </div>
      </div>

      {/* Control Bar (Filters & Search) */}
      <div className="card" style={{ padding: '1.1rem 1.25rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          
          {/* Status Tabs */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {[
              { key: 'ALL', label: `Бүгд (${totalCount})` },
              { key: 'IN_PROGRESS', label: `⚙️ Үйлдвэрлэлд (${inProgCount})` },
              { key: 'URGENT', label: `🚨 Хугацаа дөхсөн (${urgentCount})` },
              { key: 'READY', label: `✨ Бэлэн болсон (${readyCount})` },
              { key: 'DELIVERED', label: `🤝 Олгосон (${deliveredCount})` },
            ].map(tab => {
              const active = filterTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setFilterTab(tab.key as any)}
                  style={{
                    padding: '0.4rem 0.8rem',
                    borderRadius: '0.375rem',
                    border: active ? '1px solid #2563eb' : '1px solid #cbd5e1',
                    background: active ? '#2563eb' : '#f8fafc',
                    color: active ? '#ffffff' : '#334155',
                    fontSize: '0.825rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Search & "Only My Orders" toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            
            {/* My Orders Toggle */}
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: '#1e293b',
              margin: 0,
              userSelect: 'none',
              background: showOnlyMine ? '#f0fdf4' : '#f8fafc',
              padding: '0.35rem 0.75rem',
              borderRadius: '0.375rem',
              border: showOnlyMine ? '1px solid #86efac' : '1px solid #cbd5e1'
            }}>
              <input
                type="checkbox"
                checked={showOnlyMine}
                onChange={(e) => setShowOnlyMine(e.target.checked)}
                style={{ width: '16px', height: '16px', cursor: 'pointer', margin: 0 }}
              />
              <span>👤 Зөвхөн миний захиалгууд</span>
            </label>

            {/* Search Input */}
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Захиалгын №, харилцагч, утас..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  padding: '0.4rem 0.75rem',
                  paddingLeft: '2rem',
                  borderRadius: '0.375rem',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.85rem',
                  minWidth: '240px',
                  height: '36px'
                }}
              />
              <span style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.85rem' }}>
                🔍
              </span>
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  style={{
                    position: 'absolute',
                    right: '0.5rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    fontSize: '0.8rem'
                  }}
                >
                  ✕
                </button>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem', animation: 'spin 1s linear infinite' }}>⏳</div>
          <p style={{ fontWeight: 600 }}>Үйлдвэрлэлийн мэдээллийг татаж байна...</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && filteredOrders.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem', color: '#64748b' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔍</div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.25rem' }}>
            Тохирох захиалга олдсонгүй
          </h3>
          <p style={{ fontSize: '0.85rem', margin: 0 }}>
            {searchTerm ? `'${searchTerm}' хайлтад үр дүн алга байна.` : 'Энэ шүүлтүүрт одоогоор захиалга байхгүй байна.'}
          </p>
          {showOnlyMine && (
            <button
              type="button"
              onClick={() => setShowOnlyMine(false)}
              className="btn btn-outline"
              style={{ marginTop: '1rem', fontSize: '0.825rem' }}
            >
              Бүх компанийн захиалгуудыг харах
            </button>
          )}
        </div>
      )}

      {/* Main Display: Pipeline Cards View */}
      {!loading && viewMode === 'CARDS' && filteredOrders.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredOrders.map((order) => {
            const progress = getOverallProgress(order.production_stages);
            const activeStage = getActiveStageInfo(order.production_stages);
            const deadlineInfo = getDeadlineStatus(order.deadline, order.is_urgent, progress);
            const stages = order.production_stages || {};

            let leftBorderColor = '#cbd5e1';
            if (progress === 100) leftBorderColor = '#10b981';
            else if (isUrgentOrBottleneck(order)) leftBorderColor = '#f97316';
            else if (progress > 0) leftBorderColor = '#3b82f6';

            return (
              <div
                key={order.id}
                className="card"
                onClick={() => handleOpenDrawer(order)}
                style={{
                  borderLeft: `5px solid ${leftBorderColor}`,
                  padding: '1.25rem 1.5rem',
                  marginBottom: 0,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.08)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                {/* Card Top Row: Order #, Tags, Deadline */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <span style={{
                      background: '#0f172a',
                      color: '#ffffff',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      padding: '0.25rem 0.65rem',
                      borderRadius: '0.375rem',
                      letterSpacing: '0.5px'
                    }}>
                      {order.order_number || `ID: ${order.id}`}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      {new Date(order.createdAt).toLocaleDateString('mn-MN')}
                    </span>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      background: '#f1f5f9',
                      color: '#475569',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '0.25rem'
                    }}>
                      👤 {order.user?.name || order.sales_person_name || 'Борлуулагч'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '0.25rem 0.65rem',
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
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      padding: '0.25rem 0.6rem',
                      borderRadius: '0.25rem',
                      background: order.current_status === 'Бэлэн болсон' ? '#dcfce7' : '#f8fafc',
                      color: order.current_status === 'Бэлэн болсон' ? '#15803d' : '#334155',
                      border: '1px solid #e2e8f0'
                    }}>
                      {order.current_status}
                    </span>
                  </div>
                </div>

                {/* Card Middle: Customer, Product & Overall Progress */}
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1.2fr) minmax(200px, 1fr)', gap: '1.5rem', alignItems: 'center', marginBottom: '1.1rem' }}>
                  <div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.2rem' }}>
                      {order.product_name}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#475569' }}>
                      Харилцагч: <strong style={{ color: '#1e293b' }}>{order.customer_name}</strong>
                      {order.phone && <span style={{ color: '#64748b' }}> ({order.phone})</span>}
                      {' • '}
                      Тоо ширхэг: <strong style={{ color: '#047857' }}>{order.total_qty?.toLocaleString()} ш</strong>
                      {order.size ? ` • ${order.size}` : ''}
                    </div>
                  </div>

                  {/* Progress Gauge */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                      <span style={{ color: '#64748b' }}>Нийт явц:</span>
                      <span style={{ color: progress === 100 ? '#10b981' : progress > 0 ? '#2563eb' : '#64748b', fontSize: '0.95rem', fontWeight: 800 }}>
                        {progress}%
                      </span>
                    </div>
                    <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                      <div 
                        style={{
                          height: '100%',
                          width: `${progress}%`,
                          background: progress === 100 ? '#10b981' : 'linear-gradient(90deg, #3b82f6, #1d4ed8)',
                          transition: 'width 0.3s ease'
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Horizontal 7-Stage Connected Visual Stepper */}
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem',
                  padding: '0.85rem 1rem',
                  marginBottom: '0.85rem'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    position: 'relative',
                    overflowX: 'auto',
                    padding: '0.25rem 0'
                  }}>
                    {STAGES_META.map((st, idx) => {
                      const stData: OrderStageData | undefined = stages[st.key];
                      const val = stData?.status || 0;
                      const isComplete = val === 100;
                      const isInProg = val === 50;

                      let circleBg = '#e2e8f0';
                      let circleColor = '#64748b';
                      let circleBorder = '2px solid #cbd5e1';

                      if (isComplete) {
                        circleBg = '#10b981';
                        circleColor = '#ffffff';
                        circleBorder = '2px solid #059669';
                      } else if (isInProg) {
                        circleBg = '#3b82f6';
                        circleColor = '#ffffff';
                        circleBorder = '2px solid #1d4ed8';
                      }

                      return (
                        <React.Fragment key={st.key}>
                          <div 
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              minWidth: '65px',
                              zIndex: 1,
                              textAlign: 'center'
                            }}
                            title={`${st.label}: ${isComplete ? 'Дууссан' : isInProg ? 'Хийгдэж байна' : 'Хүлээгдэж буй'}${stData?.operator ? ` (${stData.operator})` : ''}${stData?.machine ? ` [${stData.machine}]` : ''}`}
                          >
                            <div 
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: circleBg,
                                color: circleColor,
                                border: circleBorder,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.85rem',
                                fontWeight: 700,
                                marginBottom: '0.3rem',
                                boxShadow: isInProg ? '0 0 0 4px rgba(59, 130, 246, 0.2)' : 'none',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              {isComplete ? '✓' : st.icon}
                            </div>
                            <span style={{
                              fontSize: '0.7rem',
                              fontWeight: isInProg || isComplete ? 700 : 500,
                              color: isInProg ? '#1d4ed8' : isComplete ? '#0f172a' : '#94a3b8',
                              whiteSpace: 'nowrap'
                            }}>
                              {st.shortLabel}
                            </span>
                            {stData?.operator && (
                              <span style={{ fontSize: '0.625rem', color: '#475569', maxWidth: '65px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {stData.operator}
                              </span>
                            )}
                          </div>

                          {/* Connector Line */}
                          {idx < STAGES_META.length - 1 && (
                            <div style={{
                              flex: 1,
                              height: '3px',
                              background: val === 100 ? '#10b981' : '#e2e8f0',
                              margin: '0 4px',
                              marginBottom: '18px',
                              minWidth: '15px'
                            }} />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>

                {/* Card Bottom Row: Current Stage & Quick Actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', paddingTop: '0.25rem' }}>
                  <div style={{ fontSize: '0.825rem', color: '#475569' }}>
                    <span>Одоогийн явц: </span>
                    <strong style={{ color: activeStage.state === 'COMPLETED' ? '#10b981' : '#1e293b' }}>
                      {activeStage.icon} {activeStage.label}
                    </strong>
                    {stages[activeStage.key]?.operator && (
                      <span style={{ color: '#2563eb', marginLeft: '0.35rem' }}>
                        ({stages[activeStage.key]?.operator})
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '0.4rem' }} onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={(e) => handleCopySms(e, order)}
                      style={{
                        padding: '0.3rem 0.65rem',
                        fontSize: '0.775rem',
                        fontWeight: 600,
                        border: '1px solid #cbd5e1',
                        borderRadius: '0.375rem',
                        background: copiedOrderId === order.id ? '#dcfce7' : '#ffffff',
                        color: copiedOrderId === order.id ? '#15803d' : '#334155',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                      }}
                      title="Харилцагчид SMS илгээх текстийг хуулах"
                    >
                      {copiedOrderId === order.id ? '✓ Хууллаа' : '💬 SMS хуулах'}
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setTicketOrder(order);
                      }}
                      style={{
                        padding: '0.3rem 0.65rem',
                        fontSize: '0.775rem',
                        fontWeight: 600,
                        border: '1px solid #cbd5e1',
                        borderRadius: '0.375rem',
                        background: '#ffffff',
                        color: '#334155',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                      }}
                    >
                      📄 Ажлын карт
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenDrawer(order)}
                      style={{
                        padding: '0.3rem 0.75rem',
                        fontSize: '0.775rem',
                        fontWeight: 600,
                        border: '1px solid #2563eb',
                        borderRadius: '0.375rem',
                        background: '#2563eb',
                        color: '#ffffff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                      }}
                    >
                      👁️ Дэлгэрэнгүй
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Alternative Display: Dense Matrix Table View */}
      {!loading && viewMode === 'MATRIX' && filteredOrders.length > 0 && (
        <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.775rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '0.85rem 1rem' }}>Захиалга №</th>
                <th style={{ padding: '0.85rem 1rem' }}>Харилцагч</th>
                <th style={{ padding: '0.85rem 1rem' }}>Бүтээгдэхүүн & Тоо</th>
                <th style={{ padding: '0.85rem 0.5rem', textAlign: 'center' }}>Хугацаа</th>
                {STAGES_META.map(st => (
                  <th key={st.key} style={{ padding: '0.85rem 0.35rem', textAlign: 'center', minWidth: '42px' }} title={st.label}>
                    {st.icon}
                  </th>
                ))}
                <th style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>Нийт %</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Үйлдэл</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => {
                const progress = getOverallProgress(order.production_stages);
                const deadlineInfo = getDeadlineStatus(order.deadline, order.is_urgent, progress);
                const stages = order.production_stages || {};

                return (
                  <tr 
                    key={order.id} 
                    style={{ borderBottom: '1px solid #e2e8f0', cursor: 'pointer' }}
                    onClick={() => handleOpenDrawer(order)}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#0f172a' }}>
                      {order.order_number || `ID: ${order.id}`}
                      <div style={{ fontSize: '0.725rem', color: '#64748b', fontWeight: 400 }}>
                        {order.user?.name || order.sales_person_name || ''}
                      </div>
                    </td>

                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ fontWeight: 600, color: '#1e293b' }}>{order.customer_name}</div>
                      {order.phone && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{order.phone}</div>}
                    </td>

                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ fontWeight: 600, color: '#1e293b' }}>{order.product_name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 600 }}>
                        {order.total_qty?.toLocaleString()} ш {order.size ? `(${order.size})` : ''}
                      </div>
                    </td>

                    <td style={{ padding: '0.85rem 0.5rem', textAlign: 'center' }}>
                      <span style={{
                        fontSize: '0.725rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.5rem',
                        borderRadius: '999px',
                        background: deadlineInfo.bg,
                        color: deadlineInfo.color,
                        border: `1px solid ${deadlineInfo.border}`,
                        whiteSpace: 'nowrap'
                      }}>
                        {deadlineInfo.icon} {deadlineInfo.text}
                      </span>
                    </td>

                    {/* 7 Stage Status Indicators */}
                    {STAGES_META.map(st => {
                      const stData: OrderStageData | undefined = stages[st.key];
                      const val = stData?.status || 0;
                      let bg = '#f1f5f9';
                      let color = '#94a3b8';
                      let label = '0%';

                      if (val === 100) {
                        bg = '#dcfce7';
                        color = '#15803d';
                        label = '✓';
                      } else if (val === 50) {
                        bg = '#dbeafe';
                        color = '#1d4ed8';
                        label = '50%';
                      }

                      return (
                        <td key={st.key} style={{ padding: '0.85rem 0.35rem', textAlign: 'center' }}>
                          <span 
                            style={{
                              display: 'inline-block',
                              padding: '0.15rem 0.35rem',
                              borderRadius: '0.25rem',
                              fontSize: '0.725rem',
                              fontWeight: 700,
                              background: bg,
                              color: color,
                              minWidth: '26px'
                            }}
                            title={`${st.label}: ${val}%${stData?.operator ? ` (${stData.operator})` : ''}`}
                          >
                            {label}
                          </span>
                        </td>
                      );
                    })}

                    {/* Progress % */}
                    <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>
                      <span style={{
                        fontSize: '0.85rem',
                        fontWeight: 800,
                        color: progress === 100 ? '#10b981' : progress > 0 ? '#2563eb' : '#64748b'
                      }}>
                        {progress}%
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.35rem' }}>
                        <button
                          type="button"
                          onClick={(e) => handleCopySms(e, order)}
                          style={{
                            padding: '0.25rem 0.5rem',
                            fontSize: '0.75rem',
                            border: '1px solid #cbd5e1',
                            borderRadius: '0.25rem',
                            background: copiedOrderId === order.id ? '#dcfce7' : '#ffffff',
                            color: copiedOrderId === order.id ? '#15803d' : '#334155',
                            cursor: 'pointer'
                          }}
                          title="SMS хуулах"
                        >
                          💬
                        </button>
                        <button
                          type="button"
                          onClick={() => setTicketOrder(order)}
                          style={{
                            padding: '0.25rem 0.5rem',
                            fontSize: '0.75rem',
                            border: '1px solid #cbd5e1',
                            borderRadius: '0.25rem',
                            background: '#ffffff',
                            color: '#334155',
                            cursor: 'pointer'
                          }}
                          title="Ажлын карт"
                        >
                          📄
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenDrawer(order)}
                          style={{
                            padding: '0.25rem 0.6rem',
                            fontSize: '0.75rem',
                            border: '1px solid #2563eb',
                            borderRadius: '0.25rem',
                            background: '#2563eb',
                            color: '#ffffff',
                            cursor: 'pointer',
                            fontWeight: 600
                          }}
                        >
                          Нээх
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Slide-over Production Inspector Drawer */}
      <ProductionInspectorDrawer
        order={selectedOrder}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onOpenTicket={(order) => setTicketOrder(order)}
      />

      {/* Job Ticket Modal */}
      {ticketOrder && (
        <JobTicketModal
          order={ticketOrder}
          onClose={() => setTicketOrder(null)}
        />
      )}

      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

    </div>
  );
}

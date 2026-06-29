"use client";

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../../stores/useAuthStore';
import { useRouter } from 'next/navigation';
import ProductionMatrix, { Order, OrderStageData } from '../../../components/production/ProductionMatrix';
import KanbanBoard from '../../../components/production/KanbanBoard';

export default function ProductionPage() {
  const { user, token } = useAuthStore();
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'MATRIX' | 'KANBAN'>('MATRIX');

  useEffect(() => {
    if (!token) {
      router.push('/login');
    } else {
      fetchOrders();
    }
  }, [token]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data.filter((o: any) => o.current_status !== 'Хүлээгдэж буй'));
      }
    } catch (e) {
      console.error("Failed to load orders:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStage = async (orderId: number, stageKey: string, newData: OrderStageData) => {
    // Optimistic UI update
    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;
      const currentStages = o.production_stages || {};
      return {
        ...o,
        production_stages: {
          ...currentStages,
          [stageKey]: newData
        }
      };
    }));

    try {
      const targetOrder = orders.find(o => o.id === orderId);
      const updatedStages = {
        ...(targetOrder?.production_stages || {}),
        [stageKey]: newData
      };

      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/orders/${orderId}/stage`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ production_stages: updatedStages })
      });
    } catch (e) {
      console.error("Failed to save stage:", e);
      fetchOrders(); // revert on fail
    }
  };

  const handleMoveStatus = async (orderId: number, newStatus: string) => {
    // Optimistic UI
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, current_status: newStatus } : o));

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ new_status: newStatus, changed_by: user?.id || 1 })
      });
    } catch (e) {
      console.error("Failed to move status:", e);
      fetchOrders();
    }
  };

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            🏭 Үйлдвэрлэлийн Дамжлагын Хяналт
          </h1>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            SelengePress хэвлэлийн үйлдвэрлэлийн явцыг 1-click болон Канбан самбараар бодитоор удирдах
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', background: '#e2e8f0', padding: '0.25rem', borderRadius: '0.5rem' }}>
          <button
            type="button"
            onClick={() => setActiveTab('MATRIX')}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: '0.375rem',
              border: 'none',
              background: activeTab === 'MATRIX' ? 'var(--primary-color)' : 'transparent',
              color: activeTab === 'MATRIX' ? '#fff' : 'var(--text-primary)',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: activeTab === 'MATRIX' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            📋 Үйлдвэрлэлийн Хүснэгт
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('KANBAN')}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: '0.375rem',
              border: 'none',
              background: activeTab === 'KANBAN' ? 'var(--primary-color)' : 'transparent',
              color: activeTab === 'KANBAN' ? '#fff' : 'var(--text-primary)',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: activeTab === 'KANBAN' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            📑 Канбан Самбар
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)' }}>
          🔄 Мэдээлэл ачаалж байна...
        </div>
      ) : activeTab === 'MATRIX' ? (
        <ProductionMatrix orders={orders} onUpdateStage={handleUpdateStage} />
      ) : (
        <KanbanBoard orders={orders} onMoveStatus={handleMoveStatus} />
      )}
    </div>
  );
}

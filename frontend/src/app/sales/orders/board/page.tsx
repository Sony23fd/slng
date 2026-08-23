"use client";

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../../../stores/useAuthStore';
import { useRouter } from 'next/navigation';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import Link from 'next/link';

export default function OrdersBoardPage() {
  const { token, user } = useAuthStore();
  const router = useRouter();

  const [statuses, setStatuses] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/order-statuses`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        const activeStatuses = data.filter((s: any) => s.type !== 'QUOTE' && s.type !== 'PENDING' && s.type !== 'CANCELLED');
        setStatuses(activeStatuses);
      })
      .catch(console.error);

    // Fetch active orders
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/orders?kanbanLimit=true`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data && data.data) {
          setOrders(data.data.filter((o: any) => o.current_status !== 'Санхүү хүлээгдэж буй' && o.current_status !== 'Үнийн санал'));
        } else if (Array.isArray(data)) {
          setOrders(data.filter((o: any) => o.current_status !== 'Санхүү хүлээгдэж буй' && o.current_status !== 'Үнийн санал'));
        }
        setLoading(false);
      })
      .catch(console.error);
  }, [token]);

  const getOrderProgress = (o: any) => {
    const stages = o.production_stages || {};
    const stageKeys = ['design', 'raw_material', 'ctp', 'print', 'inspect', 'fold', 'bind'];
    const totalVal = stageKeys.reduce((acc, k) => acc + (stages[k]?.status || 0), 0);
    return Math.round(totalVal / stageKeys.length);
  };

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId;
    const orderId = Number(draggableId);

    // Optimistic UI update
    const newOrders = Array.from(orders);
    const orderIndex = newOrders.findIndex(o => o.id === orderId);
    if (orderIndex > -1) {
      newOrders[orderIndex].current_status = newStatus;
      setOrders(newOrders);

      // Call API
      fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ new_status: newStatus, changed_by: user?.id || 1, notes: 'Самбараас өөрчлөв' })
      }).catch(err => {
        console.error(err);
        // revert on failure
      });
    }
  };

  if (!token) return <div>Түр хүлээнэ үү...</div>;

  return (
    <div>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="title">Захиалгын Самбар (Kanban)</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Захиалгыг чирэх (drag & drop) байдлаар шат дамжлага шилжүүлэх</p>
        </div>
        <div>
          <Link href="/sales/orders" className="btn btn-outline">
            ← Жагсаалт руу буцах
          </Link>
        </div>
      </header>

      {loading ? (
        <p>Уншиж байна...</p>
      ) : (
        <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem', minHeight: '70vh' }}>
          <DragDropContext onDragEnd={onDragEnd}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', minWidth: 'max-content' }}>
            {statuses.map((statusObj) => {
              return (
                <div key={statusObj.name} style={{ width: '300px', flexShrink: 0 }}>
                <div style={{ padding: '0.75rem', background: '#e2e8f0', borderRadius: '0.5rem 0.5rem 0 0', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', background: statusObj.color || 'var(--primary-color)' }}></span>
                    {statusObj.name}
                  </span>
                  <span style={{ background: '#cbd5e1', padding: '0.1rem 0.5rem', borderRadius: '1rem', fontSize: '0.8rem' }}>
                    {orders.filter(o => (o.current_status || 'Шинэ захиалга') === statusObj.name).length}
                  </span>
                </div>
                <Droppable droppableId={statusObj.name}>
                  {(provided, snapshot) => (
                    <div 
                      ref={provided.innerRef} 
                      {...provided.droppableProps}
                      style={{ 
                        background: snapshot.isDraggingOver ? '#e2e8f0' : '#f1f5f9', 
                        padding: '1rem', 
                        minHeight: '200px', 
                        border: '1px solid #e2e8f0',
                        borderTop: 'none',
                        borderRadius: '0 0 0.5rem 0.5rem'
                      }}
                    >
                      {orders
                        .filter(o => (o.current_status || 'Шинэ захиалга') === statusObj.name)
                        .map((order, index) => (
                          <Draggable key={order.id.toString()} draggableId={order.id.toString()} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={{
                                  ...provided.draggableProps.style,
                                  background: 'white',
                                  padding: '1rem',
                                  borderRadius: '6px',
                                  boxShadow: snapshot.isDragging ? '0 10px 15px -3px rgba(0,0,0,0.1)' : '0 1px 3px 0 rgba(0,0,0,0.1)',
                                  border: '1px solid #e2e8f0',
                                  cursor: 'grab'
                                }}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                  <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0f172a' }}>{order.order_number || `ORD-${order.id}`}</span>
                                  <span style={{ fontSize: '0.8rem', color: order.is_urgent ? '#ef4444' : '#64748b' }}>
                                    {order.is_urgent ? 'ЯАРАЛТАЙ' : ''}
                                  </span>
                                </div>
                                <div style={{ fontSize: '0.9rem', color: '#334155', marginBottom: '0.5rem', fontWeight: 500 }}>
                                  {order.product_name}
                                </div>
                                <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
                                  <span>{order.customer_name}</span>
                                  <span>{order.total_qty} ш</span>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
            </div>
          </DragDropContext>
        </div>
      )}
    </div>
  );
}

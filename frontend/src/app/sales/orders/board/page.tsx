"use client";

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../../../stores/useAuthStore';
import { useRouter } from 'next/navigation';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import Link from 'next/link';

export default function OrdersBoardPage() {
  const { token, user } = useAuthStore();
  const router = useRouter();

  const [statuses, setStatuses] = useState<string[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    // Fetch order statuses
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/constants`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        const statusList = data.filter((c: any) => c.type === 'ORDER_STATUS').map((c: any) => c.value);
        if (statusList.length === 0) {
          statusList.push('Шинэ захиалга', 'Эх бэлтгэл', 'Хэвлэл', 'Дардас', 'Бэлэн', 'Олгосон');
        }
        setStatuses(statusList);
      })
      .catch(console.error);

    // Fetch active orders
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/orders`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setOrders(data);
        setLoading(false);
      })
      .catch(console.error);
  }, [token]);

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
    }

    // API Call
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus, notes: `Чирж зөөсөн: ${newStatus}` })
      });
    } catch (e) {
      console.error(e);
      // Fallback
    }
  };

  if (!token) return <div>Түр хүлээнэ үү...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 className="title">📋 Үйлдвэрлэлийн Самбар</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link href="/sales/orders" className="btn btn-outline">Жагсаалтаар харах</Link>
          <Link href="/sales/orders/new" className="btn btn-primary">+ Шинэ захиалга</Link>
        </div>
      </div>

      {loading ? (
        <p>Уншиж байна...</p>
      ) : (
        <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem', minHeight: '70vh' }}>
          <DragDropContext onDragEnd={onDragEnd}>
            {statuses.map(status => {
              const columnOrders = orders.filter(o => o.current_status === status);
              return (
                <div key={status} style={{ minWidth: '300px', maxWidth: '300px', background: '#f8fafc', borderRadius: '8px', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ padding: '1rem', borderBottom: '2px solid #e2e8f0', fontWeight: 600, color: '#475569', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{status}</span>
                    <span style={{ background: '#e2e8f0', padding: '0.1rem 0.5rem', borderRadius: '1rem', fontSize: '0.8rem' }}>{columnOrders.length}</span>
                  </div>
                  
                  <Droppable droppableId={status}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '150px' }}
                      >
                        {columnOrders.map((order, index) => (
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
          </DragDropContext>
        </div>
      )}
    </div>
  );
}

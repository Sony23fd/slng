"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../../stores/useAuthStore';

interface OrderStatus {
  id: number;
  name: string;
  color: string;
  sequence: number;
  type: string;
  is_system: boolean;
}

export default function OrderStatusesPage() {
  const { user, token } = useAuthStore();
  const router = useRouter();
  const [statuses, setStatuses] = useState<OrderStatus[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    color: '#cbd5e1',
    sequence: 0,
    type: 'ACTIVE'
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else if (token) {
      fetchStatuses();
    }
  }, [user, router, token]);

  const fetchStatuses = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/order-statuses`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setStatuses(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId 
        ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/order-statuses/${editingId}`
        : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/order-statuses`;
      
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setShowAdd(false);
        setEditingId(null);
        setFormData({ name: '', color: '#cbd5e1', sequence: 0, type: 'ACTIVE' });
        fetchStatuses();
      } else {
        const err = await res.json();
        alert(err.error || "Алдаа гарлаа");
      }
    } catch (e) {
      console.error(e);
      alert("Сервертэй холбогдоход алдаа гарлаа");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Энэ төлвийг устгах уу?")) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/order-statuses/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchStatuses();
      } else {
        const err = await res.json();
        alert(err.error || "Устгах үед алдаа гарлаа");
      }
    } catch (e) {
      alert("Устгах үед алдаа гарлаа");
    }
  };

  const handleEdit = (status: OrderStatus) => {
    setEditingId(status.id);
    setFormData({
      name: status.name,
      color: status.color,
      sequence: status.sequence,
      type: status.type
    });
    setShowAdd(true);
  };

  const typeLabels: Record<string, string> = {
    'QUOTE': 'Үнийн санал',
    'PENDING': 'Хүлээгдэж буй',
    'ACTIVE': 'Үндсэн',
    'READY': 'Бэлэн болсон',
    'DELIVERED': 'Олгосон',
    'CANCELLED': 'Цуцлагдсан'
  };

  if (!user) return <div style={{ padding: '2rem' }}>Уншиж байна...</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="text-2xl font-bold">Захиалгын төлвүүд</h1>
        <button className="btn btn-primary" onClick={() => {
          setShowAdd(!showAdd);
          setEditingId(null);
          setFormData({ name: '', color: '#cbd5e1', sequence: 0, type: 'ACTIVE' });
        }}>
          {showAdd ? 'Буцах' : '+ Төлөв нэмэх'}
        </button>
      </div>

      {showAdd && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>
            {editingId ? 'Төлөв засах' : 'Шинэ төлөв нэмэх'}
          </h2>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
            <div className="form-group">
              <label className="label">Төлвийн нэр *</label>
              <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="input" placeholder="Жишээ: Хэвлэх үйлдвэр..." />
            </div>
            
            <div className="form-group">
              <label className="label">Төрөл *</label>
              <select required value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="input">
                {Object.entries(typeLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label} ({key})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="label">Өнгө (Hex code)</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input type="color" value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} style={{ height: '40px', width: '50px', padding: '0', cursor: 'pointer' }} />
                <input type="text" value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} className="input" style={{ flex: 1 }} />
              </div>
            </div>

            <div className="form-group">
              <label className="label">Дараалал (Sequence)</label>
              <input type="number" required value={formData.sequence} onChange={e => setFormData({...formData, sequence: Number(e.target.value)})} className="input" />
            </div>

            <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
              <button type="submit" className="btn btn-primary">Хадгалах</button>
            </div>
          </form>
        </div>
      )}

      <div className="card" style={{ overflowX: 'auto' }}>
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: '60px' }}>№</th>
              <th>Нэр</th>
              <th>Төрөл</th>
              <th>Өнгө</th>
              <th style={{ textAlign: 'right' }}>Үйлдэл</th>
            </tr>
          </thead>
          <tbody>
            {statuses.map((status) => (
              <tr key={status.id}>
                <td>{status.sequence}</td>
                <td style={{ fontWeight: 500 }}>
                  <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: status.color, marginRight: '8px' }}></span>
                  {status.name}
                  {status.is_system && <span style={{ marginLeft: '8px', fontSize: '0.75rem', padding: '2px 6px', background: '#e2e8f0', borderRadius: '12px', color: '#64748b' }}>System</span>}
                </td>
                <td>{typeLabels[status.type] || status.type}</td>
                <td><code style={{ fontSize: '0.875rem', background: '#f1f5f9', padding: '2px 4px', borderRadius: '4px' }}>{status.color}</code></td>
                <td style={{ textAlign: 'right' }}>
                  <button onClick={() => handleEdit(status)} className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', marginRight: '0.5rem' }}>Засах</button>
                  <button onClick={() => handleDelete(status.id)} className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', color: '#ef4444', borderColor: '#fee2e2' }} disabled={status.is_system}>
                    Устгах
                  </button>
                </td>
              </tr>
            ))}
            {statuses.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>Өгөгдөл олдсонгүй</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

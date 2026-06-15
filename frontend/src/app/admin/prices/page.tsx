"use client";

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../../stores/useAuthStore';
import { useRouter } from 'next/navigation';

export default function AdminPrices() {
  const [prices, setPrices] = useState<any[]>([]);
  const { token, user } = useAuthStore();
  const router = useRouter();
  
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({ category: 'Цаас', item_name: '', unit_cost: '' });

  useEffect(() => {
    if (user && user.role !== 'ADMIN' && user.role !== 'FINANCE') {
      router.push('/admin'); // RBAC enforcement on frontend
      return;
    } else if (token) {
      fetchPrices();
    }
  }, [user, router, token]);

  const fetchPrices = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/prices`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setPrices(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdate = async (id: number, newCost: number) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/prices/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ unit_cost: newCost })
      });
      if (res.ok) {
        alert('Амжилттай хадгаллаа');
        fetchPrices();
      } else {
        alert('Алдаа гарлаа');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/prices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(formData)
    });
    if (res.ok) {
      setShowAdd(false);
      setFormData({ category: 'Цаас', item_name: '', unit_cost: '' });
      fetchPrices();
      alert("Шинэ үнэ амжилттай нэмэгдлээ");
    } else {
      alert("Алдаа гарлаа");
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="title">💰 Мастер үнэ тохиргоо</h1>
        <button className="btn btn-primary" onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? 'Буцах' : '+ Шинэ үнэ нэмэх'}
        </button>
      </div>

      {showAdd && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3>Шинэ түүхий эд/үйлчилгээ нэмэх</h3>
          <form onSubmit={handleAdd} style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
            <div>
              <label className="label">Ангилал (Жишээ: Цаас, Будаг, Хэвлэл)</label>
              <input type="text" required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="input" />
            </div>
            <div>
              <label className="label">Нэр (Жишээ: Шохойтой 150гр)</label>
              <input type="text" required value={formData.item_name} onChange={e => setFormData({...formData, item_name: e.target.value})} className="input" />
            </div>
            <div>
              <label className="label">Нэгж өртөг (₮)</label>
              <input type="number" required value={formData.unit_cost} onChange={e => setFormData({...formData, unit_cost: e.target.value})} className="input" />
            </div>
            <button type="submit" className="btn btn-primary">Хадгалах</button>
          </form>
        </div>
      )}

      <div className="card">
        <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>Энд өөрчилсөн үнэ нь захиалгын форм дээр автоматаар бодогдоход ашиглагдана.</p>
        
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
              <th style={{ padding: '1rem' }}>Ангилал</th>
              <th style={{ padding: '1rem' }}>Нэр</th>
              <th style={{ padding: '1rem' }}>Нэгж өртөг (₮)</th>
              <th style={{ padding: '1rem' }}>Үйлдэл</th>
            </tr>
          </thead>
          <tbody>
            {prices.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '1rem' }}>{p.category}</td>
                <td style={{ padding: '1rem' }}>{p.item_name}</td>
                <td style={{ padding: '1rem' }}>
                  <input 
                    type="number" 
                    defaultValue={p.unit_cost} 
                    id={`price-${p.id}`}
                    style={{ width: '150px' }}
                    className="input"
                  />
                </td>
                <td style={{ padding: '1rem' }}>
                  <button 
                    onClick={() => {
                      const el = document.getElementById(`price-${p.id}`) as HTMLInputElement;
                      if (el) handleUpdate(p.id, Number(el.value));
                    }}
                    className="btn btn-primary"
                    style={{ padding: '0.5rem 1rem' }}
                  >
                    Хадгалах
                  </button>
                </td>
              </tr>
            ))}
            {prices.length === 0 && (
              <tr><td colSpan={4} style={{ padding: '1rem', textAlign: 'center' }}>Мастер үнэ олдсонгүй (Дээрх товчоор шинээр нэмнэ үү)</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

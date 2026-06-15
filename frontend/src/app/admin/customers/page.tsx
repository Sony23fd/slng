"use client";

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../../stores/useAuthStore';
import { useRouter } from 'next/navigation';

export default function CustomersPage() {
  const { user, token } = useAuthStore();
  const router = useRouter();

  const [customers, setCustomers] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', company_name: '', discount_margin: 20, notes: '' });

  useEffect(() => {
    if (user && user.role !== 'ADMIN' && user.role !== 'FINANCE') {
      router.push('/');
    } else if (token) {
      fetchCustomers();
    }
  }, [user, router, token]);

  const fetchCustomers = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/customers`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) setCustomers(await res.json());
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/customers/${editingId}` : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/customers`;
    const method = editingId ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ ...formData, discount_margin: Number(formData.discount_margin) })
    });
    
    if (res.ok) {
      setShowAdd(false);
      setEditingId(null);
      setFormData({ name: '', phone: '', email: '', company_name: '', discount_margin: 20, notes: '' });
      fetchCustomers();
    } else {
      alert("Алдаа гарлаа. Нэр давхардсан байж болзошгүй.");
    }
  };

  const handleEdit = (c: any) => {
    setEditingId(c.id);
    setFormData({ name: c.name, phone: c.phone || '', email: c.email || '', company_name: c.company_name || '', discount_margin: c.discount_margin || 20, notes: c.notes || '' });
    setShowAdd(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Устгах уу?')) return;
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/customers/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) fetchCustomers();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 className="title">🤝 Харилцагчийн сан</h1>
        <button className="btn btn-primary" onClick={() => {
          setShowAdd(!showAdd);
          setEditingId(null);
          setFormData({ name: '', phone: '', email: '', company_name: '', discount_margin: 20, notes: '' });
        }}>
          {showAdd ? 'Буцах' : '+ Харилцагч нэмэх'}
        </button>
      </div>

      {showAdd && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3>{editingId ? 'Харилцагч засах' : 'Шинэ харилцагч'}</h3>
          <form onSubmit={handleAdd} className="form-grid" style={{ marginTop: '1rem' }}>
            <div className="form-group">
              <label className="label">Нэр / Байгууллага*</label>
              <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="input" />
            </div>
            <div className="form-group">
              <label className="label">Утас</label>
              <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="input" />
            </div>
            <div className="form-group">
              <label className="label">И-мэйл</label>
              <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="input" />
            </div>
            <div className="form-group">
              <label className="label">Компанийн нэр</label>
              <input type="text" value={formData.company_name} onChange={e => setFormData({...formData, company_name: e.target.value})} className="input" />
            </div>
            <div className="form-group">
              <label className="label">Онцгой ашгийн хувь (%)</label>
              <input type="number" value={formData.discount_margin} onChange={e => setFormData({...formData, discount_margin: Number(e.target.value)})} className="input" />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="label">Тэмдэглэл</label>
              <input type="text" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="input" />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <button type="submit" className="btn btn-primary">Хадгалах</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '0.5rem' }}>Нэр</th>
              <th style={{ padding: '0.5rem' }}>Утас</th>
              <th style={{ padding: '0.5rem' }}>Компани</th>
              <th style={{ padding: '0.5rem' }}>Ашиг (%)</th>
              <th style={{ padding: '0.5rem', width: '150px' }}>Үйлдэл</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c: any) => (
              <tr key={c.id} style={{ borderBottom: '1px dashed var(--border-color)' }}>
                <td style={{ padding: '0.5rem', fontWeight: 500 }}>{c.name}</td>
                <td style={{ padding: '0.5rem' }}>{c.phone || '-'}</td>
                <td style={{ padding: '0.5rem' }}>{c.company_name || '-'}</td>
                <td style={{ padding: '0.5rem' }}>{c.discount_margin}%</td>
                <td style={{ padding: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => handleEdit(c)} style={{ color: 'var(--primary-color)', background: 'transparent', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Засах</button>
                  <button onClick={() => handleDelete(c.id)} style={{ color: 'var(--danger-color)', background: 'transparent', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Устгах</button>
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr><td colSpan={5} style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>Харилцагч байхгүй байна.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

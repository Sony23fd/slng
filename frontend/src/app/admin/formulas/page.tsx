"use client";

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../../stores/useAuthStore';
import { useRouter } from 'next/navigation';

export default function AdminFormulasPage() {
  const { user, token } = useAuthStore();
  const router = useRouter();

  const [formulas, setFormulas] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: '', expression: '', description: '' });

  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      router.push('/admin');
    } else if (token) {
      fetchFormulas();
    }
  }, [user, router, token]);

  const fetchFormulas = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/formulas`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) setFormulas(await res.json());
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/formulas/${editingId}` : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/formulas`;
    const method = editingId ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(formData)
    });
    if (res.ok) {
      setShowAdd(false);
      setEditingId(null);
      setFormData({ name: '', expression: '', description: '' });
      fetchFormulas();
      alert("Амжилттай хадгаллаа");
    } else {
      alert("Алдаа гарлаа");
    }
  };

  const handleEdit = (formula: any) => {
    setEditingId(formula.id);
    setFormData({ name: formula.name, expression: formula.expression, description: formula.description || '' });
    setShowAdd(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Энэ томъёог устгах уу? Захиалгын бодолт алдаатай болох эрсдэлтэй!')) return;
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/formulas/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) fetchFormulas();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 className="title">🧮 Тооцооллын Томъёо Удирдах</h1>
        <button className="btn btn-primary" onClick={() => {
          setShowAdd(!showAdd);
          setEditingId(null);
          setFormData({ name: '', expression: '', description: '' });
        }}>
          {showAdd ? 'Буцах' : '+ Шинэ томъёо'}
        </button>
      </div>

      <div style={{ background: '#e0f2fe', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #bae6fd' }}>
        <h4 style={{ margin: '0 0 0.5rem', color: '#0284c7' }}>💡 Ашиглах боломжтой хувьсагчид:</h4>
        <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#0369a1', fontSize: '0.9rem' }}>
          <li><code>base_qty</code> - Үндсэн тоо (Ж: 1000)</li>
          <li><code>extra_qty</code> - Нэмэлт тоо (Ж: 50)</li>
          <li><code>divide_by</code> - Хуваалт буюу нэг хуудсанд хэд багтах тоо (Ж: 8)</li>
          <li><code>press_sheet</code> - Хэвлэлийн хуудас буюу Үржвэр (Ж: 2.5)</li>
          <li><code>total_pages</code> - Нийт нүүр хуудасны тоо (Ж: 100)</li>
          <li><code>setups</code> - Сет буюу Хэвлэлийн хуудсыг дээшээ татаж бүхэлдсэн тоо (Ж: 3)</li>
        </ul>
        <p style={{ marginTop: '0.5rem', marginBottom: 0, fontSize: '0.85rem', color: '#0284c7' }}>Жишээ томъёо: <code>((base_qty * (total_pages / 2)) / press_sheet) + (extra_qty * setups)</code></p>
      </div>

      {showAdd ? (
        <form onSubmit={handleAdd} className="card" style={{ padding: '1.5rem' }}>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label>Томъёоны нэр (Ж: Номын дотор бодолт)</label>
            <input 
              required 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
            />
          </div>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label>Математик илэрхийлэл (Expression)</label>
            <input 
              required 
              value={formData.expression} 
              onChange={e => setFormData({...formData, expression: e.target.value})} 
              style={{ fontFamily: 'monospace' }}
              placeholder="Жнь: (base_qty + extra_qty) / divide_by"
            />
          </div>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label>Тайлбар</label>
            <textarea 
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})} 
              style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
            />
          </div>
          <button type="submit" className="btn btn-primary">Хадгалах</button>
        </form>
      ) : (
        <div className="card" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0', background: '#f8fafc' }}>
                <th style={{ padding: '1rem' }}>ID</th>
                <th style={{ padding: '1rem' }}>Томъёоны Нэр</th>
                <th style={{ padding: '1rem' }}>Илэрхийлэл</th>
                <th style={{ padding: '1rem' }}>Тайлбар</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Үйлдэл</th>
              </tr>
            </thead>
            <tbody>
              {formulas.map(f => (
                <tr key={f.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '1rem' }}>{f.id}</td>
                  <td style={{ padding: '1rem', fontWeight: 600 }}>{f.name}</td>
                  <td style={{ padding: '1rem', fontFamily: 'monospace', color: '#dc2626' }}>{f.expression}</td>
                  <td style={{ padding: '1rem', color: '#64748b', fontSize: '0.9rem' }}>{f.description}</td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button onClick={() => handleEdit(f)} className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem', marginRight: '0.5rem' }}>Засах</button>
                    <button onClick={() => handleDelete(f.id)} className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem', color: '#ef4444', borderColor: '#ef4444' }}>Устгах</button>
                  </td>
                </tr>
              ))}
              {formulas.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Томъёо бүртгэгдээгүй байна.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

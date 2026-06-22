"use client";

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../../stores/useAuthStore';
import { useRouter } from 'next/navigation';

interface CoverRule {
  id: number;
  size: string;
  binding: string;
  press_sheet: number;
  divide_by: number;
  print_size: string;
}

export default function CoverRulesPage() {
  const { user, token } = useAuthStore();
  const router = useRouter();

  const [rules, setRules] = useState<CoverRule[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ size: '', binding: 'Наалттай', press_sheet: '', divide_by: '', print_size: '' });
  const [constants, setConstants] = useState<any[]>([]);

  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      router.push('/admin');
    } else if (token) {
      fetchRules();
      fetchConstants();
    }
  }, [user, router, token]);

  const fetchRules = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/coverrules`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setRules(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const fetchConstants = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/constants`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setConstants(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/coverrules/${editingId}` : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/coverrules`;
    const method = editingId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setShowAdd(false);
        setEditingId(null);
        setFormData({ size: '', binding: 'Наалттай', press_sheet: '', divide_by: '', print_size: '' });
        fetchRules();
      } else {
        alert("Алдаа гарлаа. Нэр давхардсан байж болзошгүй.");
      }
    } catch (e) {
      console.error(e);
      alert("Алдаа гарлаа.");
    }
  };

  const handleEdit = (r: CoverRule) => {
    setEditingId(r.id);
    setFormData({ size: r.size, binding: r.binding, press_sheet: String(r.press_sheet), divide_by: String(r.divide_by), print_size: r.print_size });
    setShowAdd(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Устгах уу?')) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/coverrules/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchRules();
    } catch (e) {
      console.error(e);
    }
  };

  const sizes = constants.filter(c => c.type === 'SIZE');

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 className="title">📐 Хавтасны дүрмүүд</h1>
        <button className="btn btn-primary" onClick={() => {
          setShowAdd(!showAdd);
          setEditingId(null);
          setFormData({ size: '', binding: 'Наалттай', press_sheet: '', divide_by: '', print_size: '' });
        }}>
          {showAdd ? 'Буцах' : '+ Дүрэм үүсгэх'}
        </button>
      </div>

      {showAdd && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3>{editingId ? 'Дүрэм засах' : 'Шинэ дүрэм'}</h3>
          <form onSubmit={handleAdd} className="form-grid" style={{ marginTop: '1rem' }}>
            <div className="form-group">
              <label className="label">Номын хэмжээ*</label>
              <select required value={formData.size} onChange={e => setFormData({...formData, size: e.target.value})} className="input">
                <option value="">Сонгох...</option>
                {sizes.map((c: any) => <option key={c.id} value={c.value}>{c.value}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="label">Хавтасны төрөл*</label>
              <select required value={formData.binding} onChange={e => setFormData({...formData, binding: e.target.value})} className="input">
                <option value="Наалттай">Наалттай</option>
                <option value="Үдээстэй">Үдээстэй</option>
                <option value="Хатуу хавтастай">Хатуу хавтастай</option>
              </select>
            </div>
            <div className="form-group">
              <label className="label">Хэвлэлийн хуудас (press_sheet)*</label>
              <input type="number" step="any" required value={formData.press_sheet} onChange={e => setFormData({...formData, press_sheet: e.target.value})} className="input" placeholder="Жишээ: 1.0 эсвэл 0.5" />
            </div>
            <div className="form-group">
              <label className="label">Хуваалт (divide_by)*</label>
              <input type="number" step="any" required value={formData.divide_by} onChange={e => setFormData({...formData, divide_by: e.target.value})} className="input" placeholder="Жишээ: 6" />
            </div>
            <div className="form-group">
              <label className="label">Хэвлэх хэмжээ (print_size)*</label>
              <input type="text" required value={formData.print_size} onChange={e => setFormData({...formData, print_size: e.target.value})} className="input" placeholder="Жишээ: A3, B2" />
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
              <th>ID</th>
              <th>Номын хэмжээ</th>
              <th>Хавтасны төрөл</th>
              <th>Хэвлэлийн хуудас</th>
              <th>Хуваалт</th>
              <th>Хэвлэх хэмжээ [M2]</th>
              <th style={{ width: '150px' }}>Үйлдэл</th>
            </tr>
          </thead>
          <tbody>
            {rules.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>Өгөгдөл олдсонгүй</td></tr>
            ) : rules.map(r => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td style={{ fontWeight: 600 }}>{r.size}</td>
                <td>{r.binding}</td>
                <td>{r.press_sheet}</td>
                <td>{r.divide_by}</td>
                <td>{r.print_size}</td>
                <td>
                  <button className="btn btn-primary" style={{ padding: '0.25rem 0.75rem', marginRight: '0.5rem', background: '#3b82f6' }} onClick={() => handleEdit(r)}>Засах</button>
                  <button className="btn btn-primary" style={{ padding: '0.25rem 0.75rem', background: '#ef4444' }} onClick={() => handleDelete(r.id)}>Устгах</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

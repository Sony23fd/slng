"use client";

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../../stores/useAuthStore';
import { useRouter } from 'next/navigation';

export default function TemplatesPage() {
  const { user, token } = useAuthStore();
  const router = useRouter();

  const [templates, setTemplates] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ template_name: '', category: '', size: '', cover_color: '', inner_color: '', total_pages: 0, needs_design: false, notes: '' });
  const [constants, setConstants] = useState<any[]>([]);

  useEffect(() => {
    if (user && user.role !== 'ADMIN' && user.role !== 'FINANCE') {
      router.push('/');
    } else if (token) {
      fetchTemplates();
      fetchConstants();
    }
  }, [user, router, token]);

  const fetchTemplates = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/templates`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) setTemplates(await res.json());
  };

  const fetchConstants = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/constants`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) setConstants(await res.json());
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/templates/${editingId}` : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/templates`;
    const method = editingId ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ ...formData, total_pages: Number(formData.total_pages) })
    });
    
    if (res.ok) {
      setShowAdd(false);
      setEditingId(null);
      setFormData({ template_name: '', category: '', size: '', cover_color: '', inner_color: '', total_pages: 0, needs_design: false, notes: '' });
      fetchTemplates();
    } else {
      alert("Алдаа гарлаа. Нэр давхардсан байж болзошгүй.");
    }
  };

  const handleEdit = (t: any) => {
    setEditingId(t.id);
    setFormData({ template_name: t.template_name, category: t.category || '', size: t.size || '', cover_color: t.cover_color || '', inner_color: t.inner_color || '', total_pages: t.total_pages || 0, needs_design: t.needs_design || false, notes: t.notes || '' });
    setShowAdd(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Устгах уу?')) return;
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/templates/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) fetchTemplates();
  };

  const groupedConstants = constants.reduce((acc, curr) => {
    if (!acc[curr.type]) acc[curr.type] = [];
    acc[curr.type].push(curr);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 className="title">📄 Бүтээгдэхүүний бэлэн загвар (Template)</h1>
        <button className="btn btn-primary" onClick={() => {
          setShowAdd(!showAdd);
          setEditingId(null);
          setFormData({ template_name: '', category: '', size: '', cover_color: '', inner_color: '', total_pages: 0, needs_design: false, notes: '' });
        }}>
          {showAdd ? 'Буцах' : '+ Загвар үүсгэх'}
        </button>
      </div>

      {showAdd && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3>{editingId ? 'Загвар засах' : 'Шинэ загвар'}</h3>
          <form onSubmit={handleAdd} className="form-grid" style={{ marginTop: '1rem' }}>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="label">Загварын нэр*</label>
              <input type="text" required value={formData.template_name} onChange={e => setFormData({...formData, template_name: e.target.value})} className="input" placeholder="Жишээ: А4 хэмжээтэй, 100 хуудастай ном" />
            </div>
            <div className="form-group">
              <label className="label">Ангилал</label>
              <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="input">
                <option value="">Сонгох...</option>
                {groupedConstants['CATEGORY']?.map((c: any) => <option key={c.id} value={c.value}>{c.value}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="label">Хэмжээ</label>
              <select value={formData.size} onChange={e => setFormData({...formData, size: e.target.value})} className="input">
                <option value="">Сонгох...</option>
                {groupedConstants['SIZE']?.map((c: any) => <option key={c.id} value={c.value}>{c.value}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="label">Хавтасны өнгө</label>
              <select value={formData.cover_color} onChange={e => setFormData({...formData, cover_color: e.target.value})} className="input">
                <option value="">Сонгох...</option>
                {groupedConstants['COVER_COLOR']?.map((c: any) => <option key={c.id} value={c.value}>{c.value}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="label">Дотор өнгө</label>
              <select value={formData.inner_color} onChange={e => setFormData({...formData, inner_color: e.target.value})} className="input">
                <option value="">Сонгох...</option>
                {groupedConstants['INNER_COLOR']?.map((c: any) => <option key={c.id} value={c.value}>{c.value}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="label">Нийт хуудас</label>
              <input type="number" value={formData.total_pages} onChange={e => setFormData({...formData, total_pages: Number(e.target.value)})} className="input" />
            </div>
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
              <input type="checkbox" checked={formData.needs_design} onChange={e => setFormData({...formData, needs_design: e.target.checked})} style={{ width: '1.2rem', height: '1.2rem' }} />
              <label style={{ margin: 0 }}>Эх бэлтгэл шаардлагатай</label>
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
              <th style={{ padding: '0.5rem' }}>Загварын нэр</th>
              <th style={{ padding: '0.5rem' }}>Ангилал</th>
              <th style={{ padding: '0.5rem' }}>Хэмжээ</th>
              <th style={{ padding: '0.5rem' }}>Хавтас / Дотор</th>
              <th style={{ padding: '0.5rem' }}>Хуудас</th>
              <th style={{ padding: '0.5rem', width: '150px' }}>Үйлдэл</th>
            </tr>
          </thead>
          <tbody>
            {templates.map((t: any) => (
              <tr key={t.id} style={{ borderBottom: '1px dashed var(--border-color)' }}>
                <td style={{ padding: '0.5rem', fontWeight: 500 }}>{t.template_name}</td>
                <td style={{ padding: '0.5rem' }}>{t.category || '-'}</td>
                <td style={{ padding: '0.5rem' }}>{t.size || '-'}</td>
                <td style={{ padding: '0.5rem' }}>{t.cover_color || '-'} / {t.inner_color || '-'}</td>
                <td style={{ padding: '0.5rem' }}>{t.total_pages || '-'}</td>
                <td style={{ padding: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => handleEdit(t)} style={{ color: 'var(--primary-color)', background: 'transparent', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Засах</button>
                  <button onClick={() => handleDelete(t.id)} style={{ color: 'var(--danger-color)', background: 'transparent', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Устгах</button>
                </td>
              </tr>
            ))}
            {templates.length === 0 && (
              <tr><td colSpan={6} style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>Загвар байхгүй байна.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

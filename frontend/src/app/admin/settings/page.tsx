"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useAuthStore } from '../../../stores/useAuthStore';
import { useRouter, useSearchParams } from 'next/navigation';

function SettingsContent() {
  const { user, token } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeType = searchParams.get('type') || 'CATEGORY';

  const [constants, setConstants] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ type: activeType, value: '', description: '' });

  // Update formData.type if activeType changes
  useEffect(() => {
    setFormData(prev => ({ ...prev, type: activeType }));
    setShowAdd(false);
  }, [activeType]);

  useEffect(() => {
    if (user && user.role !== 'ADMIN' && user.role !== 'FINANCE') {
      router.push('/admin');
    } else if (token) {
      fetchConstants();
    }
  }, [user, router, token]);

  const fetchConstants = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/constants`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) setConstants(await res.json());
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/constants/${editingId}` : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/constants`;
    const method = editingId ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(formData)
    });
    if (res.ok) {
      setShowAdd(false);
      setEditingId(null);
      setFormData({ type: activeType, value: '', description: '' });
      fetchConstants();
      alert("Амжилттай хадгаллаа");
    } else {
      alert("Алдаа гарлаа");
    }
  };

  const handleEdit = (constant: any) => {
    setEditingId(constant.id);
    setFormData({ type: constant.type, value: constant.value, description: constant.description || '' });
    setShowAdd(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Устгах уу?')) return;
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/constants/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) fetchConstants();
  };

  const filteredConstants = constants.filter(c => c.type === activeType);

  const typeLabels: any = {
    CATEGORY: 'Бүтээгдэхүүний ангилал',
    SIZE: 'Бүтээгдэхүүний хэмжээ',
    COVER_COLOR: 'Хавтасны өнгө',
    INNER_COLOR: 'Дотор өнгө',
    PAYMENT_METHOD: 'Төлбөрийн хэлбэр',
    NEXT_PROCESS: 'Дараагийн процесс',
    ORDER_START_SEQ: 'Захиалгын эхлэх дугаар (Ж: 700)',
    ORDER_STATUS: 'Захиалгын төлөв (Kanban)',
    OUTSOURCED_JOB: 'Гадуур ажлын нэр',
    OUTSOURCED_CONTRACTOR: 'Гүйцэтгэгч байгууллага',
    DEFAULT_PROFIT_MARGIN: 'Үндсэн ашгийн хувь (Ж: 20)',
    DEFAULT_DEPOSIT_PERCENT: 'Урьдчилгаа төлбөрийн хувь (Ж: 50)'
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 className="title">⚙️ {typeLabels[activeType] || activeType} тохиргоо</h1>
        <button className="btn btn-primary" onClick={() => {
          setShowAdd(!showAdd);
          setEditingId(null);
          setFormData({ type: activeType, value: '', description: '' });
        }}>
          {showAdd ? 'Буцах' : '+ Шинэ утга нэмэх'}
        </button>
      </div>

      {showAdd && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3>{editingId ? 'Утга засах' : 'Шинэ утга нэмэх'}</h3>
          <form onSubmit={handleAdd} style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
            <input type="hidden" value={formData.type} />
            <div>
              <label className="label">Утга (Дэлгэцэд харагдах нэр)</label>
              <input type="text" required value={formData.value} onChange={e => setFormData({...formData, value: e.target.value})} className="input" />
            </div>
            <div>
              <label className="label">Тайлбар (Заавал биш)</label>
              <input type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="input" />
            </div>
            <button type="submit" className="btn btn-primary">Хадгалах</button>
          </form>
        </div>
      )}

      <div className="card">
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '0.5rem' }}>Утга</th>
              <th style={{ padding: '0.5rem' }}>Тайлбар</th>
              <th style={{ padding: '0.5rem', width: '100px' }}>Үйлдэл</th>
            </tr>
          </thead>
          <tbody>
            {filteredConstants.length > 0 ? filteredConstants.map((c: any) => (
              <tr key={c.id} style={{ borderBottom: '1px dashed var(--border-color)' }}>
                <td style={{ padding: '0.5rem' }}>{c.value}</td>
                <td style={{ padding: '0.5rem', color: 'var(--text-muted)' }}>{c.description}</td>
                <td style={{ padding: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => handleEdit(c)} style={{ color: 'var(--primary-color)', background: 'transparent', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                    Засах
                  </button>
                  <button onClick={() => handleDelete(c.id)} style={{ color: 'var(--danger-color)', background: 'transparent', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                    Устгах
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={3} style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Одоогоор жагсаалтад утга байхгүй байна.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AdminSettings() {
  return (
    <Suspense fallback={<div>Уншиж байна...</div>}>
      <SettingsContent />
    </Suspense>
  );
}

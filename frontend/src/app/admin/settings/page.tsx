"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useAuthStore } from '../../../stores/useAuthStore';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

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
    ORDER_STATUS: 'Захиалгын төлөв',
    OUTSOURCED_JOB: 'Гадуур ажлын нэр',
    OUTSOURCED_CONTRACTOR: 'Гүйцэтгэгч',
    ORDER_START_SEQ: 'Эхлэх дугаар',
    DEFAULT_PROFIT_MARGIN: 'Үндсэн үнийн үржүүлэгч (коэф e.g. 2.3)',
    DEFAULT_DEPOSIT_PERCENT: 'Урьдчилгаа (%)',
    COMPANY_LOGO: 'Компанийн Лого'
  };

  const tabs = Object.keys(typeLabels);

  return (
    <div>
      <h1 className="title" style={{ marginBottom: '1.5rem' }}>⚙️ Системийн Тохиргоо</h1>
      
      {/* Horizontal Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
        {tabs.map(tab => (
          <Link 
            key={tab} 
            href={`/admin/settings?type=${tab}`}
            style={{ 
              padding: '0.4rem 1rem', 
              background: activeType === tab ? 'var(--primary-color)' : '#f1f5f9', 
              color: activeType === tab ? '#fff' : 'var(--text-secondary)',
              borderRadius: '2rem',
              fontSize: '0.85rem',
              fontWeight: activeType === tab ? 600 : 500,
              textDecoration: 'none'
            }}
          >
            {typeLabels[tab]}
          </Link>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', fontWeight: 600 }}>{typeLabels[activeType]}</h2>
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
              <label className="label">
                {(activeType === 'INNER_COLOR' || activeType === 'COVER_COLOR') ? 'Үнэ (₮)' : 'Тайлбар (Заавал биш)'}
              </label>
              <input 
                type={(activeType === 'INNER_COLOR' || activeType === 'COVER_COLOR') ? 'number' : 'text'} 
                step="any"
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
                className="input" 
                placeholder={(activeType === 'INNER_COLOR' || activeType === 'COVER_COLOR') ? 'Жишээ нь: 15000' : ''}
              />
            </div>
            <button type="submit" className="btn btn-primary">Хадгалах</button>
          </form>
        </div>
      )}

      <div className="card">
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '0.75rem 0.5rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Утга</th>
              <th style={{ padding: '0.75rem 0.5rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{(activeType === 'INNER_COLOR' || activeType === 'COVER_COLOR') ? 'Үнэ (₮)' : 'Тайлбар'}</th>
              <th style={{ padding: '0.75rem 0.5rem', color: 'var(--text-secondary)', fontWeight: 600, width: '120px' }}>Үйлдэл</th>
            </tr>
          </thead>
          <tbody>
            {filteredConstants.length > 0 ? filteredConstants.map((c: any) => (
              <tr key={c.id} style={{ borderBottom: '1px dashed var(--border-color)' }}>
                <td style={{ padding: '0.75rem 0.5rem' }}>{c.value}</td>
                <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)' }}>
                  {(activeType === 'INNER_COLOR' || activeType === 'COVER_COLOR') && c.description 
                    ? `${Number(c.description).toLocaleString()} ₮` 
                    : c.description}
                </td>
                <td style={{ padding: '0.75rem 0.5rem', display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => handleEdit(c)} style={{ color: 'var(--primary-color)', background: '#e0e7ff', border: 'none', cursor: 'pointer', padding: '0.35rem 0.75rem', borderRadius: '0.375rem', fontSize: '0.75rem', fontWeight: 600 }}>
                    Засах
                  </button>
                  <button onClick={() => handleDelete(c.id)} style={{ color: 'var(--danger-color)', background: '#ffe4e6', border: 'none', cursor: 'pointer', padding: '0.35rem 0.75rem', borderRadius: '0.375rem', fontSize: '0.75rem', fontWeight: 600 }}>
                    Устгах
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={3} style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
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
    <Suspense fallback={<div style={{ padding: '2rem' }}>Уншиж байна...</div>}>
      <SettingsContent />
    </Suspense>
  );
}

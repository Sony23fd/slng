"use client";

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../../stores/useAuthStore';
import { useRouter } from 'next/navigation';
import Pagination from '../../../components/Pagination';

export default function AdminPrices() {
  const [prices, setPrices] = useState<any[]>([]);
  const [formulas, setFormulas] = useState<any[]>([]);
  const { token, user } = useAuthStore();
  const router = useRouter();
  
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({ category: 'Цаас', item_name: '', unit_cost: '', formula_id: '' });

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const limit = 20;

  useEffect(() => {
    if (user && user.role !== 'ADMIN' && user.role !== 'FINANCE') {
      router.push('/admin'); // RBAC enforcement on frontend
      return;
    } else if (token) {
      fetchPrices();
      fetchFormulas();
    }
  }, [user, router, token, page, searchTerm]);

  const fetchFormulas = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/formulas`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setFormulas(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const fetchPrices = async () => {
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search: searchTerm
      });
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/prices?${query}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.data) {
          setPrices(data.data);
          setTotalPages(data.meta?.totalPages || 1);
          setTotalCount(data.meta?.total || 0);
        } else if (Array.isArray(data)) {
          setPrices(data);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdate = async (id: number, newCost: number, formula_id?: number | null) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/prices/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ unit_cost: newCost, formula_id })
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
      setFormData({ category: 'Цаас', item_name: '', unit_cost: '', formula_id: '' });
      fetchPrices();
      alert("Шинэ үнэ амжилттай нэмэгдлээ");
    } else {
      alert("Алдаа гарлаа");
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 className="title">💰 Мастер үнэ тохиргоо</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="🔍 Хайх..."
            value={searchTerm}
            onChange={e => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            style={{ padding: '0.45rem 0.75rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
          />
          <button className="btn btn-primary" onClick={() => setShowAdd(!showAdd)}>
            {showAdd ? 'Буцах' : '+ Шинэ үнэ нэмэх'}
          </button>
        </div>
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
            <div>
              <label className="label">Томьёо холбох (Сонголттой)</label>
              <select value={formData.formula_id} onChange={e => setFormData({...formData, formula_id: e.target.value})} className="input">
                <option value="">Сонгохгүй...</option>
                {formulas.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
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
              <th style={{ padding: '1rem' }}>Томьёо</th>
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
                  <select
                    defaultValue={p.formula_id || ''}
                    id={`formula-${p.id}`}
                    className="input"
                    style={{ width: '150px' }}
                  >
                    <option value="">Байхгүй</option>
                    {formulas.map((f: any) => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                </td>
                <td style={{ padding: '1rem' }}>
                  <button 
                    onClick={() => {
                      const el = document.getElementById(`price-${p.id}`) as HTMLInputElement;
                      const formEl = document.getElementById(`formula-${p.id}`) as HTMLSelectElement;
                      const fVal = formEl && formEl.value ? Number(formEl.value) : null;
                      if (el) handleUpdate(p.id, Number(el.value), fVal);
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
              <tr><td colSpan={5} style={{ padding: '1rem', textAlign: 'center' }}>Мастер үнэ олдсонгүй (Дээрх товчоор шинээр нэмнэ үү)</td></tr>
            )}
          </tbody>
        </table>
        
        <Pagination 
          currentPage={page} 
          totalPages={totalPages} 
          totalCount={totalCount} 
          onPageChange={(p) => setPage(p)} 
        />
      </div>
    </div>
  );
}

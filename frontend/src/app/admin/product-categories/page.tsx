"use client";

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../../stores/useAuthStore';
import { useRouter } from 'next/navigation';

interface ProductCategory {
  id: number;
  name: string;
  calc_mode: string;
  has_cover: boolean;
  has_inner: boolean;
  has_binding: boolean;
  has_pages: boolean;
  has_bookmark: boolean;
  waste_qty: number;
}

export default function ProductCategoriesPage() {
  const { user, token } = useAuthStore();
  const router = useRouter();

  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    calc_mode: 'BOOK_MODE',
    has_cover: true,
    has_inner: true,
    has_binding: true,
    has_pages: true,
    has_bookmark: false,
    waste_qty: 100
  });

  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      router.push('/admin');
    } else if (token) {
      fetchCategories();
    }
  }, [user, router, token]);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/product-categories`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setCategories(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/product-categories/${editingId}` : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/product-categories`;
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
        setFormData({ name: '', calc_mode: 'BOOK_MODE', has_cover: true, has_inner: true, has_binding: true, has_pages: true, has_bookmark: false, waste_qty: 100 });
        fetchCategories();
      } else {
        alert("Алдаа гарлаа. Нэр давхардсан байж болзошгүй.");
      }
    } catch (e) {
      console.error(e);
      alert("Алдаа гарлаа.");
    }
  };

  const handleEdit = (c: ProductCategory) => {
    setEditingId(c.id);
    setFormData({
      name: c.name,
      calc_mode: c.calc_mode,
      has_cover: c.has_cover,
      has_inner: c.has_inner,
      has_binding: c.has_binding,
      has_pages: c.has_pages,
      has_bookmark: c.has_bookmark,
      waste_qty: c.waste_qty
    });
    setShowAdd(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Устгах уу? Энэ нь хуучин захиалгуудад нөлөөлж болзошгүй!')) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/product-categories/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchCategories();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 className="title">📦 Бүтээгдэхүүний төрлүүд</h1>
        <button className="btn btn-primary" onClick={() => {
          setShowAdd(!showAdd);
          setEditingId(null);
          setFormData({ name: '', calc_mode: 'BOOK_MODE', has_cover: true, has_inner: true, has_binding: true, has_pages: true, has_bookmark: false, waste_qty: 100 });
        }}>
          {showAdd ? 'Буцах' : '+ Төрөл нэмэх'}
        </button>
      </div>

      {showAdd && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3>{editingId ? 'Төрөл засах' : 'Шинэ төрөл'}</h3>
          <form onSubmit={handleAdd} className="form-grid" style={{ marginTop: '1rem' }}>
            <div className="form-group">
              <label className="label">Нэр*</label>
              <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="input" placeholder="Жишээ: Флаер, Календарь..." />
            </div>
            <div className="form-group">
              <label className="label">Бодолтын горим (Calc Mode)*</label>
              <select required value={formData.calc_mode} onChange={e => setFormData({...formData, calc_mode: e.target.value})} className="input">
                <option value="BOOK_MODE">НОМ (Хавтасны хуваалт шалгана)</option>
                <option value="STANDARD_MODE">ЭНГИЙН (Тоо / Хуваалт)</option>
                <option value="PACKAGING_MODE">ХАЙРЦАГ (Дэлгээсээр)</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="label">Хадаасны хэмжээ (waste_qty)*</label>
              <input type="number" required value={formData.waste_qty} onChange={e => setFormData({...formData, waste_qty: Number(e.target.value)})} className="input" />
              <small style={{ color: '#64748b' }}>Хавтас эсвэл үндсэн хэвлэлд автоматаар нэмэгдэх хаягдал тоо.</small>
            </div>

            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '2rem', flexWrap: 'wrap', background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={formData.has_cover} onChange={e => setFormData({...formData, has_cover: e.target.checked})} />
                Хавтас сонгох уу? (Cover)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={formData.has_inner} onChange={e => setFormData({...formData, has_inner: e.target.checked})} />
                Дотор өнгө сонгох уу? (Inner)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={formData.has_binding} onChange={e => setFormData({...formData, has_binding: e.target.checked})} />
                Үдээс/Хавтасны төрөл сонгох уу?
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={formData.has_pages} onChange={e => setFormData({...formData, has_pages: e.target.checked})} />
                Хуудасны тоо оруулах уу?
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={formData.has_bookmark} onChange={e => setFormData({...formData, has_bookmark: e.target.checked})} />
                Хавчуургатай юу?
              </label>
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
              <th>Нэр</th>
              <th>Горим</th>
              <th>Хадаас</th>
              <th>Хавтастай?</th>
              <th>Дотор өнгө?</th>
              <th>Үдээстэй?</th>
              <th>Хуудастай?</th>
              <th style={{ width: '150px' }}>Үйлдэл</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(c => (
              <tr key={c.id}>
                <td style={{ fontWeight: 600 }}>{c.name}</td>
                <td>{c.calc_mode}</td>
                <td>{c.waste_qty}</td>
                <td>{c.has_cover ? '✅' : '❌'}</td>
                <td>{c.has_inner ? '✅' : '❌'}</td>
                <td>{c.has_binding ? '✅' : '❌'}</td>
                <td>{c.has_pages ? '✅' : '❌'}</td>
                <td>
                  <button className="btn btn-primary" style={{ padding: '0.25rem 0.75rem', marginRight: '0.5rem', background: '#3b82f6' }} onClick={() => handleEdit(c)}>Засах</button>
                  <button className="btn btn-primary" style={{ padding: '0.25rem 0.75rem', background: '#ef4444' }} onClick={() => handleDelete(c.id)}>Устгах</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

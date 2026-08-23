"use client";

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../../stores/useAuthStore';
import { useRouter } from 'next/navigation';
import Pagination from '../../../components/Pagination';

export default function AdminUsers() {
  const { user, token } = useAuthStore();
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({ name: '', full_name: '', role: 'SALES', password: '' });

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const limit = 20;

  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      router.push('/admin');
    } else if (token) {
      fetchUsers();
    }
  }, [user, router, token, page, searchTerm]);

  const fetchUsers = async () => {
    const query = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      search: searchTerm
    });

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/users?${query}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.data) {
        setUsers(data.data);
        setTotalPages(data.meta?.totalPages || 1);
        setTotalCount(data.meta?.total || 0);
      } else if (Array.isArray(data)) {
        setUsers(data);
      }
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(formData)
    });
    if (res.ok) {
      setShowAdd(false);
      setFormData({ name: '', full_name: '', role: 'SALES', password: '' });
      fetchUsers();
      alert("Амжилттай нэмэгдлээ");
    } else {
      const err = await res.json();
      alert(err.error || "Алдаа гарлаа");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Энэ хэрэглэгчийг устгах уу?')) return;
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/users/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      fetchUsers();
    } else {
      alert('Устгаж чадсангүй (Холбоотой өгөгдөл байж магадгүй)');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 className="title">👥 Хэрэглэгчид удирдах</h1>
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
            {showAdd ? 'Буцах' : '+ Шинэ хэрэглэгч'}
          </button>
        </div>
      </div>

      {showAdd && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3>Шинэ хэрэглэгч нэмэх</h3>
          <form onSubmit={handleAdd} style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
            <div>
              <label className="label">Нэвтрэх нэр (Латинаар)</label>
              <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="input" />
            </div>
            <div>
              <label className="label">Овог нэр</label>
              <input type="text" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} className="input" placeholder="Жишээ: Бат-Эрдэнэ" />
            </div>
            <div>
              <label className="label">Эрх</label>
              <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="input">
                <option value="ADMIN">Админ</option>
                <option value="FINANCE">Санхүү</option>
                <option value="SALES">Борлуулагч</option>
                <option value="PRODUCTION">Үйлдвэр</option>
              </select>
            </div>
            <div>
              <label className="label">Нууц үг</label>
              <input type="text" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="input" />
            </div>
            <button type="submit" className="btn btn-primary">Хадгалах</button>
          </form>
        </div>
      )}

      <div className="card">
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
              <th style={{ padding: '1rem' }}>Овог нэр</th>
              <th style={{ padding: '1rem' }}>Нэвтрэх нэр</th>
              <th style={{ padding: '1rem' }}>Эрх</th>
              <th style={{ padding: '1rem' }}>Огноо</th>
              <th style={{ padding: '1rem' }}>Үйлдэл</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '1rem', fontWeight: 600 }}>{u.full_name || '-'}</td>
                <td style={{ padding: '1rem', color: '#64748b' }}>{u.name}</td>
                <td style={{ padding: '1rem' }}>{u.role}</td>
                <td style={{ padding: '1rem' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                <td style={{ padding: '1rem' }}>
                  {u.id !== user?.id && (
                    <button onClick={() => handleDelete(u.id)} className="btn btn-outline" style={{ borderColor: 'var(--danger-color)', color: 'var(--danger-color)' }}>
                      Устгах
                    </button>
                  )}
                </td>
              </tr>
            ))}
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

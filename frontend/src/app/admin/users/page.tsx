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
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ name: '', full_name: '', role: 'SALES', phone: '', password: '' });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
    try {
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
          setTotalPages(1);
          setTotalCount(data.length);
        }
      }
    } catch (err) {
      console.error('Хэрэглэгчдийн жагсаалт авахад алдаа гарлаа:', err);
    }
  };

  const handleStartAdd = () => {
    setEditingId(null);
    setFormData({ name: '', full_name: '', role: 'SALES', phone: '', password: '' });
    setShowPassword(false);
    setStatusMessage(null);
    setShowAdd(true);
  };

  const handleStartEdit = (u: any) => {
    setEditingId(u.id);
    setFormData({
      name: u.name || '',
      full_name: u.full_name || '',
      role: u.role || 'SALES',
      phone: u.phone || '',
      password: '' // Нууц үг солихгүй бол хоосон байна
    });
    setShowPassword(false);
    setStatusMessage(null);
    setShowAdd(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setShowAdd(false);
    setEditingId(null);
    setFormData({ name: '', full_name: '', role: 'SALES', phone: '', password: '' });
    setStatusMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);
    setSubmitLoading(true);

    try {
      const url = editingId
        ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/users/${editingId}`
        : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/users`;

      const method = editingId ? 'PUT' : 'POST';

      const payload: any = {
        name: formData.name.trim(),
        full_name: formData.full_name.trim(),
        role: formData.role,
        phone: formData.phone.trim() || null
      };

      if (formData.password.trim() !== '') {
        payload.password = formData.password.trim();
      } else if (!editingId) {
        throw new Error('Шинэ хэрэглэгчид нууц үг заавал шаардлагатай.');
      }

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const resData = await res.json();

      if (!res.ok) {
        throw new Error(resData.error || (editingId ? 'Хэрэглэгчийн мэдээлэл шинэчлэхэд алдаа гарлаа' : 'Хэрэглэгч нэмэхэд алдаа гарлаа'));
      }

      setStatusMessage({
        type: 'success',
        text: editingId ? 'Хэрэглэгчийн мэдээллийг амжилттай шинэчиллээ!' : 'Шинэ хэрэглэгч амжилттай нэмэгдлээ!'
      });

      setShowAdd(false);
      setEditingId(null);
      setFormData({ name: '', full_name: '', role: 'SALES', phone: '', password: '' });
      fetchUsers();

      // Хэрэв админ өөрийн мэдээллээ зассан бол UI state-ийг шинэчлэх
      if (editingId && user && editingId === user.id) {
        useAuthStore.getState().updateUser({
          name: payload.name,
          full_name: payload.full_name,
          role: payload.role,
          phone: payload.phone
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Алдаа гарлаа'
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Энэ хэрэглэгчийг устгах уу? Энэ үйлдлийг буцаах боломжгүй.')) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchUsers();
      } else {
        const err = await res.json();
        alert(err.error || 'Устгаж чадсангүй (Холбоотой захиалга эсвэл өгөгдөл байж болзошгүй).');
      }
    } catch (err) {
      alert('Устгах хүсэлт илгээхэд алдаа гарлаа.');
    }
  };

  const renderRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span style={{ backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '0.2rem 0.55rem', borderRadius: '4px', fontSize: '0.775rem', fontWeight: 600 }}>
            🛡️ Админ
          </span>
        );
      case 'FINANCE':
        return (
          <span style={{ backgroundColor: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', padding: '0.2rem 0.55rem', borderRadius: '4px', fontSize: '0.775rem', fontWeight: 600 }}>
            💼 Санхүү
          </span>
        );
      case 'SALES':
        return (
          <span style={{ backgroundColor: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', padding: '0.2rem 0.55rem', borderRadius: '4px', fontSize: '0.775rem', fontWeight: 600 }}>
            🏷️ Борлуулагч
          </span>
        );
      case 'PRODUCTION':
        return (
          <span style={{ backgroundColor: '#fffbeb', color: '#d97706', border: '1px solid #fde68a', padding: '0.2rem 0.55rem', borderRadius: '4px', fontSize: '0.775rem', fontWeight: 600 }}>
            ⚙️ Үйлдвэр
          </span>
        );
      default:
        return (
          <span style={{ backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '0.2rem 0.55rem', borderRadius: '4px', fontSize: '0.775rem', fontWeight: 500 }}>
            {role}
          </span>
        );
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="title" style={{ margin: 0 }}>👥 Хэрэглэгчид удирдах</h1>
          <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.875rem' }}>
            Нийт {totalCount} хэрэглэгч бүртгэлтэй байна.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="🔍 Нэр, эрх, утсаар хайх..."
            value={searchTerm}
            onChange={e => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            style={{
              padding: '0.5rem 0.85rem',
              borderRadius: '0.5rem',
              border: '1px solid #cbd5e1',
              fontSize: '0.875rem',
              minWidth: '220px',
              outline: 'none',
              background: '#ffffff'
            }}
          />
          <button 
            className="btn btn-primary" 
            onClick={() => showAdd ? handleCancel() : handleStartAdd()}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
          >
            {showAdd ? 'Буцах' : '+ Шинэ хэрэглэгч'}
          </button>
        </div>
      </div>

      {statusMessage && (
        <div style={{
          padding: '0.75rem 1rem',
          borderRadius: '0.5rem',
          marginBottom: '1.25rem',
          fontSize: '0.875rem',
          fontWeight: 500,
          backgroundColor: statusMessage.type === 'success' ? '#f0fdf4' : '#fef2f2',
          border: `1px solid ${statusMessage.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
          color: statusMessage.type === 'success' ? '#166534' : '#991b1b',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>{statusMessage.text}</span>
          <button 
            type="button" 
            onClick={() => setStatusMessage(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold', color: 'inherit' }}
          >
            ✕
          </button>
        </div>
      )}

      {showAdd && (
        <div className="card" style={{ marginBottom: '2rem', border: '1px solid #3b82f6', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
            <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {editingId ? `✏️ Хэрэглэгчийн мэдээлэл засах (ID: ${editingId})` : '➕ Шинэ хэрэглэгч нэмэх'}
            </h3>
            <button 
              type="button" 
              onClick={handleCancel}
              style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.9rem' }}
            >
              ✕ Хаах
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
              <div>
                <label className="label" style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem', display: 'block' }}>
                  Нэвтрэх нэр (Латинаар) <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input 
                  type="text" 
                  required 
                  value={formData.name} 
                  onChange={e => setFormData({ ...formData, name: e.target.value })} 
                  className="input" 
                  placeholder="Жишээ: bat_erdene"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label className="label" style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem', display: 'block' }}>
                  Овог нэр
                </label>
                <input 
                  type="text" 
                  value={formData.full_name} 
                  onChange={e => setFormData({ ...formData, full_name: e.target.value })} 
                  className="input" 
                  placeholder="Жишээ: Бат-Эрдэнэ" 
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label className="label" style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem', display: 'block' }}>
                  Утасны дугаар
                </label>
                <input 
                  type="text" 
                  value={formData.phone} 
                  onChange={e => setFormData({ ...formData, phone: e.target.value })} 
                  className="input" 
                  placeholder="Жишээ: 99112233" 
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label className="label" style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem', display: 'block' }}>
                  Эрх (Role) <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select 
                  value={formData.role} 
                  onChange={e => setFormData({ ...formData, role: e.target.value })} 
                  className="input"
                  style={{ width: '100%', height: '40px' }}
                >
                  <option value="SALES">🏷️ Борлуулагч (Sales)</option>
                  <option value="FINANCE">💼 Санхүү (Finance)</option>
                  <option value="PRODUCTION">⚙️ Үйлдвэр (Production)</option>
                  <option value="ADMIN">🛡️ Админ (Admin)</option>
                </select>
              </div>

              <div>
                <label className="label" style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem', display: 'block' }}>
                  {editingId ? 'Шинэ нууц үг (Хоосон үлдээвэл солигдохгүй)' : 'Нууц үг *'}
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    required={!editingId}
                    value={formData.password} 
                    onChange={e => setFormData({ ...formData, password: e.target.value })} 
                    className="input" 
                    placeholder={editingId ? 'Нууц үг хэвээр үлдээх бол хоосон орхино' : '••••••••'}
                    style={{ width: '100%', paddingRight: '2.5rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '0.5rem',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0.25rem'
                    }}
                    title={showPassword ? 'Нууц үг нуух' : 'Нууц үг харах'}
                  >
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
              <button 
                type="button" 
                onClick={handleCancel} 
                className="btn" 
                style={{ backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1' }}
              >
                Цуцлах
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={submitLoading}
                style={{ minWidth: '120px' }}
              >
                {submitLoading ? 'Хадгалж байна...' : (editingId ? 'Шинэчлэх' : 'Хадгалах')}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)', backgroundColor: '#f8fafc' }}>
                <th style={{ padding: '0.85rem 1rem', fontSize: '0.825rem', color: '#475569' }}>Овог нэр</th>
                <th style={{ padding: '0.85rem 1rem', fontSize: '0.825rem', color: '#475569' }}>Нэвтрэх нэр</th>
                <th style={{ padding: '0.85rem 1rem', fontSize: '0.825rem', color: '#475569' }}>Утас</th>
                <th style={{ padding: '0.85rem 1rem', fontSize: '0.825rem', color: '#475569' }}>Эрх</th>
                <th style={{ padding: '0.85rem 1rem', fontSize: '0.825rem', color: '#475569' }}>Огноо</th>
                <th style={{ padding: '0.85rem 1rem', fontSize: '0.825rem', color: '#475569', textAlign: 'center' }}>Үйлдэл</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr 
                  key={u.id} 
                  style={{ 
                    borderBottom: '1px solid var(--border-color)',
                    backgroundColor: editingId === u.id ? '#f0f9ff' : 'transparent',
                    transition: 'background-color 0.2s ease'
                  }}
                >
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#1e293b' }}>
                    {u.full_name || '—'}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: '#475569', fontFamily: 'monospace', fontSize: '0.875rem' }}>
                    {u.name}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: '#64748b', fontSize: '0.875rem' }}>
                    {u.phone || '—'}
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    {renderRoleBadge(u.role)}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontSize: '0.825rem', color: '#64748b' }}>
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', gap: '0.5rem', alignItems: 'center' }}>
                      <button 
                        type="button"
                        onClick={() => handleStartEdit(u)} 
                        className="btn"
                        style={{
                          padding: '0.3rem 0.65rem',
                          fontSize: '0.8rem',
                          borderRadius: '0.375rem',
                          border: '1px solid #3b82f6',
                          color: '#2563eb',
                          backgroundColor: '#eff6ff',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                        title="Хэрэглэгчийн мэдээлэл засах"
                      >
                        ✏️ Засах
                      </button>

                      {u.id !== user?.id && (
                        <button 
                          type="button"
                          onClick={() => handleDelete(u.id)} 
                          className="btn"
                          style={{
                            padding: '0.3rem 0.65rem',
                            fontSize: '0.8rem',
                            borderRadius: '0.375rem',
                            border: '1px solid #ef4444',
                            color: '#dc2626',
                            backgroundColor: '#fef2f2',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                          title="Хэрэглэгч устгах"
                        >
                          🗑️ Устгах
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {users.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '2.5rem', textAlign: 'center', color: '#64748b' }}>
                    Хэрэглэгч олдсонгүй.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--border-color)', background: '#fafafa' }}>
          <Pagination 
            currentPage={page} 
            totalPages={totalPages} 
            totalCount={totalCount} 
            onPageChange={(p) => setPage(p)} 
          />
        </div>
      </div>
    </div>
  );
}

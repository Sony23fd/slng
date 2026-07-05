"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../stores/useAuthStore';

export default function LoginPage() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const login = useAuthStore(state => state.login);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Нэвтрэхэд алдаа гарлаа');
      }

      login(data.user, data.token);
      
      // Redirect based on role
      if (data.user.role === 'ADMIN' || data.user.role === 'FINANCE') {
        router.push('/admin');
      } else if (data.user.role === 'PRODUCTION') {
        router.push('/admin/production');
      } else {
        router.push('/sales');
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-color)', padding: '1.5rem' }}>
      <div className="card" style={{ width: '100%', maxWidth: '420px', padding: '2.5rem', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🖨️</div>
          <h1 className="title" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary-color)', margin: 0 }}>Selenge Press</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.35rem', marginBottom: 0 }}>Үйлдвэрлэлийн удирдлагын систем</p>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1.5rem', fontSize: '0.875rem', textAlign: 'center', fontWeight: 500 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group">
            <label style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.35rem', display: 'block' }}>Нэвтрэх нэр</label>
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="Хэрэглэгчийн нэр"
              required 
              disabled={loading}
              style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '0.375rem', border: '1px solid var(--border-color)' }}
            />
          </div>

          <div className="form-group">
            <label style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.35rem', display: 'block' }}>Нууц үг</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="••••••••"
              required 
              disabled={loading}
              style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '0.375rem', border: '1px solid var(--border-color)' }}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
            style={{ marginTop: '0.5rem', padding: '0.75rem', fontSize: '0.95rem', fontWeight: 600, width: '100%', justifyContent: 'center', display: 'flex', alignItems: 'center' }}
          >
            {loading ? 'Нэвтэрч байна...' : 'Системд нэвтрэх'}
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            © {new Date().getFullYear()} Сэлэнгэ Пресс ХХК. Бүх эрх хуулиар хамгаалагдсан.
          </span>
        </div>
      </div>
    </div>
  );
}


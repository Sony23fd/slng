"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../stores/useAuthStore';

export default function LoginPage() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [greeting, setGreeting] = useState('Өдрийн мэнд 🌤️');
  const router = useRouter();
  const login = useAuthStore(state => state.login);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setGreeting('Өглөөний мэнд ☀️');
    else if (hour >= 12 && hour < 18) setGreeting('Өдрийн мэнд 🌤️');
    else setGreeting('Оройн мэнд 🌙');

    // Сануулсан нэвтрэх мэдээллийг сэргээж бөглөх
    try {
      const isRemembered = localStorage.getItem('selenge_remember_me') === 'true';
      if (isRemembered) {
        setRememberMe(true);
        const savedName = localStorage.getItem('selenge_saved_name');
        const savedPass = localStorage.getItem('selenge_saved_pass');
        if (savedName) setName(savedName);
        if (savedPass) setPassword(savedPass);
      }
    } catch (e) {
      console.error('Хадгалсан нэвтрэх өгөгдөл уншихад алдаа гарлаа:', e);
    }
  }, []);

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

      // "Намайг санах" тохиргоог хадгалах эсвэл цэвэрлэх
      try {
        if (rememberMe) {
          localStorage.setItem('selenge_remember_me', 'true');
          localStorage.setItem('selenge_saved_name', name);
          localStorage.setItem('selenge_saved_pass', password);
        } else {
          localStorage.removeItem('selenge_remember_me');
          localStorage.removeItem('selenge_saved_name');
          localStorage.removeItem('selenge_saved_pass');
        }
      } catch (e) {
        console.error('Нэвтрэх өгөгдөл хадгалахад алдаа гарлаа:', e);
      }
      
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
    <>
      <div className="login-wrapper">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>

        <div className="glass-card">
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.7)', fontWeight: 500, marginBottom: '0.25rem' }}>
              {greeting}
            </h2>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, background: 'linear-gradient(to right, #fff, #cbd5e1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.5px' }}>
              Selenge Press
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginTop: '0.5rem', marginBottom: 0 }}>
              Үйлдвэрлэлийн удирдлагын систем
            </p>
          </div>

          {error && (
            <div style={{ background: 'rgba(220, 38, 38, 0.2)', border: '1px solid rgba(220, 38, 38, 0.4)', color: '#fca5a5', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1.5rem', fontSize: '0.875rem', textAlign: 'center', fontWeight: 500, backdropFilter: 'blur(4px)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} id="login-form" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label htmlFor="username" style={{ fontWeight: 500, fontSize: '0.875rem', marginBottom: '0.4rem', display: 'block', color: 'rgba(255,255,255,0.9)' }}>
                Нэвтрэх нэр
              </label>
              <input 
                id="username"
                name="username"
                type="text" 
                autoComplete="username"
                value={name} 
                onChange={e => setName(e.target.value)} 
                placeholder="Хэрэглэгчийн нэр"
                required 
                disabled={loading}
                className="input-glass"
              />
            </div>

            <div>
              <label htmlFor="password" style={{ fontWeight: 500, fontSize: '0.875rem', marginBottom: '0.4rem', display: 'block', color: 'rgba(255,255,255,0.9)' }}>
                Нууц үг
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input 
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"} 
                  autoComplete="current-password"
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  placeholder="••••••••"
                  required 
                  disabled={loading}
                  className="input-glass"
                  style={{ paddingRight: '2.75rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  title={showPassword ? "Нууц үг нуух" : "Нууц үг харах"}
                  aria-label={showPassword ? "Нууц үг нуух" : "Нууц үг харах"}
                  style={{
                    position: 'absolute',
                    right: '0.6rem',
                    background: 'none',
                    border: 'none',
                    padding: '0.4rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'rgba(255, 255, 255, 0.65)',
                    borderRadius: '0.375rem',
                    transition: 'color 0.2s, background 0.2s'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255, 255, 255, 0.65)'; e.currentTarget.style.background = 'none'; }}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '-0.1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', cursor: 'pointer', userSelect: 'none', fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.85)' }}>
                <input 
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{
                    width: '16px',
                    height: '16px',
                    accentColor: '#3b82f6',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    margin: 0
                  }}
                />
                <span>Намайг санах</span>
              </label>
            </div>

            <button 
              type="submit" 
              className="btn-glass" 
              disabled={loading}
              style={{ marginTop: '0.5rem' }}
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  <span>Уншиж байна...</span>
                </>
              ) : (
                'Системд нэвтрэх'
              )}
            </button>
          </form>

          <div style={{ marginTop: '2.5rem', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.25rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
              © {new Date().getFullYear()} Сэлэнгэ Пресс ХХК. Бүх эрх хуулиар хамгаалагдсан.
            </span>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .login-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(-45deg, #020617, #1e1b4b, #172554, #0f172a);
          background-size: 400% 400%;
          animation: gradientBG 15s ease infinite;
          padding: 1.5rem;
          position: relative;
          overflow: hidden;
          font-family: 'Inter', system-ui, sans-serif;
        }

        @keyframes gradientBG {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.5;
          animation: float 10s infinite ease-in-out alternate;
          z-index: 1;
        }
        .orb-1 {
          width: 50vw; max-width: 500px; height: 50vw; max-height: 500px;
          background: #3b82f6;
          top: -10%; left: -10%;
          animation-delay: 0s;
        }
        .orb-2 {
          width: 60vw; max-width: 600px; height: 60vw; max-height: 600px;
          background: #db2777;
          bottom: -20%; right: -10%;
          animation-delay: -5s;
        }
        .orb-3 {
          width: 40vw; max-width: 400px; height: 40vw; max-height: 400px;
          background: #8b5cf6;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          animation-delay: -2s;
        }

        @keyframes float {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(-30px, -50px) scale(1.1); }
        }

        .glass-card {
          width: 100%;
          max-width: 400px;
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 2.5rem;
          border-radius: 1.5rem;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1);
          position: relative;
          z-index: 10;
          color: white;
        }

        /* High specificity to override globals.css input styles */
        .login-wrapper .glass-card input.input-glass {
          width: 100% !important;
          padding: 0.8rem 1rem !important;
          background: rgba(15, 23, 42, 0.65) !important;
          backdrop-filter: blur(8px) !important;
          -webkit-backdrop-filter: blur(8px) !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
          border-radius: 0.75rem !important;
          color: #ffffff !important;
          font-size: 0.95rem !important;
          caret-color: #38bdf8 !important;
          transition: all 0.25s ease !important;
          box-sizing: border-box !important;
          min-height: 44px !important;
          outline: none !important;
        }
        .login-wrapper .glass-card input.input-glass::placeholder {
          color: rgba(255, 255, 255, 0.38) !important;
        }
        .login-wrapper .glass-card input.input-glass:focus {
          background: rgba(15, 23, 42, 0.85) !important;
          border-color: #38bdf8 !important;
          box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.25) !important;
        }
        .login-wrapper .glass-card input.input-glass:disabled {
          opacity: 0.5 !important;
          cursor: not-allowed !important;
        }

        /* Chrome / Edge / Safari Autofill Fix */
        .login-wrapper .glass-card input.input-glass:-webkit-autofill,
        .login-wrapper .glass-card input.input-glass:-webkit-autofill:hover,
        .login-wrapper .glass-card input.input-glass:-webkit-autofill:focus,
        .login-wrapper .glass-card input.input-glass:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 1000px #0f172a inset !important;
          -webkit-text-fill-color: #ffffff !important;
          caret-color: #ffffff !important;
          border-color: rgba(255, 255, 255, 0.3) !important;
          transition: background-color 5000s ease-in-out 0s !important;
        }

        .btn-glass {
          width: 100%;
          padding: 0.85rem 1rem;
          background: linear-gradient(135deg, #2563eb, #7c3aed);
          border: none;
          border-radius: 0.75rem;
          color: white;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s, background 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }
        .btn-glass:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px -5px rgba(99, 102, 241, 0.5);
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
        }
        .btn-glass:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .spinner {
          width: 18px;
          height: 18px;
          border: 3px solid rgba(255,255,255,0.3);
          border-radius: 50%;
          border-top-color: #fff;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}} />
    </>
  );
}

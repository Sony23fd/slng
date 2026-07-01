"use client";

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../../stores/useAuthStore';
import Image from 'next/image';

export default function ProfilePage() {
  const { token, user, login } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [phoneInput, setPhoneInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [savingPhone, setSavingPhone] = useState(false);

  useEffect(() => {
    if (token) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/auth/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          setProfile(data);
          setPhoneInput(data?.phone || '');
        })
        .catch(console.error);
    }
  }, [token]);

  const handleSavePhone = async () => {
    setSavingPhone(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ phone: phoneInput })
      });
      const updatedUser = await res.json();
      setProfile(updatedUser);
      login(updatedUser, token!);
      alert('Утасны дугаар шинэчлэгдлээ!');
    } catch (err) {
      alert('Алдаа гарлаа');
      console.error(err);
    } finally {
      setSavingPhone(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      // 1. Upload file
      const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const uploadData = await uploadRes.json();
      
      if (uploadData.url) {
        // 2. Update profile
        const updateRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/auth/profile`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ stamp_url: uploadData.url })
        });
        const updatedUser = await updateRes.json();
        setProfile(updatedUser);
        // Sync zustand store
        login(updatedUser, token!);
        alert('Тамга амжилттай солигдлоо!');
      }
    } catch (err) {
      alert('Алдаа гарлаа');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  if (!profile) return <div>Уншиж байна...</div>;

  return (
    <div style={{ maxWidth: '600px' }}>
      <h1 className="title">Хувийн тохиргоо</h1>
      
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label className="label">Хэрэглэгчийн нэр</label>
          <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '0.5rem' }}>{profile.name}</div>
        </div>
        <div>
          <label className="label">Эрх</label>
          <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '0.5rem' }}>{profile.role}</div>
        </div>

        <div>
          <label className="label">Утасны дугаар (Үнийн санал дээр хэвлэгдэнэ)</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input 
              type="text" 
              className="input" 
              value={phoneInput} 
              onChange={e => setPhoneInput(e.target.value)} 
              placeholder="Жишээ: 88992238"
            />
            <button 
              type="button" 
              className="btn btn-primary" 
              onClick={handleSavePhone}
              disabled={savingPhone}
            >
              {savingPhone ? 'Хадгалж байна...' : 'Хадгалах'}
            </button>
          </div>
        </div>
        
        <div>
          <label className="label">Гарын үсэг / Тамга (Үнийн санал дээр гарах)</label>
          {profile.stamp_url ? (
            <div style={{ marginBottom: '1rem', border: '1px solid var(--border-color)', padding: '1rem', borderRadius: '0.5rem', display: 'inline-block' }}>
              {/* Note: In Next.js, to load images from localhost, we need to configure next.config.js, or just use img tag for external backend */}
              <img src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}${profile.stamp_url}`} alt="Тамга" style={{ maxHeight: '100px', objectFit: 'contain' }} />
            </div>
          ) : (
            <div style={{ padding: '1rem', background: '#fffbeb', color: '#b45309', borderRadius: '0.5rem', marginBottom: '1rem' }}>Тамга оруулаагүй байна.</div>
          )}
          
          <div>
            <label className="btn btn-outline" style={{ cursor: 'pointer' }}>
              {uploading ? 'Хуулж байна...' : 'Зураг сонгох'}
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} disabled={uploading} />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

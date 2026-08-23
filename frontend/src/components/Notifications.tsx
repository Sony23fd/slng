"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '../stores/useAuthStore';

interface Notification {
  id: number;
  title: string;
  message: string;
  is_read: boolean;
  createdAt: string;
}

export default function Notifications() {
  const { token } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = () => {
    if (!token) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/notifications`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setNotifications(data);
        }
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Polling every 1 minute
    return () => clearInterval(interval);
  }, [token]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleMarkAsRead = async (id: number) => {
    if (!token) return;
    await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/notifications/${id}/read`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const handleMarkAllAsRead = async () => {
    if (!token) return;
    await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/notifications/read-all`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <button 
        className="btn btn-outline" 
        onClick={() => setIsOpen(!isOpen)}
        style={{ position: 'relative', padding: '0.5rem', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        🔔
        {unreadCount > 0 && (
          <span style={{ 
            position: 'absolute', top: -5, right: -5, 
            background: 'red', color: 'white', 
            borderRadius: '50%', padding: '2px 6px', 
            fontSize: '12px', fontWeight: 'bold' 
          }}>
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute', top: '120%', right: 0,
          width: '350px', background: 'var(--card-bg)',
          border: '1px solid var(--border-color)', borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 1000,
          maxHeight: '400px', overflowY: 'auto'
        }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1rem' }}>Мэдэгдлүүд</h3>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllAsRead} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontSize: '0.875rem' }}>
                Бүгдийг уншсан
              </button>
            )}
          </div>
          <div style={{ padding: '0.5rem' }}>
            {notifications.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '1rem' }}>Мэдэгдэл алга</p>
            ) : (
              notifications.map(n => (
                <div 
                  key={n.id} 
                  onClick={() => handleMarkAsRead(n.id)}
                  style={{
                    padding: '0.75rem', 
                    borderRadius: '6px',
                    marginBottom: '0.5rem',
                    background: n.is_read ? 'transparent' : 'rgba(16, 185, 129, 0.1)',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--text-color)' }}>{n.title}</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{n.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

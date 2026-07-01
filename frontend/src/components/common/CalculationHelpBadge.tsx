"use client";

import React, { useState, useRef, useEffect } from 'react';

interface CalculationHelpBadgeProps {
  title: string;
  formula?: string;
  liveCalculation?: string;
  details?: string[];
  isOverridden?: boolean;
  onResetOverride?: () => void;
}

export default function CalculationHelpBadge({
  title,
  formula,
  liveCalculation,
  details = [],
  isOverridden = false,
  onResetOverride
}: CalculationHelpBadgeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} style={{ display: 'inline-flex', alignItems: 'center', position: 'relative', marginLeft: '6px', verticalAlign: 'middle' }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        style={{
          background: isOverridden ? '#fef08a' : '#e2e8f0',
          color: isOverridden ? '#854d0e' : '#475569',
          border: isOverridden ? '1px solid #eab308' : '1px solid #cbd5e1',
          borderRadius: '50%',
          width: '20px',
          height: '20px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '11px',
          fontWeight: 800,
          cursor: 'pointer',
          padding: 0,
          transition: 'all 0.2s ease',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
        }}
        title={isOverridden ? 'Гараар өөрчилсөн тооцоолол' : 'Тооцооллын тайлбар'}
      >
        {isOverridden ? '⚠️' : '❓'}
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginBottom: '8px',
            width: '280px',
            background: 'var(--surface-color, #ffffff)',
            border: '1px solid var(--border-color, #cbd5e1)',
            borderRadius: '0.75rem',
            padding: '1rem',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            zIndex: 99999,
            color: 'var(--text-primary, #1e293b)',
            fontSize: '0.825rem',
            lineHeight: '1.4',
            textAlign: 'left'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color, #e2e8f0)', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
            <h5 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary-color, #2563eb)' }}>
              {title}
            </h5>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1rem', lineHeight: 1, padding: 0 }}
            >
              ×
            </button>
          </div>

          {isOverridden && (
            <div style={{ background: '#fef9c3', border: '1px solid #fde047', borderRadius: '0.5rem', padding: '0.5rem 0.75rem', marginBottom: '0.75rem', color: '#854d0e' }}>
              <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>⚠️ Гараар өөрчилсөн байна</div>
              <div style={{ fontSize: '0.75rem', marginBottom: onResetOverride ? '0.5rem' : 0 }}>
                Автомат бодолтоос зөрүүтэй гараар бичсэн утга.
              </div>
              {onResetOverride && (
                <button
                  type="button"
                  onClick={() => {
                    onResetOverride();
                    setIsOpen(false);
                  }}
                  style={{
                    background: '#ca8a04',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '0.375rem',
                    padding: '0.25rem 0.5rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  🔄 Стандарт бодолт сэргээх
                </button>
              )}
            </div>
          )}

          {formula && (
            <div style={{ marginBottom: '0.75rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                Томьёоны дүрэм:
              </div>
              <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', padding: '0.4rem 0.6rem', borderRadius: '0.375rem', fontFamily: 'monospace', fontWeight: 600, color: '#0f172a' }}>
                {formula}
              </div>
            </div>
          )}

          {liveCalculation && (
            <div style={{ marginBottom: details.length > 0 ? '0.75rem' : 0 }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                Одоогийн бодолт:
              </div>
              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '0.4rem 0.6rem', borderRadius: '0.375rem', fontWeight: 700, color: '#1d4ed8' }}>
                {liveCalculation}
              </div>
            </div>
          )}

          {details.length > 0 && (
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                Тайлбар:
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#475569' }}>
                {details.map((item, idx) => (
                  <li key={idx} style={{ marginBottom: '0.2rem' }}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

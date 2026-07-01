"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

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
  const [isPinned, setIsPinned] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number }>({ top: -9999, left: -9999 });

  const buttonRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const clearTimeouts = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
  };

  const updatePosition = useCallback(() => {
    if (!buttonRef.current || typeof window === 'undefined') return;

    const rect = buttonRef.current.getBoundingClientRect();
    const tooltipWidth = 280;
    const halfWidth = tooltipWidth / 2;

    let left = rect.left + rect.width / 2;
    if (left - halfWidth < 12) {
      left = halfWidth + 12;
    } else if (left + halfWidth > window.innerWidth - 12) {
      left = window.innerWidth - halfWidth - 12;
    }

    const popupHeight = popupRef.current?.offsetHeight || 310;
    const spaceAbove = rect.top;
    const spaceBelow = window.innerHeight - rect.bottom;

    let top: number;
    if (spaceBelow >= popupHeight + 12 || spaceBelow >= spaceAbove) {
      top = rect.bottom + 8;
      if (top + popupHeight > window.innerHeight - 12) {
        top = Math.max(12, window.innerHeight - popupHeight - 12);
      }
    } else {
      top = rect.top - popupHeight - 8;
      if (top < 12) {
        top = 12;
      }
    }

    setCoords({ top, left });
  }, []);

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      requestAnimationFrame(() => {
        setIsAnimating(true);
        updatePosition();
      });
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    } else {
      setIsAnimating(false);
    }
  }, [isOpen, updatePosition]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setIsPinned(false);
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        buttonRef.current && !buttonRef.current.contains(event.target as Node) &&
        popupRef.current && !popupRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setIsPinned(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleMouseEnter = () => {
    clearTimeouts();
    if (!isOpen) {
      hoverTimeoutRef.current = setTimeout(() => {
        setIsOpen(true);
      }, 100);
    }
  };

  const handleMouseLeave = () => {
    clearTimeouts();
    if (!isPinned) {
      leaveTimeoutRef.current = setTimeout(() => {
        setIsOpen(false);
      }, 200);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearTimeouts();
    if (isPinned) {
      setIsPinned(false);
      setIsOpen(false);
    } else {
      setIsPinned(true);
      setIsOpen(true);
    }
  };

  const tooltipContent = isOpen && mounted ? createPortal(
    <div
      ref={popupRef}
      onMouseEnter={() => {
        clearTimeouts();
      }}
      onMouseLeave={() => {
        if (!isPinned) {
          handleMouseLeave();
        }
      }}
      style={{
        position: 'fixed',
        top: `${coords.top}px`,
        left: `${coords.left}px`,
        transform: `translateX(-50%) scale(${isAnimating ? 1 : 0.95})`,
        opacity: isAnimating ? 1 : 0,
        transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
        width: '280px',
        maxHeight: 'calc(100vh - 24px)',
        overflowY: 'auto',
        background: 'var(--surface-color, #ffffff)',
        border: isPinned ? '2px solid #3b82f6' : '1px solid var(--border-color, #cbd5e1)',
        borderRadius: '0.75rem',
        padding: '1rem',
        boxShadow: isPinned
          ? '0 20px 35px -5px rgba(59, 130, 246, 0.25), 0 10px 15px -6px rgba(0, 0, 0, 0.15)'
          : '0 15px 35px -5px rgba(0, 0, 0, 0.3), 0 8px 15px -6px rgba(0, 0, 0, 0.2)',
        zIndex: 9999999,
        color: 'var(--text-primary, #1e293b)',
        fontSize: '0.825rem',
        lineHeight: '1.4',
        textAlign: 'left'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color, #e2e8f0)', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <h5 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary-color, #2563eb)' }}>
            {title}
          </h5>
          {isPinned && (
            <span style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: '0.25rem', padding: '0.1rem 0.35rem', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.02em' }}>
              📌 ТҮГЖИГДСЭН
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => {
            setIsOpen(false);
            setIsPinned(false);
          }}
          style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.1rem', lineHeight: 1, padding: '0 0.2rem' }}
          title="Хаах (ESC)"
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
    </div>,
    document.body
  ) : null;

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', position: 'relative', marginLeft: '6px', verticalAlign: 'middle' }}>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          background: isPinned ? '#eff6ff' : (isOverridden ? '#fef08a' : '#e2e8f0'),
          color: isPinned ? '#2563eb' : (isOverridden ? '#854d0e' : '#475569'),
          border: isPinned ? '2px solid #3b82f6' : (isOverridden ? '1px solid #eab308' : '1px solid #cbd5e1'),
          borderRadius: '50%',
          width: isPinned ? '22px' : '20px',
          height: isPinned ? '22px' : '20px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '11px',
          fontWeight: 800,
          cursor: 'pointer',
          padding: 0,
          transition: 'all 0.2s ease',
          boxShadow: isPinned ? '0 0 0 2px rgba(59, 130, 246, 0.3)' : '0 1px 2px rgba(0,0,0,0.05)'
        }}
        title={isPinned ? 'Түгжигдсэн (Товшиж хаах)' : (isOverridden ? 'Гараар өөрчилсөн тооцоолол' : 'Тооцооллын тайлбар (Товшиж түгжих)')}
      >
        {isOverridden ? '⚠️' : '❓'}
      </button>

      {tooltipContent}
    </div>
  );
}

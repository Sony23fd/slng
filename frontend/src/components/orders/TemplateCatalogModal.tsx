"use client";

import React, { useState, useMemo, useEffect } from 'react';

interface TemplateCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: any[];
  onSelectTemplate: (template: any) => void;
}

const CATEGORY_TABS = [
  { key: 'ALL', label: 'Бүгд' },
  { key: 'Ном', label: '📚 Зөөлөн ном & Сэтгүүл' },
  { key: 'Хатуу хавтас', label: '📖 Хатуу хавтас' },
  { key: 'Тор', label: '🛍️ Цаасан тор' },
  { key: 'Брошур', label: '📄 Брошур & Танилцуулга' },
  { key: 'Календарь', label: '🗓️ Календарь' },
  { key: 'Бусад', label: '🏷️ Нэрийн хуудас & Бусад' }
];

export default function TemplateCatalogModal({
  isOpen,
  onClose,
  templates,
  onSelectTemplate
}: TemplateCatalogModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  const filteredTemplates = useMemo(() => {
    return (templates || []).filter(t => {
      const name = (t.template_name || '').toLowerCase();
      const cat = (t.category || '').toLowerCase();
      const binding = (t.binding_type || '').toLowerCase();
      const notes = (t.notes || '').toLowerCase();
      const size = (t.size || '').toLowerCase();
      const search = searchTerm.toLowerCase().trim();

      // Tab filter
      if (activeTab !== 'ALL') {
        if (activeTab === 'Хатуу хавтас') {
          const isHard = binding.includes('хатуу') || name.includes('хатуу') || binding.includes('супер') || name.includes('супер');
          if (!isHard) return false;
        } else if (activeTab === 'Ном') {
          const isHard = binding.includes('хатуу') || name.includes('хатуу') || binding.includes('супер') || name.includes('супер');
          const isBook = (cat.includes('ном') || cat.includes('сэтгүүл') || name.includes('ном') || name.includes('сэтгүүл')) && !isHard;
          if (!isBook) return false;
        } else if (activeTab === 'Тор') {
          if (!cat.includes('тор') && !name.includes('тор')) return false;
        } else if (activeTab === 'Брошур') {
          if (!cat.includes('брошур') && !name.includes('брошур') && !name.includes('флаер')) return false;
        } else if (activeTab === 'Календарь') {
          if (!cat.includes('календарь') && !name.includes('календарь')) return false;
        } else if (activeTab === 'Бусад') {
          const isMain = ['ном', 'сэтгүүл', 'тор', 'брошур', 'календарь'].some(k => cat.includes(k) || name.includes(k));
          if (isMain) return false;
        }
      }

      // Search term filter
      if (search) {
        const matchesName = name.includes(search);
        const matchesCat = cat.includes(search);
        const matchesBinding = binding.includes(search);
        const matchesNotes = notes.includes(search);
        const matchesSize = size.includes(search);
        return matchesName || matchesCat || matchesBinding || matchesNotes || matchesSize;
      }

      return true;
    });
  }, [templates, activeTab, searchTerm]);

  if (!isOpen) return null;

  const getTemplateIcon = (t: any) => {
    const name = (t.template_name || '').toLowerCase();
    const binding = (t.binding_type || '').toLowerCase();
    if (name.includes('супер')) return '🧥';
    if (binding.includes('хатуу') || name.includes('хатуу')) return '📖';
    if (name.includes('тор')) return '🛍️';
    if (name.includes('календарь')) return '🗓️';
    if (name.includes('брошур')) return '📄';
    if (name.includes('сэтгүүл')) return '📰';
    if (name.includes('флаер')) return '📑';
    if (name.includes('нэрийн')) return '🏷️';
    return '📚';
  };

  const getEstimatedPlates = (t: any) => {
    const name = t.template_name || '';
    if (name.includes('Зөөлөн хавтас') || name.includes('А5 (Хатуу') || name.includes('В5 (Хатуу') || name.includes('А5 (Супер') || name.includes('В5 (Супер')) {
      return '24 хавтан';
    }
    if (name.includes('А4 (Хатуу') || name.includes('А4 (Хөөсөн') || name.includes('А4 (Супер')) {
      return '44 хавтан';
    }
    if (name.includes('Тор')) return '4 хавтан';
    if (name.includes('Брошур')) return '8 хавтан';
    if (name.includes('Ширээний Календарь')) return '12 хавтан';
    if (name.includes('Ханын Календарь')) return '28 хавтан';
    if (name.includes('Сэтгүүл')) return '36 хавтан';
    if (name.includes('Флаер')) return '4 хавтан';
    return null;
  };

  return (
    <div className="template-modal-backdrop" onClick={onClose}>
      <div 
        className="template-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="template-modal-header">
          <div className="template-modal-title-wrap">
            <div className="template-modal-badge-icon">⚡</div>
            <div>
              <h2 className="template-modal-title">Бэлэн бүтээгдэхүүний загварын каталог</h2>
              <p className="template-modal-subtitle">
                Загвар сонгоход цаас, CTP хавтан, хэвлэлт, нугалаа, наалт, бүрэлт болон бүх технологийн ажиллагаанууд 100% автоматаар тооцоологдоно.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="template-modal-close-btn"
            onClick={onClose}
            aria-label="Хаах"
          >
            ✕
          </button>
        </div>

        {/* Filters and Search Bar */}
        <div className="template-modal-toolbar">
          <div className="template-modal-search">
            <svg className="template-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              className="template-search-input"
              placeholder="Загварын нэр, хэмжээ, материалаар хайх..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
            {searchTerm && (
              <button 
                type="button" 
                className="template-search-clear"
                onClick={() => setSearchTerm('')}
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="template-tabs-row">
            {CATEGORY_TABS.map(tab => (
              <button
                key={tab.key}
                type="button"
                className={`template-tab-btn ${activeTab === tab.key ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
                {tab.key === 'ALL' && <span className="tab-count-pill">{templates.length}</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area: Grid of Cards */}
        <div className="template-modal-body">
          {filteredTemplates.length === 0 ? (
            <div className="template-empty-state">
              <span className="empty-icon">🔍</span>
              <p className="empty-title">Илэрц олдсонгүй</p>
              <p className="empty-desc">Та хайлтын үгээ өөрчлөх эсвэл өөр ангилал сонгоно уу.</p>
            </div>
          ) : (
            <div className="template-grid">
              {filteredTemplates.map(t => {
                const od = typeof t.order_data === 'string' ? JSON.parse(t.order_data) : (t.order_data || {});
                const materials = od.materials || [];
                const operations = od.operations || [];
                const estPlates = getEstimatedPlates(t);
                const coverColor = t.cover_color || od.specifications?.cover_color;
                const innerColor = t.inner_color || od.specifications?.inner_color;
                const totalPages = t.total_pages || od.specifications?.total_pages;
                const totalQty = t.total_qty || (materials[0]?.base_qty) || 1000;

                return (
                  <div key={t.id || t.template_name} className="template-card">
                    <div className="template-card-header">
                      <div className="template-card-title-row">
                        <span className="template-card-icon">{getTemplateIcon(t)}</span>
                        <div className="template-card-name">{t.template_name}</div>
                      </div>
                      <div className="template-card-badges">
                        <span className="cat-badge">{t.category || 'Хэвлэл'}</span>
                        {t.binding_type && (
                          <span className="binding-badge">{t.binding_type}</span>
                        )}
                      </div>
                    </div>

                    {/* Specs Pills */}
                    <div className="template-specs-pills">
                      <span className="spec-pill">📏 <strong>{t.size || 'A5'}</strong></span>
                      <span className="spec-pill">🔢 <strong>{totalQty.toLocaleString()}ш</strong></span>
                      {totalPages > 0 && (
                        <span className="spec-pill">📄 <strong>{totalPages} нүүр</strong></span>
                      )}
                      {(coverColor || innerColor) && (
                        <span className="spec-pill color-pill">
                          🎨 <strong>{coverColor || '-'}{innerColor ? ` / ${innerColor}` : ''}</strong>
                        </span>
                      )}
                      {estPlates && (
                        <span className="spec-pill plate-pill">
                          🎯 <strong>{estPlates}</strong>
                        </span>
                      )}
                    </div>

                    {/* Materials preview */}
                    <div className="template-preview-section">
                      <div className="preview-label">
                        📦 Материалууд ({materials.length}):
                      </div>
                      <div className="preview-pills-wrap">
                        {materials.map((m: any, idx: number) => (
                          <span key={idx} className="mat-tag" title={`${m.material_name} (${m.notes || ''})`}>
                            {m.is_cover ? '📕 ' : '📄 '}
                            {m.material_name}
                            {m.notes ? ` (${m.notes})` : ''}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Operations preview */}
                    <div className="template-preview-section">
                      <div className="preview-label">
                        ⚙️ Ажиллагаанууд ({operations.length}):
                      </div>
                      <div className="preview-pills-wrap">
                        {operations.map((o: any, idx: number) => (
                          <span key={idx} className="op-tag" title={`${o.operation_name}: ${o.notes || ''}`}>
                            ⚙️ {o.operation_name}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="template-card-footer">
                      <button
                        type="button"
                        className="template-select-btn"
                        onClick={() => {
                          onSelectTemplate(t);
                          onClose();
                        }}
                      >
                        Энэ загварыг сонгох →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="template-modal-footer">
          <div className="modal-footer-hint">
            💡 Загвар сонгоход материалууд хамгийн сүүлийн үнийн сангаас шинэчлэгдэн автоматаар холбогдоно.
          </div>
          <button
            type="button"
            className="template-modal-cancel-btn"
            onClick={onClose}
          >
            Хаах
          </button>
        </div>
      </div>
    </div>
  );
}

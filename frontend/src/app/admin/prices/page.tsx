"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAuthStore } from '../../../stores/useAuthStore';
import { useRouter } from 'next/navigation';

interface PriceItem {
  id: number;
  category: string;
  item_name: string;
  unit_cost: number;
  formula_id?: number | null;
  formula?: { id: number; name: string } | null;
  is_pricing?: boolean;
  production_stage?: string | null;
  updatedAt?: string;
}

import { PRODUCTION_STAGES } from '../../../utils/productionStages';
export { PRODUCTION_STAGES };

interface PriceLog {
  id: number;
  masterPriceId: number;
  changed_by: number;
  old_cost: number;
  new_cost: number;
  createdAt: string;
  user?: { id: number; name: string; role: string };
  masterprice?: { id: number; item_name: string; category: string };
}

export default function AdminPrices() {
  const { token, user } = useAuthStore();
  const router = useRouter();

  const [prices, setPrices] = useState<PriceItem[]>([]);
  const [formulas, setFormulas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Category & Filter
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activeStage, setActiveStage] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Bulk Selection
  const [selectedItemIds, setSelectedItemIds] = useState<number[]>([]);

  // Dirty state tracking (id -> new unit cost)
  const [editedPrices, setEditedPrices] = useState<Record<number, number>>({});
  const [editedFormulas, setEditedFormulas] = useState<Record<number, number | null>>({});

  // Toast Notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMarkupModal, setShowMarkupModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showImportPreviewModal, setShowImportPreviewModal] = useState(false);
  const [historyLogs, setHistoryLogs] = useState<PriceLog[]>([]);
  const [historyTargetItem, setHistoryTargetItem] = useState<PriceItem | null>(null);

  // Form for New Price
  const [newFormData, setNewFormData] = useState({
    category: 'Цаас',
    item_name: '',
    unit_cost: '',
    formula_id: '',
    is_pricing: true,
    production_stage: 'POST_PRESS'
  });

  // Batch Markup State
  const [markupType, setMarkupType] = useState<'percent_add' | 'percent_sub' | 'fixed_add' | 'fixed_sub'>('percent_add');
  const [markupValue, setMarkupValue] = useState<string>('5');
  const [markupTargetCategory, setMarkupTargetCategory] = useState<string>('All');

  // CSV Import State
  const [importRows, setImportRows] = useState<Array<{ category: string; item_name: string; unit_cost: number; old_cost?: number }>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user && user.role !== 'ADMIN' && user.role !== 'FINANCE') {
      router.push('/admin');
      return;
    } else if (token) {
      fetchAllPrices();
      fetchFormulas();
    }
  }, [user, router, token]);

  const fetchFormulas = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/formulas`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setFormulas(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAllPrices = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/prices`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.data || []);
        setPrices(list);
        setEditedPrices({});
        setEditedFormulas({});
      }
    } catch (e) {
      console.error(e);
      showToast('Үнийн жагсаалт татахад алдаа гарлаа', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      All: prices.length,
      Цаас: 0,
      Материал: 0,
      Ажиллагаа_Үнэтэй: 0,
      Ажиллагаа_Үнэгүй: 0
    };
    prices.forEach(p => {
      const cat = p.category || 'Бусад';
      if (cat === 'Цаас') counts['Цаас'] = (counts['Цаас'] || 0) + 1;
      else if (cat === 'Материал') counts['Материал'] = (counts['Материал'] || 0) + 1;
      else if (cat === 'Ажиллагаа') {
        if (p.is_pricing !== false) {
          counts['Ажиллагаа_Үнэтэй'] = (counts['Ажиллагаа_Үнэтэй'] || 0) + 1;
        } else {
          counts['Ажиллагаа_Үнэгүй'] = (counts['Ажиллагаа_Үнэгүй'] || 0) + 1;
        }
      } else {
        counts[cat] = (counts[cat] || 0) + 1;
      }
    });
    return counts;
  }, [prices]);

  // Filtered prices
  const filteredPrices = useMemo(() => {
    return prices.filter(p => {
      let matchCategory = true;
      if (activeCategory === 'All') matchCategory = true;
      else if (activeCategory === 'Цаас') matchCategory = p.category === 'Цаас';
      else if (activeCategory === 'Материал') matchCategory = p.category === 'Материал';
      else if (activeCategory === 'Ажиллагаа_Үнэтэй') matchCategory = p.category === 'Ажиллагаа' && p.is_pricing !== false;
      else if (activeCategory === 'Ажиллагаа_Үнэгүй') matchCategory = p.category === 'Ажиллагаа' && p.is_pricing === false;
      else matchCategory = p.category === activeCategory;

      let matchStage = true;
      if (activeStage !== 'All') {
        matchStage = (p.production_stage || 'POST_PRESS') === activeStage;
      }

      const matchSearch = !searchTerm || 
        p.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase());

      return matchCategory && matchStage && matchSearch;
    });
  }, [prices, activeCategory, activeStage, searchTerm]);

  // Check how many items have unsaved changes
  const modifiedItems = useMemo(() => {
    return prices.filter(p => {
      const isCostChanged = editedPrices[p.id] !== undefined && editedPrices[p.id] !== p.unit_cost;
      const isFormulaChanged = editedFormulas[p.id] !== undefined && editedFormulas[p.id] !== (p.formula_id || null);
      return isCostChanged || isFormulaChanged;
    });
  }, [prices, editedPrices, editedFormulas]);

  const handlePriceChange = (id: number, val: string) => {
    const num = val === '' ? 0 : Number(val);
    setEditedPrices(prev => ({ ...prev, [id]: num }));
  };

  const handleFormulaChange = (id: number, val: string) => {
    const formulaId = val === '' ? null : Number(val);
    setEditedFormulas(prev => ({ ...prev, [id]: formulaId }));
  };

  // Dynamic Toggle for Pricing Status (Billable <-> Non-billable)
  const handleTogglePricing = async (p: PriceItem) => {
    const nextVal = p.is_pricing === false;
    setPrices(prev => prev.map(item => item.id === p.id ? { ...item, is_pricing: nextVal } : item));
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/prices/${p.id}/toggle-pricing`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showToast(`"${p.item_name}" -> ${nextVal ? '💵 Үнэ боддог боллоо' : '⚙️ Технологийн заавар (0₮) боллоо'}`, 'success');
      } else {
        setPrices(prev => prev.map(item => item.id === p.id ? { ...item, is_pricing: !nextVal } : item));
        showToast('Төлөв солиход алдаа гарлаа', 'error');
      }
    } catch (e) {
      setPrices(prev => prev.map(item => item.id === p.id ? { ...item, is_pricing: !nextVal } : item));
      showToast('Сүлжээний алдаа гарлаа', 'error');
    }
  };

  // Dynamic Stage Change
  const handleStageChange = async (p: PriceItem, newStage: string) => {
    setPrices(prev => prev.map(item => item.id === p.id ? { ...item, production_stage: newStage } : item));
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/prices/${p.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ production_stage: newStage })
      });
      if (res.ok) {
        const stageObj = PRODUCTION_STAGES.find(s => s.id === newStage);
        showToast(`"${p.item_name}" -> ${stageObj?.label || newStage} дамжлагад шилжлээ`, 'success');
      } else {
        showToast('Дамжлага хадгалахад алдаа гарлаа', 'error');
      }
    } catch (e) {
      showToast('Сүлжээний алдаа гарлаа', 'error');
    }
  };

  // Bulk set pricing status
  const handleBulkSetPricing = async (isPricing: boolean) => {
    if (selectedItemIds.length === 0) return;
    const itemsToUpdate = selectedItemIds.map(id => ({ id, is_pricing: isPricing }));
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/prices/bulk`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ items: itemsToUpdate })
      });
      if (res.ok) {
        showToast(`Сонгосон ${selectedItemIds.length} ажиллагаа ${isPricing ? 'Үнэ боддог' : 'Технологийн заавар'} боллоо!`, 'success');
        setSelectedItemIds([]);
        fetchAllPrices();
      } else {
        showToast('Олноор өөрчлөхөд алдаа гарлаа', 'error');
      }
    } catch (e) {
      showToast('Сүлжээний алдаа гарлаа', 'error');
    }
  };

  // Bulk set production stage
  const handleBulkSetStage = async (newStage: string) => {
    if (selectedItemIds.length === 0) return;
    const itemsToUpdate = selectedItemIds.map(id => ({ id, production_stage: newStage }));
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/prices/bulk`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ items: itemsToUpdate })
      });
      if (res.ok) {
        const stageObj = PRODUCTION_STAGES.find(s => s.id === newStage);
        showToast(`Сонгосон ${selectedItemIds.length} ажиллагаа ${stageObj?.label || newStage} дамжлага руу шилжлээ!`, 'success');
        setSelectedItemIds([]);
        fetchAllPrices();
      } else {
        showToast('Дамжлага олноор өөрчлөхөд алдаа гарлаа', 'error');
      }
    } catch (e) {
      showToast('Сүлжээний алдаа гарлаа', 'error');
    }
  };

  // Save single item
  const handleSaveSingle = async (p: PriceItem) => {
    const newCost = editedPrices[p.id] !== undefined ? editedPrices[p.id] : p.unit_cost;
    const newFormulaId = editedFormulas[p.id] !== undefined ? editedFormulas[p.id] : p.formula_id;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/prices/${p.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ unit_cost: newCost, formula_id: newFormulaId })
      });
      if (res.ok) {
        showToast(`"${p.item_name}" үнэ хадгалагдлаа`, 'success');
        setPrices(prev => prev.map(item => item.id === p.id ? { ...item, unit_cost: newCost, formula_id: newFormulaId } : item));
        setEditedPrices(prev => {
          const next = { ...prev };
          delete next[p.id];
          return next;
        });
        setEditedFormulas(prev => {
          const next = { ...prev };
          delete next[p.id];
          return next;
        });
      } else {
        showToast('Хадгалахад алдаа гарлаа', 'error');
      }
    } catch (e) {
      console.error(e);
      showToast('Сүлжээний алдаа гарлаа', 'error');
    }
  };

  // Bulk Save all modified items
  const handleSaveAll = async () => {
    if (modifiedItems.length === 0) return;

    setSaving(true);
    try {
      const payload = modifiedItems.map(p => ({
        id: p.id,
        unit_cost: editedPrices[p.id] !== undefined ? editedPrices[p.id] : p.unit_cost,
        formula_id: editedFormulas[p.id] !== undefined ? editedFormulas[p.id] : p.formula_id
      }));

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/prices/bulk`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ items: payload })
      });

      if (res.ok) {
        showToast(`Нийт ${modifiedItems.length} үнэ амжилттай шинэчлэгдлээ!`, 'success');
        fetchAllPrices();
      } else {
        showToast('Олноор хадгалахад алдаа гарлаа', 'error');
      }
    } catch (e) {
      console.error(e);
      showToast('Сүлжээний алдаа гарлаа', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Discard all changes
  const handleDiscardChanges = () => {
    setEditedPrices({});
    setEditedFormulas({});
    showToast('Өөрчлөлтүүд цуцлагдлаа', 'info');
  };

  // Add new price item
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const isOp = newFormData.category === 'Ажиллагаа';
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/prices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          category: newFormData.category,
          item_name: newFormData.item_name,
          unit_cost: (isOp && !newFormData.is_pricing) ? 0 : Number(newFormData.unit_cost || 0),
          formula_id: newFormData.formula_id ? Number(newFormData.formula_id) : null,
          is_pricing: isOp ? newFormData.is_pricing : true,
          production_stage: isOp ? newFormData.production_stage : 'POST_PRESS'
        })
      });
      if (res.ok) {
        showToast(`"${newFormData.item_name}" амжилттай нэмэгдлээ`, 'success');
        setShowAddModal(false);
        setNewFormData({ category: 'Цаас', item_name: '', unit_cost: '', formula_id: '', is_pricing: true, production_stage: 'POST_PRESS' });
        fetchAllPrices();
      } else {
        showToast('Нэмэхэд алдаа гарлаа', 'error');
      }
    } catch (e) {
      console.error(e);
      showToast('Сүлжээний алдаа гарлаа', 'error');
    }
  };

  // Delete price item
  const handleDeleteItem = async (p: PriceItem) => {
    if (!confirm(`Та "${p.item_name}" үнийг устгахдаа итгэлтэй байна уу?`)) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/prices/${p.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showToast(`"${p.item_name}" амжилттай устгагдлаа`, 'success');
        setPrices(prev => prev.filter(item => item.id !== p.id));
      } else {
        showToast('Устгахад алдаа гарлаа', 'error');
      }
    } catch (e) {
      console.error(e);
      showToast('Сүлжээний алдаа гарлаа', 'error');
    }
  };

  // Export to CSV with UTF-8 BOM
  const handleExportCSV = () => {
    try {
      const headers = ['ID', 'Ангилал', 'Бараа/Үйлчилгээний нэр', 'Дамжлага', 'Зориулалт (Үнэ/Заавар)', 'Нэгж өртөг (₮)'];
      const rows = prices.map(p => [
        p.id,
        `"${(p.category || '').replace(/"/g, '""')}"`,
        `"${(p.item_name || '').replace(/"/g, '""')}"`,
        `"${p.production_stage || 'POST_PRESS'}"`,
        `"${p.is_pricing !== false ? 'Үнэ бодно' : 'Технологийн заавар'}"`,
        p.unit_cost
      ]);

      const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `selenge_prices_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Үнийн жагсаалт Excel (CSV) файл болж татагдлаа', 'success');
    } catch (e) {
      console.error(e);
      showToast('Экспорт хийхэд алдаа гарлаа', 'error');
    }
  };

  // Trigger CSV File Picker
  const handleImportFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r\n|\n/).filter(line => line.trim().length > 0);
        if (lines.length < 2) {
          showToast('Файлд мэдээлэл олдсонгүй', 'error');
          return;
        }

        const parsedRows: Array<{ category: string; item_name: string; unit_cost: number; old_cost?: number }> = [];
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          const cols: string[] = [];
          let current = '';
          let inQuotes = false;
          for (let c = 0; c < line.length; c++) {
            const char = line[c];
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              cols.push(current.trim());
              current = '';
            } else {
              current += char;
            }
          }
          cols.push(current.trim());

          if (cols.length >= 3) {
            let category = 'Цаас';
            let itemName = '';
            let unitCost = 0;

            if (!isNaN(Number(cols[0])) && cols.length >= 4) {
              category = cols[1].replace(/^"|"$/g, '').trim();
              itemName = cols[2].replace(/^"|"$/g, '').trim();
              unitCost = Number(cols[3].replace(/[^\d.-]/g, ''));
            } else {
              category = cols[0].replace(/^"|"$/g, '').trim();
              itemName = cols[1].replace(/^"|"$/g, '').trim();
              unitCost = Number(cols[2].replace(/[^\d.-]/g, ''));
            }

            if (itemName && !isNaN(unitCost)) {
              const existing = prices.find(p => p.item_name.toLowerCase() === itemName.toLowerCase());
              parsedRows.push({
                category: category || (existing ? existing.category : 'Цаас'),
                item_name: itemName,
                unit_cost: unitCost,
                old_cost: existing ? existing.unit_cost : undefined
              });
            }
          }
        }

        if (parsedRows.length === 0) {
          showToast('Тохирох үнийн мөр олдсонгүй. Багана: [Ангилал, Нэр, Үнэ]', 'error');
          return;
        }

        setImportRows(parsedRows);
        setShowImportPreviewModal(true);
      } catch (err) {
        console.error(err);
        showToast('CSV файлыг уншихад алдаа гарлаа', 'error');
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file, 'utf-8');
  };

  // Submit CSV Import to backend
  const handleConfirmImport = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/prices/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ items: importRows })
      });

      if (res.ok) {
        const result = await res.json();
        showToast(`Амжилттай: ${result.updatedCount} үнэ шинэчлэгдэж, ${result.createdCount} шинэ үнэ нэмэгдлээ`, 'success');
        setShowImportPreviewModal(false);
        setImportRows([]);
        fetchAllPrices();
      } else {
        showToast('Импорт хийхэд алдаа гарлаа', 'error');
      }
    } catch (e) {
      console.error(e);
      showToast('Сүлжээний алдаа гарлаа', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Apply Batch Markup to editedPrices state
  const handleApplyMarkup = () => {
    const val = Number(markupValue);
    if (isNaN(val) || val === 0) {
      showToast('Зөв тоон утга оруулна уу', 'error');
      return;
    }

    let affectedCount = 0;
    const newEdited = { ...editedPrices };

    prices.forEach(p => {
      if (markupTargetCategory !== 'All' && p.category !== markupTargetCategory) return;

      const currentCost = editedPrices[p.id] !== undefined ? editedPrices[p.id] : p.unit_cost;
      let calculatedCost = currentCost;

      if (markupType === 'percent_add') {
        calculatedCost = Math.round(currentCost * (1 + val / 100));
      } else if (markupType === 'percent_sub') {
        calculatedCost = Math.max(0, Math.round(currentCost * (1 - val / 100)));
      } else if (markupType === 'fixed_add') {
        calculatedCost = currentCost + val;
      } else if (markupType === 'fixed_sub') {
        calculatedCost = Math.max(0, currentCost - val);
      }

      if (calculatedCost !== p.unit_cost) {
        newEdited[p.id] = calculatedCost;
        affectedCount++;
      }
    });

    setEditedPrices(newEdited);
    setShowMarkupModal(false);
    showToast(`${affectedCount} барааны үнэ дээр ${val}${markupType.includes('percent') ? '%' : '₮'} тооцогдлоо. "Бүгдийг хадгалах" дарж баталгаажуулна уу.`, 'info');
  };

  // Open audit log modal
  const handleOpenHistory = async (item?: PriceItem) => {
    setHistoryTargetItem(item || null);
    setShowHistoryModal(true);
    try {
      const url = item 
        ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/prices/logs?priceId=${item.id}`
        : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/prices/logs?limit=50`;
      
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setHistoryLogs(await res.json());
      }
    } catch (e) {
      console.error(e);
      showToast('Түүх татахад алдаа гарлаа', 'error');
    }
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', paddingBottom: '3rem' }}>
      
      {/* Floating Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          padding: '12px 18px',
          borderRadius: '8px',
          background: toast.type === 'success' ? '#0f766e' : toast.type === 'error' ? '#be123c' : '#0369a1',
          color: '#fff',
          fontWeight: 600,
          fontSize: '0.88rem',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2), 0 8px 10px -6px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>{toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : 'ℹ️'}</span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Hidden CSV File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        accept=".csv" 
        onChange={handleImportFileSelect} 
        style={{ display: 'none' }} 
      />

      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <span>💰</span>
            <span>Санхүүгийн Мастер Үнийн Сан</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '4px 0 0' }}>
            Бүх материал, цаас, ажиллагааны үндсэн өртгийг эндээс удирдана. Энд өөрчлөгдсөн үнэ захиалга тооцоололд шууд хэрэгжинэ.
          </p>
        </div>

        {/* Global Toolbar Actions */}
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button 
            type="button" 
            onClick={() => setShowMarkupModal(true)}
            className="btn btn-outline"
            style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.82rem', padding: '0.45rem 0.8rem' }}
            title="Сонгосон бүлгийн үнийг хувиар өсгөх эсвэл бууруулах"
          >
            <span>⚡</span>
            <span>Үнэ хувиар өөрчлөх</span>
          </button>

          <button 
            type="button" 
            onClick={handleExportCSV}
            className="btn btn-outline"
            style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.82rem', padding: '0.45rem 0.8rem' }}
            title="Excel (CSV) файл болгон татах"
          >
            <span>📥</span>
            <span>Excel татах</span>
          </button>

          <button 
            type="button" 
            onClick={() => fileInputRef.current?.click()}
            className="btn btn-outline"
            style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.82rem', padding: '0.45rem 0.8rem' }}
            title="Excel эсвэл CSV файлаас олноор шинэчлэх"
          >
            <span>📤</span>
            <span>Excel-ээс шинэчлэх</span>
          </button>

          <button 
            type="button" 
            onClick={() => handleOpenHistory()}
            className="btn btn-outline"
            style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.82rem', padding: '0.45rem 0.8rem' }}
            title="Үнийн өөрчлөлтийн бүх түүх"
          >
            <span>📜</span>
            <span>Түүх</span>
          </button>

          <button 
            type="button" 
            className="btn btn-primary"
            onClick={() => setShowAddModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.82rem', padding: '0.45rem 0.85rem' }}
          >
            <span>+</span>
            <span>Шинэ үнэ нэмэх</span>
          </button>
        </div>
      </div>

      {/* Unsaved Changes Sticky Banner */}
      {modifiedItems.length > 0 && (
        <div style={{
          background: '#fffbeb',
          border: '1px solid #fde68a',
          borderRadius: '8px',
          padding: '0.75rem 1.25rem',
          marginBottom: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: '0 4px 12px rgba(217, 119, 6, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '1.25rem' }}>⚠️</span>
            <div>
              <span style={{ fontWeight: 700, color: '#92400e', fontSize: '0.9rem' }}>
                Та нийт {modifiedItems.length} барааны үнийг өөрчилсөн байна!
              </span>
              <div style={{ fontSize: '0.8rem', color: '#b45309' }}>
                Өөрчлөлтийг системд баталгаажуулж хадгалахын тулд "Бүгдийг хадгалах" товчийг дарна уу.
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <button 
              type="button" 
              onClick={handleDiscardChanges}
              className="btn btn-outline"
              style={{ fontSize: '0.82rem', padding: '0.45rem 0.85rem', borderColor: '#d97706', color: '#92400e' }}
            >
              Буцаах (Цуцлах)
            </button>
            <button 
              type="button" 
              onClick={handleSaveAll}
              disabled={saving}
              className="btn btn-primary"
              style={{
                fontSize: '0.82rem',
                padding: '0.45rem 1.25rem',
                background: '#0284c7',
                borderColor: '#0284c7',
                fontWeight: 700,
                boxShadow: '0 2px 6px rgba(2, 132, 199, 0.3)'
              }}
            >
              {saving ? 'Хадгалж байна...' : `💾 Бүгдийг хадгалах (${modifiedItems.length})`}
            </button>
          </div>
        </div>
      )}

      {/* Main Card with Category Tabs & Table */}
      <div className="card" style={{ padding: '1rem 1.25rem', borderRadius: '8px' }}>
        
        {/* Filter Bar: Tabs & Search */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          
          {/* Category Tabs */}
          <div style={{ display: 'flex', gap: '0.35rem', background: '#f1f5f9', padding: '3px', borderRadius: '8px', flexWrap: 'wrap' }}>
            {[
              { id: 'All', label: 'Бүгд', count: categoryCounts['All'] || 0 },
              { id: 'Цаас', label: '📄 Цаас', count: categoryCounts['Цаас'] || 0 },
              { id: 'Материал', label: '📦 Туслах материал', count: categoryCounts['Материал'] || 0 },
              { id: 'Ажиллагаа_Үнэтэй', label: '💵 Үнийн ажиллагаа', count: categoryCounts['Ажиллагаа_Үнэтэй'] || 0 },
              { id: 'Ажиллагаа_Үнэгүй', label: '⚙️ Технологийн заавар (0₮)', count: categoryCounts['Ажиллагаа_Үнэгүй'] || 0 }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveCategory(tab.id);
                  setSelectedItemIds([]);
                }}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  fontWeight: activeCategory === tab.id ? 700 : 500,
                  color: activeCategory === tab.id ? '#0f172a' : '#64748b',
                  background: activeCategory === tab.id ? '#ffffff' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: activeCategory === tab.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>{tab.label}</span>
                <span style={{
                  fontSize: '0.75rem',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  background: '#e2e8f0',
                  color: '#475569'
                }}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Quick Search */}
          <div style={{ position: 'relative', width: '280px' }}>
            <input
              type="text"
              placeholder="🔍 Нэрээр хайх..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.45rem 0.75rem 0.45rem 2rem',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '0.85rem'
              }}
            />
            <span style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.85rem' }}>
              🔍
            </span>
            {searchTerm && (
              <button 
                type="button" 
                onClick={() => setSearchTerm('')}
                style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8' }}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Stage Filter Row (For Operations / All) */}
        {(activeCategory === 'All' || activeCategory.startsWith('Ажиллагаа')) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap', padding: '0.4rem 0.6rem', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginRight: '4px' }}>
              🏭 Дамжлагаар шүүх:
            </span>
            {[
              { id: 'All', label: 'Бүх дамжлага' },
              ...PRODUCTION_STAGES
            ].map(stage => (
              <button
                key={stage.id}
                type="button"
                onClick={() => setActiveStage(stage.id)}
                style={{
                  padding: '3px 10px',
                  borderRadius: '14px',
                  fontSize: '0.75rem',
                  fontWeight: activeStage === stage.id ? 700 : 500,
                  color: activeStage === stage.id ? '#ffffff' : '#475569',
                  background: activeStage === stage.id ? ('color' in stage ? (stage as any).color : '#0284c7') : '#ffffff',
                  border: '1px solid ' + (activeStage === stage.id ? 'transparent' : '#cbd5e1'),
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {'icon' in stage ? `${(stage as any).icon} ` : ''}{stage.label}
              </button>
            ))}
          </div>
        )}

        {/* Bulk Actions Toolbar (when items selected) */}
        {selectedItemIds.length > 0 && (
          <div style={{
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '6px',
            padding: '0.5rem 0.85rem',
            marginBottom: '0.75rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.6rem'
          }}>
            <div style={{ fontSize: '0.82rem', color: '#1e40af', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>☑️ Сонгосон: <strong>{selectedItemIds.length}</strong> ажиллагаа</span>
            </div>
            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => handleBulkSetPricing(true)}
                className="btn btn-outline"
                style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem', color: '#166534', borderColor: '#86efac', background: '#f0fdf4' }}
                title="Сонгосон ажиллагаануудыг үнэ боддог болгох"
              >
                💵 Үнэ боддог болгох
              </button>
              <button
                type="button"
                onClick={() => handleBulkSetPricing(false)}
                className="btn btn-outline"
                style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem', color: '#475569', borderColor: '#cbd5e1', background: '#ffffff' }}
                title="Сонгосон ажиллагаануудыг 0₮ үнэтэй технологийн заавар болгох"
              >
                ⚙️ Технологийн заавар болгох (0₮)
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '6px' }}>
                <span style={{ fontSize: '0.75rem', color: '#475569' }}>Дамжлага:</span>
                <select
                  onChange={e => {
                    if (e.target.value) handleBulkSetStage(e.target.value);
                  }}
                  defaultValue=""
                  style={{
                    height: '26px',
                    fontSize: '0.75rem',
                    padding: '0 4px',
                    borderRadius: '4px',
                    border: '1px solid #cbd5e1',
                    background: '#fff'
                  }}
                >
                  <option value="" disabled>Шилжүүлэх дамжлага...</option>
                  {PRODUCTION_STAGES.map(s => (
                    <option key={s.id} value={s.id}>{s.icon} {s.label}</option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItemIds([])}
                className="btn btn-outline"
                style={{ fontSize: '0.75rem', padding: '0.3rem 0.5rem', color: '#64748b' }}
              >
                ✕ Цуцлах
              </button>
            </div>
          </div>
        )}

        {/* Prices Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '0.75rem 0.4rem', color: '#475569', fontWeight: 700, width: '36px', textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={filteredPrices.length > 0 && selectedItemIds.length === filteredPrices.length}
                    onChange={e => {
                      if (e.target.checked) setSelectedItemIds(filteredPrices.map(p => p.id));
                      else setSelectedItemIds([]);
                    }}
                    style={{ cursor: 'pointer', width: '15px', height: '15px' }}
                    title="Бүгдийг сонгох"
                  />
                </th>
                <th style={{ padding: '0.75rem 0.6rem', color: '#475569', fontWeight: 700, width: '110px' }}>Ангилал</th>
                <th style={{ padding: '0.75rem 0.6rem', color: '#475569', fontWeight: 700 }}>Бараа / Үйлчилгээний нэр</th>
                <th style={{ padding: '0.75rem 0.6rem', color: '#475569', fontWeight: 700, width: '150px' }}>Дамжлага</th>
                <th style={{ padding: '0.75rem 0.6rem', color: '#475569', fontWeight: 700, width: '150px' }}>Зориулалт (Төрөл)</th>
                <th style={{ padding: '0.75rem 0.6rem', color: '#475569', fontWeight: 700, width: '120px' }}>Одоогийн өртөг</th>
                <th style={{ padding: '0.75rem 0.6rem', color: '#475569', fontWeight: 700, width: '160px' }}>Шинэ өртөг (₮)</th>
                <th style={{ padding: '0.75rem 0.6rem', color: '#475569', fontWeight: 700, width: '150px' }}>Томьёо</th>
                <th style={{ padding: '0.75rem 0.6rem', color: '#475569', fontWeight: 700, width: '120px', textAlign: 'center' }}>Үйлдэл</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                    Уншиж байна...
                  </td>
                </tr>
              ) : filteredPrices.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                    Үнийн мэдээлэл олдсонгүй
                  </td>
                </tr>
              ) : (
                filteredPrices.map(p => {
                  const isCostChanged = editedPrices[p.id] !== undefined && editedPrices[p.id] !== p.unit_cost;
                  const isFormulaChanged = editedFormulas[p.id] !== undefined && editedFormulas[p.id] !== (p.formula_id || null);
                  const isDirty = isCostChanged || isFormulaChanged;
                  const currentVal = editedPrices[p.id] !== undefined ? editedPrices[p.id] : p.unit_cost;
                  const currentFormulaVal = editedFormulas[p.id] !== undefined ? (editedFormulas[p.id] || '') : (p.formula_id || '');

                  // Category tag colors
                  const catColor = p.category === 'Цаас' ? '#0284c7' : p.category === 'Материал' ? '#d97706' : '#7c3aed';
                  const catBg = p.category === 'Цаас' ? '#f0f9ff' : p.category === 'Материал' ? '#fffbeb' : '#f5f3ff';

                  return (
                    <tr 
                      key={p.id} 
                      style={{ 
                        borderBottom: '1px solid #e2e8f0',
                        background: isDirty ? '#fefce8' : 'transparent',
                        transition: 'background 0.15s ease'
                      }}
                    >
                      {/* Checkbox */}
                      <td style={{ padding: '0.6rem 0.4rem', textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={selectedItemIds.includes(p.id)}
                          onChange={e => {
                            if (e.target.checked) setSelectedItemIds(prev => [...prev, p.id]);
                            else setSelectedItemIds(prev => prev.filter(id => id !== p.id));
                          }}
                          style={{ cursor: 'pointer', width: '15px', height: '15px' }}
                        />
                      </td>

                      {/* Category */}
                      <td style={{ padding: '0.6rem' }}>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: catColor,
                          background: catBg,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          border: `1px solid ${catColor}20`
                        }}>
                          {p.category}
                        </span>
                      </td>

                      {/* Name */}
                      <td style={{ padding: '0.6rem', fontWeight: 600, color: '#1e293b' }}>
                        {p.item_name}
                      </td>

                      {/* Stage */}
                      <td style={{ padding: '0.6rem' }}>
                        {p.category === 'Ажиллагаа' ? (
                          <select
                            value={p.production_stage || 'POST_PRESS'}
                            onChange={e => handleStageChange(p, e.target.value)}
                            style={{
                              height: '28px',
                              padding: '0 6px',
                              borderRadius: '4px',
                              border: '1px solid #cbd5e1',
                              fontSize: '0.78rem',
                              background: '#fff',
                              color: '#334155',
                              fontWeight: 500,
                              cursor: 'pointer'
                            }}
                          >
                            <option value="PRE_PRESS">📝 Хэвлэхийн өмнөх</option>
                            <option value="PRINTING">🖨️ Хэвлэх</option>
                            <option value="POST_PRESS">✂️ Хэвлэсний дараах</option>
                            <option value="PACKAGING">📦 Савлалт</option>
                          </select>
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>—</span>
                        )}
                      </td>

                      {/* Purpose (Billable vs Directive) */}
                      <td style={{ padding: '0.6rem' }}>
                        {p.category === 'Ажиллагаа' ? (
                          <button
                            type="button"
                            onClick={() => handleTogglePricing(p)}
                            title="Дарж зориулалтыг шууд солих (Үнэ бодох <-> Технологийн заавар)"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '3px 8px',
                              borderRadius: '14px',
                              border: p.is_pricing !== false ? '1px solid #86efac' : '1px solid #cbd5e1',
                              background: p.is_pricing !== false ? '#f0fdf4' : '#f8fafc',
                              color: p.is_pricing !== false ? '#166534' : '#475569',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <span>{p.is_pricing !== false ? '💵 Үнэ бодно' : '⚙️ Заавар (0₮)'}</span>
                            <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>⇄</span>
                          </button>
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Үндсэн өртөг</span>
                        )}
                      </td>

                      {/* Current Cost */}
                      <td style={{ padding: '0.6rem', color: '#64748b', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                        {p.category === 'Ажиллагаа' && p.is_pricing === false ? (
                          <span style={{ color: '#059669', fontWeight: 600, fontSize: '0.8rem' }}>0₮ (Үнэгүй)</span>
                        ) : (
                          `${p.unit_cost.toLocaleString()}₮`
                        )}
                      </td>

                      {/* Editable Cost Input */}
                      <td style={{ padding: '0.6rem' }}>
                        {p.category === 'Ажиллагаа' && p.is_pricing === false ? (
                          <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontStyle: 'italic' }}>Үнэд нөлөөлөхгүй (0₮)</span>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <input
                              type="number"
                              value={currentVal}
                              onChange={e => handlePriceChange(p.id, e.target.value)}
                              style={{
                                width: '110px',
                                height: '30px',
                                padding: '0 8px',
                                borderRadius: '4px',
                                border: isCostChanged ? '2px solid #0284c7' : '1px solid #cbd5e1',
                                background: isCostChanged ? '#f0f9ff' : '#ffffff',
                                fontWeight: isCostChanged ? 700 : 500,
                                color: isCostChanged ? '#0284c7' : '#0f172a',
                                fontFamily: 'monospace',
                                fontSize: '0.85rem'
                              }}
                            />
                            {isCostChanged && (
                              <span style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: 600 }}>
                                {currentVal > p.unit_cost ? `+${(currentVal - p.unit_cost).toLocaleString()}₮` : `${(currentVal - p.unit_cost).toLocaleString()}₮`}
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Formula */}
                      <td style={{ padding: '0.6rem' }}>
                        <select
                          value={currentFormulaVal}
                          onChange={e => handleFormulaChange(p.id, e.target.value)}
                          style={{
                            width: '100%',
                            height: '32px',
                            padding: '0 6px',
                            borderRadius: '4px',
                            border: isFormulaChanged ? '2px solid #0284c7' : '1px solid #cbd5e1',
                            background: isFormulaChanged ? '#f0f9ff' : '#ffffff',
                            fontSize: '0.8rem'
                          }}
                        >
                          <option value="">(Томьёогүй)</option>
                          {formulas.map(f => (
                            <option key={f.id} value={f.id}>{f.name}</option>
                          ))}
                        </select>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '0.6rem', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: '4px', alignItems: 'center' }}>
                          {isDirty ? (
                            <button
                              type="button"
                              onClick={() => handleSaveSingle(p)}
                              title="Энэ үнийг хадгалах"
                              className="btn btn-primary"
                              style={{
                                padding: '3px 8px',
                                fontSize: '0.78rem',
                                background: '#0284c7',
                                borderColor: '#0284c7',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '3px'
                              }}
                            >
                              <span>💾</span>
                              <span>Хадгалах</span>
                            </button>
                          ) : (
                            <span style={{ color: '#10b981', fontSize: '0.85rem', marginRight: '4px' }} title="Хадгалагдсан">
                              ✓
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => handleOpenHistory(p)}
                            title="Өөрчлөлтийн түүх харах"
                            style={{
                              background: '#f1f5f9',
                              border: '1px solid #cbd5e1',
                              borderRadius: '4px',
                              padding: '4px 6px',
                              cursor: 'pointer',
                              fontSize: '0.75rem'
                            }}
                          >
                            📜
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteItem(p)}
                            title="Устгах"
                            style={{
                              background: '#fff1f2',
                              border: '1px solid #fecdd3',
                              borderRadius: '4px',
                              padding: '4px 6px',
                              cursor: 'pointer',
                              color: '#e11d48',
                              fontSize: '0.75rem'
                            }}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#64748b' }}>
          <div>
            Нийт харагдаж буй: <strong>{filteredPrices.length}</strong> / Нийт сан: <strong>{prices.length}</strong>
          </div>
          {modifiedItems.length > 0 && (
            <div style={{ color: '#0284c7', fontWeight: 600 }}>
              💡 {modifiedItems.length} үнэ дээр хадгалаагүй өөрчлөлт байна
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: Шинэ үнэ нэмэх */}
      {showAddModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', zIndex: 1000,
          display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem'
        }}>
          <div className="card" style={{ maxWidth: '480px', width: '100%', borderRadius: '10px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                ✨ Шинэ бараа / ажиллагаа нэмэх
              </h3>
              <button onClick={() => setShowAddModal(false)} style={{ border: 'none', background: 'transparent', fontSize: '1.2rem', cursor: 'pointer', color: '#64748b' }}>✕</button>
            </div>
            
            <form onSubmit={handleAddSubmit} style={{ display: 'grid', gap: '0.85rem' }}>
              <div>
                <label className="label">Ангилал</label>
                <select 
                  value={newFormData.category} 
                  onChange={e => setNewFormData({ ...newFormData, category: e.target.value })}
                  className="input"
                >
                  <option value="Цаас">📄 Цаас</option>
                  <option value="Материал">📦 Туслах материал</option>
                  <option value="Ажиллагаа">⚙️ Ажиллагаа</option>
                  <option value="Бусад">Бусад</option>
                </select>
              </div>

              {newFormData.category === 'Ажиллагаа' && (
                <>
                  <div>
                    <label className="label">Зориулалт (Төрөл)</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => setNewFormData({ ...newFormData, is_pricing: true })}
                        style={{
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: newFormData.is_pricing ? '2px solid #16a34a' : '1px solid #cbd5e1',
                          background: newFormData.is_pricing ? '#f0fdf4' : '#fff',
                          color: newFormData.is_pricing ? '#15803d' : '#475569',
                          fontWeight: newFormData.is_pricing ? 700 : 500,
                          fontSize: '0.82rem',
                          cursor: 'pointer'
                        }}
                      >
                        💵 Үнэ бодно
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewFormData({ ...newFormData, is_pricing: false, unit_cost: '0' })}
                        style={{
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: !newFormData.is_pricing ? '2px solid #0284c7' : '1px solid #cbd5e1',
                          background: !newFormData.is_pricing ? '#f0f9ff' : '#fff',
                          color: !newFormData.is_pricing ? '#0369a1' : '#475569',
                          fontWeight: !newFormData.is_pricing ? 700 : 500,
                          fontSize: '0.82rem',
                          cursor: 'pointer'
                        }}
                      >
                        ⚙️ Технологийн заавар (0₮)
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="label">Үйлдвэрлэлийн дамжлага</label>
                    <select
                      value={newFormData.production_stage}
                      onChange={e => setNewFormData({ ...newFormData, production_stage: e.target.value })}
                      className="input"
                    >
                      {PRODUCTION_STAGES.map(s => (
                        <option key={s.id} value={s.id}>{s.icon} {s.label}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div>
                <label className="label">
                  {newFormData.category === 'Ажиллагаа' ? 'Ажиллагааны нэр' : 'Нэр (Жишээ: Шохойтой 157гр, Картон 2 A0)'}
                </label>
                <input 
                  type="text" 
                  required 
                  placeholder="Нэр бичих..."
                  value={newFormData.item_name} 
                  onChange={e => setNewFormData({ ...newFormData, item_name: e.target.value })} 
                  className="input" 
                />
              </div>

              {!(newFormData.category === 'Ажиллагаа' && !newFormData.is_pricing) ? (
                <>
                  <div>
                    <label className="label">Нэгж өртөг (₮)</label>
                    <input 
                      type="number" 
                      required 
                      placeholder="Жишээ нь: 450"
                      value={newFormData.unit_cost} 
                      onChange={e => setNewFormData({ ...newFormData, unit_cost: e.target.value })} 
                      className="input" 
                    />
                  </div>

                  <div>
                    <label className="label">Томьёо холбох (Сонголттой)</label>
                    <select 
                      value={newFormData.formula_id} 
                      onChange={e => setNewFormData({ ...newFormData, formula_id: e.target.value })} 
                      className="input"
                    >
                      <option value="">Байхгүй</option>
                      {formulas.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                    </select>
                  </div>
                </>
              ) : (
                <div style={{
                  background: '#f8fafc',
                  border: '1px dashed #cbd5e1',
                  borderRadius: '6px',
                  padding: '0.6rem 0.8rem',
                  fontSize: '0.8rem',
                  color: '#64748b'
                }}>
                  💡 Технологийн зааварчилгаа нь <strong>0₮</strong> өртөгтэй тул үнийн саналд оролцохгүй. Үйлдвэрлэлийн хуудсанд ажилтанд заавар болж хэвлэгдэнэ.
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-outline">Болих</button>
                <button type="submit" className="btn btn-primary">Хадгалах</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Үнэ хувиар өөрчлөх (Batch Markup Tool) */}
      {showMarkupModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', zIndex: 1000,
          display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem'
        }}>
          <div className="card" style={{ maxWidth: '460px', width: '100%', borderRadius: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                ⚡ Үнэ олноор хувиар өөрчлөх
              </h3>
              <button onClick={() => setShowMarkupModal(false)} style={{ border: 'none', background: 'transparent', fontSize: '1.2rem', cursor: 'pointer', color: '#64748b' }}>✕</button>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>
              Түүхий эдийн өсөлт эсвэл хямдралыг сонгосон бүлгийн бараанд нэг зэрэг хувиар эсвэл тогтмол дүнгээр тооцож урьдчилан бэлтгэнэ.
            </p>

            <div style={{ display: 'grid', gap: '0.85rem' }}>
              <div>
                <label className="label">Хамрах ангилал</label>
                <select 
                  value={markupTargetCategory} 
                  onChange={e => setMarkupTargetCategory(e.target.value)}
                  className="input"
                >
                  <option value="All">Бүх бараа, ажиллагаа ({prices.length})</option>
                  <option value="Цаас">Зөвхөн Цаас ({categoryCounts['Цаас'] || 0})</option>
                  <option value="Материал">Зөвхөн Туслах материал ({categoryCounts['Материал'] || 0})</option>
                  <option value="Ажиллагаа">Зөвхөн Ажиллагаа ({categoryCounts['Ажиллагаа'] || 0})</option>
                </select>
              </div>

              <div>
                <label className="label">Үйлдлийн төрөл</label>
                <select 
                  value={markupType} 
                  onChange={e => setMarkupType(e.target.value as any)}
                  className="input"
                >
                  <option value="percent_add">📈 Хувиар өсгөх (+ %)</option>
                  <option value="percent_sub">📉 Хувиар хямдруулах (- %)</option>
                  <option value="fixed_add">➕ Тогтмол дүн нэмэх (+ ₮)</option>
                  <option value="fixed_sub">➖ Тогтмол дүн хасах (- ₮)</option>
                </select>
              </div>

              <div>
                <label className="label">
                  {markupType.includes('percent') ? 'Хувь (%)' : 'Мөнгөн дүн (₮)'}
                </label>
                <input 
                  type="number" 
                  value={markupValue} 
                  onChange={e => setMarkupValue(e.target.value)}
                  placeholder="Жишээ: 5"
                  className="input"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '0.75rem' }}>
                <button type="button" onClick={() => setShowMarkupModal(false)} className="btn btn-outline">Болих</button>
                <button type="button" onClick={handleApplyMarkup} className="btn btn-primary" style={{ background: '#0284c7', borderColor: '#0284c7' }}>
                  Тооцоолох (Ширээнд буулгах)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Excel-ээс импортлох Урьдчилан харах цонх */}
      {showImportPreviewModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', zIndex: 1000,
          display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem'
        }}>
          <div className="card" style={{ maxWidth: '680px', width: '100%', maxHeight: '85vh', display: 'flex', flexDirection: 'column', borderRadius: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                📤 Excel-ээс үнэ шинэчлэх урьдчилсан харагдац
              </h3>
              <button onClick={() => setShowImportPreviewModal(false)} style={{ border: 'none', background: 'transparent', fontSize: '1.2rem', cursor: 'pointer', color: '#64748b' }}>✕</button>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 0.75rem' }}>
              Файлаас нийт <strong>{importRows.length}</strong> үнийн мөр олдлоо. Дараах өөрчлөлтүүд баазад хийгдэнэ:
            </p>

            <div style={{ flex: 1, overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '6px', marginBottom: '1rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0 }}>
                    <th style={{ padding: '6px 8px' }}>Барааны нэр</th>
                    <th style={{ padding: '6px 8px' }}>Ангилал</th>
                    <th style={{ padding: '6px 8px' }}>Хуучин үнэ</th>
                    <th style={{ padding: '6px 8px' }}>Шинэ үнэ</th>
                    <th style={{ padding: '6px 8px' }}>Өөрчлөлт</th>
                  </tr>
                </thead>
                <tbody>
                  {importRows.map((r, idx) => {
                    const diff = r.old_cost !== undefined ? r.unit_cost - r.old_cost : 0;
                    const isNew = r.old_cost === undefined;
                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '6px 8px', fontWeight: 600 }}>{r.item_name}</td>
                        <td style={{ padding: '6px 8px', color: '#64748b' }}>{r.category}</td>
                        <td style={{ padding: '6px 8px', color: '#64748b' }}>
                          {r.old_cost !== undefined ? `${r.old_cost.toLocaleString()}₮` : '-'}
                        </td>
                        <td style={{ padding: '6px 8px', fontWeight: 700, color: '#0f172a' }}>
                          {r.unit_cost.toLocaleString()}₮
                        </td>
                        <td style={{ padding: '6px 8px' }}>
                          {isNew ? (
                            <span style={{ color: '#10b981', fontWeight: 600 }}>✨ Шинэ бараа</span>
                          ) : diff > 0 ? (
                            <span style={{ color: '#0284c7', fontWeight: 600 }}>+{diff.toLocaleString()}₮</span>
                          ) : diff < 0 ? (
                            <span style={{ color: '#e11d48', fontWeight: 600 }}>{diff.toLocaleString()}₮</span>
                          ) : (
                            <span style={{ color: '#94a3b8' }}>Ижил</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem' }}>
              <button type="button" onClick={() => setShowImportPreviewModal(false)} className="btn btn-outline">
                Болих
              </button>
              <button 
                type="button" 
                onClick={handleConfirmImport} 
                disabled={saving}
                className="btn btn-primary"
                style={{ background: '#0284c7', borderColor: '#0284c7', fontWeight: 700 }}
              >
                {saving ? 'Шинэчилж байна...' : 'Баталгаажуулж шинэчлэх'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Үнийн өөрчлөлтийн Түүх (Audit Log) */}
      {showHistoryModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', zIndex: 1000,
          display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem'
        }}>
          <div className="card" style={{ maxWidth: '640px', width: '100%', maxHeight: '80vh', display: 'flex', flexDirection: 'column', borderRadius: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                  📜 Үнийн өөрчлөлтийн түүх
                </h3>
                {historyTargetItem && (
                  <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#0284c7', fontWeight: 600 }}>
                    Бараа: {historyTargetItem.item_name}
                  </p>
                )}
              </div>
              <button onClick={() => setShowHistoryModal(false)} style={{ border: 'none', background: 'transparent', fontSize: '1.2rem', cursor: 'pointer', color: '#64748b' }}>✕</button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
              {historyLogs.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                  Өөрчлөлтийн бүртгэл олдсонгүй
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0 }}>
                      <th style={{ padding: '6px 8px' }}>Огноо, цаг</th>
                      {!historyTargetItem && <th style={{ padding: '6px 8px' }}>Барааны нэр</th>}
                      <th style={{ padding: '6px 8px' }}>Өөрчилсөн ажилтан</th>
                      <th style={{ padding: '6px 8px' }}>Хуучин</th>
                      <th style={{ padding: '6px 8px' }}>Шинэ</th>
                      <th style={{ padding: '6px 8px' }}>Зөрүү</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyLogs.map(log => {
                      const diff = log.new_cost - log.old_cost;
                      const dateStr = new Date(log.createdAt).toLocaleString('mn-MN', {
                        year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
                      });
                      return (
                        <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '6px 8px', color: '#64748b', fontSize: '0.78rem' }}>{dateStr}</td>
                          {!historyTargetItem && (
                            <td style={{ padding: '6px 8px', fontWeight: 600 }}>
                              {log.masterprice?.item_name || `#${log.masterPriceId}`}
                            </td>
                          )}
                          <td style={{ padding: '6px 8px' }}>
                            <span style={{ fontWeight: 600, color: '#334155' }}>{log.user?.name || 'Админ'}</span>
                            <span style={{ fontSize: '0.72rem', color: '#94a3b8', marginLeft: '4px' }}>({log.user?.role || 'FINANCE'})</span>
                          </td>
                          <td style={{ padding: '6px 8px', color: '#64748b' }}>{log.old_cost.toLocaleString()}₮</td>
                          <td style={{ padding: '6px 8px', fontWeight: 700, color: '#0f172a' }}>{log.new_cost.toLocaleString()}₮</td>
                          <td style={{ padding: '6px 8px' }}>
                            {diff > 0 ? (
                              <span style={{ color: '#0284c7', fontWeight: 600 }}>+{diff.toLocaleString()}₮</span>
                            ) : diff < 0 ? (
                              <span style={{ color: '#e11d48', fontWeight: 600 }}>{diff.toLocaleString()}₮</span>
                            ) : (
                              <span style={{ color: '#94a3b8' }}>0₮</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button type="button" onClick={() => setShowHistoryModal(false)} className="btn btn-outline">
                Хаах
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}


"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useAuthStore } from '../../../stores/useAuthStore';
import { useRouter } from 'next/navigation';
import Pagination from '../../../components/Pagination';

export default function FinanceDashboard() {
  const { token, user } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [financeFilter, setFinanceFilter] = useState<'ALL' | 'READY_WITH_BALANCE' | 'WITH_BALANCE' | 'PAID'>('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  // Payment Modal state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Данс');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [startProduction, setStartProduction] = useState(true);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  const limit = 20;
  const router = useRouter();

  const fetchOrders = () => {
    if (!token) return;

    const query = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      search: searchTerm,
      paymentFilter: financeFilter === 'WITH_BALANCE' ? 'WITH_BALANCE' : financeFilter === 'PAID' ? 'PAID' : financeFilter === 'READY_WITH_BALANCE' ? 'READY_WITH_BALANCE' : ''
    });

    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/orders?${query}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data && data.data) {
          // Exclude quotes
          setOrders(data.data.filter((o:any) => o.current_status !== 'Үнийн санал')); 
          setTotalPages(data.meta?.totalPages || 1);
          setTotalCount(data.meta?.total || 0);
        } else if (Array.isArray(data)) {
          setOrders(data.filter((o:any) => o.current_status !== 'Үнийн санал'));
        }
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchOrders();
  }, [token, page, searchTerm, financeFilter]);

  // Compute stats from current orders
  const stats = useMemo(() => {
    let totalReceivable = 0;
    let readyWithBalanceCount = 0;
    let pendingAdvanceCount = 0;

    orders.forEach(o => {
      const finalPrice = Math.round(Number(o.final_price ?? o.total_price) || 0);
      const paid = Math.round(Number(o.paid_amount) || 0);
      const remaining = Math.max(0, finalPrice - paid);
      totalReceivable += remaining;

      if (['Бэлэн болсон', 'Бэлэн'].includes(o.current_status || '') && remaining > 0) {
        readyWithBalanceCount++;
      }
      if (['Үйлдвэрлэлд'].includes(o.current_status || '') && paid === 0 && finalPrice > 0) {
        pendingAdvanceCount++;
      }
    });

    return { totalReceivable, readyWithBalanceCount, pendingAdvanceCount };
  }, [orders]);

  const handleOpenPayment = (order: any) => {
    setSelectedOrderForPayment(order);
    
    const totalPrice = Math.round(Number(order.final_price ?? order.total_price) || 0);
    const totalPaid = Math.round(Number(order.paid_amount) || 0);
    const balance = Math.max(0, totalPrice - totalPaid);
    
    setPaymentAmount(balance > 0 ? balance.toString() : '');
    setPaymentMethod('Данс');
    setPaymentNotes('');
    setStartProduction(order.current_status === 'Санхүү хүлээгдэж буй' || order.current_status === 'Хүлээгдэж буй');
    setIsPaymentModalOpen(true);
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForPayment || !paymentAmount) return;

    setIsSubmittingPayment(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/orders/${selectedOrderForPayment.id}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: Number(paymentAmount),
          method: paymentMethod,
          notes: paymentNotes,
          start_production: startProduction
        })
      });

      if (res.ok) {
        alert('Төлбөр амжилттай бүртгэгдлээ.');
        setIsPaymentModalOpen(false);
        fetchOrders();
      } else {
        const err = await res.json();
        alert(`Алдаа гарлаа: ${err.error || 'Тодорхойгүй'}`);
      }
    } catch (error) {
      console.error(error);
      alert('Сүлжээний алдаа гарлаа');
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  return (
    <div>
      <header style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="title">Санхүүгийн самбар (Төлбөрүүд)</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Төлбөр тооцоо, авлагын хяналт ба нэхэмжлэх үүсгэх</p>
        </div>
      </header>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {/* Card 1: Total Receivable */}
        <div style={{ background: '#fff', border: '1px solid #fee2e2', borderRadius: '0.75rem', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Нийт авах авлага (Хуудасны дүн)</span>
            <span style={{ fontSize: '1.25rem' }}>💰</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#dc2626' }}>
            {stats.totalReceivable.toLocaleString()} ₮
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
            Төлөгдөөгүй үлдэгдэл төлбөрүүдийн нийлбэр
          </div>
        </div>

        {/* Card 2: Ready but unpaid */}
        <div 
          onClick={() => setFinanceFilter(financeFilter === 'READY_WITH_BALANCE' ? 'ALL' : 'READY_WITH_BALANCE')}
          style={{ 
            background: financeFilter === 'READY_WITH_BALANCE' ? '#fef2f2' : '#fff', 
            border: financeFilter === 'READY_WITH_BALANCE' ? '2px solid #ef4444' : '1px solid #fed7aa', 
            borderRadius: '0.75rem', 
            padding: '1.25rem', 
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          title="Дарж шүүнэ үү"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#b45309', fontWeight: 700 }}>🚨 Бэлэн болсон үлдэгдэлтэй</span>
            <span style={{ fontSize: '1.25rem' }}>📦</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#b45309' }}>
            {stats.readyWithBalanceCount} захиалга
          </div>
          <div style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.25rem', fontWeight: 600 }}>
            {financeFilter === 'READY_WITH_BALANCE' ? '✓ Шүүгдсэн байна' : '👉 Дарж шууд шүүх'}
          </div>
        </div>

        {/* Card 3: In production without deposit */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>Урьдчилгаагүй үйлдвэрлэлд</span>
            <span style={{ fontSize: '1.25rem' }}>⏳</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#475569' }}>
            {stats.pendingAdvanceCount} захиалга
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
            Төлбөр огт ороогүй яваа
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: '1.5rem', overflowX: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {[
              { key: 'ALL', label: 'Бүх захиалга' },
              { key: 'READY_WITH_BALANCE', label: '🚨 Бэлэн болсон үлдэгдэлтэй' },
              { key: 'WITH_BALANCE', label: '⚠️ Үлдэгдэлтэй' },
              { key: 'PAID', label: '✓ Бүрэн төлөгдсөн' },
            ].map((f: any) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFinanceFilter(f.key)}
                style={{
                  padding: '0.4rem 0.8rem',
                  borderRadius: '0.375rem',
                  border: financeFilter === f.key ? '1px solid #0f172a' : '1px solid #cbd5e1',
                  background: financeFilter === f.key ? '#0f172a' : '#f8fafc',
                  color: financeFilter === f.key ? '#fff' : '#334155',
                  fontWeight: financeFilter === f.key ? 700 : 500,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div>
            <input 
              type="text" 
              placeholder="🔍 Захиалгын дугаар, утсаар хайх..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="erp-input"
              style={{ width: '280px' }}
            />
          </div>
        </div>

        <table className="erp-table">
          <thead>
            <tr>
              <th>№</th>
              <th>Захиалга</th>
              <th>Харилцагч</th>
              <th style={{ textAlign: 'right' }}>Нийт үнэ</th>
              <th style={{ textAlign: 'right' }}>Төлсөн</th>
              <th style={{ textAlign: 'right' }}>Үлдэгдэл</th>
              <th>Төлбөрийн байдал</th>
              <th>Төлөв</th>
              <th style={{ textAlign: 'center' }}>Үйлдэл</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr><td colSpan={9} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>Захиалга олдсонгүй</td></tr>
            ) : (
              orders.map((o) => {
                const totalPrice = Math.round(Number(o.final_price ?? o.total_price) || 0);
                const totalPaid = Math.round(Number(o.paid_amount) || 0);
                const balance = Math.max(0, totalPrice - totalPaid);
                const isReady = ['Бэлэн болсон', 'Бэлэн'].includes(o.current_status || '');
                const highlightWarning = isReady && balance > 0;

                return (
                  <tr 
                    key={o.id}
                    style={{
                      background: highlightWarning ? '#fff7ed' : 'transparent',
                      borderLeft: highlightWarning ? '4px solid #ea580c' : 'none'
                    }}
                  >
                    <td style={{ fontWeight: 700 }}>
                      {o.order_number || `#${o.id}`}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{o.product_name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Тоо: {o.total_qty} ш</div>
                    </td>
                    <td>
                      <div>{o.customer_name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{o.phone || '-'}</div>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: '#0f172a' }}>
                      {totalPrice.toLocaleString()} ₮
                    </td>
                    <td style={{ textAlign: 'right', color: totalPaid > 0 ? '#10b981' : '#64748b', fontWeight: totalPaid > 0 ? 600 : 'normal' }}>
                      {totalPaid.toLocaleString()} ₮
                    </td>
                    <td style={{ textAlign: 'right', color: balance > 0 ? '#ef4444' : '#10b981', fontWeight: 700 }}>
                      {balance > 0 ? `${balance.toLocaleString()} ₮` : '✓ Төлөгдсөн'}
                    </td>
                    <td>
                      {balance === 0 && totalPrice > 0 ? (
                        <span style={{ background: '#dcfce7', color: '#15803d', padding: '0.2rem 0.55rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700 }}>
                          ✓ Бүрэн
                        </span>
                      ) : totalPaid > 0 ? (
                        <span style={{ background: '#fef3c7', color: '#b45309', padding: '0.2rem 0.55rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700 }}>
                          🟡 Урьдчилгаа {o.paid_percent || Math.round((totalPaid / (totalPrice || 1)) * 100)}%
                        </span>
                      ) : (
                        <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.2rem 0.55rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700 }}>
                          🔴 Төлбөргүй
                        </span>
                      )}
                    </td>
                    <td>
                      <span className="status-badge" style={{ 
                        backgroundColor: highlightWarning ? '#ffedd5' : '#e2e8f0', 
                        color: highlightWarning ? '#9a3412' : '#334155',
                        fontWeight: highlightWarning ? 700 : 500
                      }}>
                        {highlightWarning ? `⚠️ ${o.current_status}` : (o.current_status || 'Тодорхойгүй')}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        <button 
                          onClick={() => handleOpenPayment(o)}
                          className="btn btn-outline"
                          style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', borderColor: '#10b981', color: '#10b981', fontWeight: 700 }}
                          title="Төлбөр бүртгэх"
                        >
                          💸 Төлбөр
                        </button>
                        <button 
                          onClick={() => router.push(`/finance/orders/${o.id}/invoice`)}
                          className="btn btn-primary"
                          style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                        >
                          📄 Нэхэмжлэх
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        
        {totalPages > 1 && (
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        )}
      </div>

      {/* Payment Modal */}
      {isPaymentModalOpen && selectedOrderForPayment && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(3px)' }}>
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.75rem', width: '100%', maxWidth: '500px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: 700 }}>💸 Төлбөр бүртгэх</h2>
              <button onClick={() => setIsPaymentModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}>×</button>
            </div>
            
            <div style={{ marginBottom: '1.25rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '0.5rem', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}>
              <div style={{ marginBottom: '0.35rem' }}><strong>Захиалга:</strong> {selectedOrderForPayment.order_number || `#${selectedOrderForPayment.id}`} — {selectedOrderForPayment.product_name}</div>
              <div style={{ marginBottom: '0.35rem' }}><strong>Нийт дүн:</strong> {Math.round(Number(selectedOrderForPayment.final_price ?? selectedOrderForPayment.total_price) || 0).toLocaleString()} ₮</div>
              <div style={{ marginBottom: '0.35rem', color: '#16a34a' }}><strong>Төлсөн дүн:</strong> {Math.round(Number(selectedOrderForPayment.paid_amount) || 0).toLocaleString()} ₮</div>
              <div style={{ color: '#dc2626', fontWeight: 700, fontSize: '0.95rem', marginTop: '0.35rem', paddingTop: '0.35rem', borderTop: '1px dashed #cbd5e1' }}>
                ТӨЛӨХ ҮЛДЭГДЭЛ: {Math.max(0, Math.round(Number(selectedOrderForPayment.final_price ?? selectedOrderForPayment.total_price) || 0) - Math.round(Number(selectedOrderForPayment.paid_amount) || 0)).toLocaleString()} ₮
              </div>
            </div>

            <form onSubmit={handleSubmitPayment}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Төлөх дүн (₮)</label>
                <input 
                  type="number" 
                  className="erp-input" 
                  value={paymentAmount} 
                  onChange={(e) => setPaymentAmount(e.target.value)} 
                  required 
                  style={{ width: '100%', padding: '0.55rem', fontSize: '1rem', fontWeight: 700 }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Төлбөрийн хэлбэр</label>
                <select 
                  className="erp-input" 
                  value={paymentMethod} 
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem' }}
                >
                  <option value="Данс">Дансаар</option>
                  <option value="Бэлэн">Бэлнээр</option>
                  <option value="QPay">QPay</option>
                  <option value="Карт">Картаар</option>
                  <option value="Бусад">Бусад</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Гүйлгээний утга / Тэмдэглэл (заавал биш)</label>
                <input 
                  type="text" 
                  className="erp-input" 
                  value={paymentNotes} 
                  onChange={(e) => setPaymentNotes(e.target.value)} 
                  placeholder="Жишээ: Хаан банкны гүйлгээ, баримт №..."
                  style={{ width: '100%', padding: '0.5rem' }}
                />
              </div>

              {/* Start production toggle if pending */}
              {['Санхүү хүлээгдэж буй', 'Хүлээгдэж буй'].includes(selectedOrderForPayment.current_status) && (
                <div style={{ marginBottom: '1.25rem', padding: '0.75rem', background: '#ecfdf5', borderRadius: '0.5rem', border: '1px solid #a7f3d0' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, color: '#065f46' }}>
                    <input
                      type="checkbox"
                      checked={startProduction}
                      onChange={(e) => setStartProduction(e.target.checked)}
                      style={{ cursor: 'pointer', accentColor: '#10b981', width: '16px', height: '16px' }}
                    />
                    ⚙️ Урьдчилгаа төлбөр орсон тул шууд Үйлдвэрлэлд шилжүүлэх
                  </label>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setIsPaymentModalOpen(false)} className="btn btn-outline" disabled={isSubmittingPayment}>
                  Цуцлах
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmittingPayment} style={{ background: '#10b981', borderColor: '#10b981', fontWeight: 700 }}>
                  {isSubmittingPayment ? 'Бүртгэж байна...' : '✓ Төлбөр бүртгэх'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../../stores/useAuthStore';
import { useRouter } from 'next/navigation';
import Pagination from '../../../components/Pagination';

export default function FinanceDashboard() {
  const { token, user } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  // Payment Modal state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Данс');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  const limit = 20;
  
  const router = useRouter();

  const fetchOrders = () => {
    if (!token) return;

    const query = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      search: searchTerm,
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
  }, [token, page, searchTerm]);

  const handleOpenPayment = (order: any) => {
    setSelectedOrderForPayment(order);
    
    // Calculate balance
    const totalPrice = order.total_price || 0;
    let totalPaid = 0;
    if (order.payments && Array.isArray(order.payments)) {
      totalPaid = order.payments.reduce((acc: number, p: any) => acc + (Number(p.amount) || 0), 0);
    } else {
      const p1 = Number(order.payment_percent_1) || 0;
      const p2 = Number(order.payment_percent_2) || 0;
      totalPaid = (totalPrice * p1 / 100) + (totalPrice * p2 / 100);
    }
    const balance = totalPrice - totalPaid;
    
    setPaymentAmount(balance > 0 ? balance.toString() : '');
    setPaymentMethod('Данс');
    setPaymentNotes('');
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
          notes: paymentNotes
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
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="title">Санхүүгийн самбар (Төлбөрүүд)</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Төлбөр бүртгэх болон нэхэмжлэх үүсгэх</p>
        </div>
      </header>

      <div className="card" style={{ padding: '1.5rem', overflowX: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <input 
              type="text" 
              placeholder="Захиалгын дугаар, утсаар хайх..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="erp-input"
              style={{ width: '300px' }}
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
              <th>Төлөв</th>
              <th style={{ textAlign: 'center' }}>Үйлдэл</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>Захиалга олдсонгүй</td></tr>
            ) : (
              orders.map((o) => {
                const totalPrice = o.total_price || 0;
                // Compute total paid from payments relation if it exists, otherwise fallback to old fields
                let totalPaid = 0;
                if (o.payments && Array.isArray(o.payments)) {
                  totalPaid = o.payments.reduce((acc: number, p: any) => acc + (Number(p.amount) || 0), 0);
                } else {
                  // Fallback to legacy fields
                  const p1 = Number(o.payment_percent_1) || 0;
                  const p2 = Number(o.payment_percent_2) || 0;
                  totalPaid = (totalPrice * p1 / 100) + (totalPrice * p2 / 100);
                }
                const balance = totalPrice - totalPaid;

                return (
                  <tr key={o.id}>
                    <td style={{ fontWeight: 600 }}>{o.order_number}</td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{o.product_name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Тоо: {o.total_qty}</div>
                    </td>
                    <td>
                      <div>{o.customer_name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{o.phone}</div>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: '#0f172a' }}>{totalPrice.toLocaleString()} ₮</td>
                    <td style={{ textAlign: 'right', color: totalPaid > 0 ? '#10b981' : '#64748b' }}>{totalPaid.toLocaleString()} ₮</td>
                    <td style={{ textAlign: 'right', color: balance > 0 ? '#ef4444' : '#10b981', fontWeight: balance > 0 ? 600 : 'normal' }}>
                      {balance > 0 ? `${balance.toLocaleString()} ₮` : 'Төлөгдсөн'}
                    </td>
                    <td>
                      <span className="status-badge" style={{ backgroundColor: '#e2e8f0', color: '#334155' }}>
                        {o.current_status || 'Тодорхойгүй'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        <button 
                          onClick={() => handleOpenPayment(o)}
                          className="btn btn-outline"
                          style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', borderColor: '#10b981', color: '#10b981' }}
                          title="Төлбөр бүртгэх"
                        >
                          💸 Төлбөр
                        </button>
                        <button 
                          onClick={() => router.push(`/finance/orders/${o.id}/invoice`)}
                          className="btn btn-primary"
                          style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
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
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.5rem', width: '100%', maxWidth: '500px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>Төлбөр бүртгэх</h2>
              <button onClick={() => setIsPaymentModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}>×</button>
            </div>
            
            <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '0.5rem' }}>
              <div style={{ marginBottom: '0.5rem' }}><strong>Захиалга:</strong> {selectedOrderForPayment.order_number} - {selectedOrderForPayment.product_name}</div>
              <div style={{ marginBottom: '0.5rem' }}><strong>Нийт үнэ:</strong> {selectedOrderForPayment.total_price?.toLocaleString()} ₮</div>
            </div>

            <form onSubmit={handleSubmitPayment}>
              <div className="form-group">
                <label>Төлөх дүн (₮)</label>
                <input 
                  type="number" 
                  className="erp-input" 
                  value={paymentAmount} 
                  onChange={(e) => setPaymentAmount(e.target.value)} 
                  required 
                />
              </div>

              <div className="form-group">
                <label>Төлбөрийн хэлбэр</label>
                <select 
                  className="erp-input" 
                  value={paymentMethod} 
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="Данс">Данс</option>
                  <option value="Бэлэн">Бэлэн</option>
                  <option value="Карт">Карт</option>
                  <option value="Бусад">Бусад</option>
                </select>
              </div>

              <div className="form-group">
                <label>Тэмдэглэл (заавал биш)</label>
                <input 
                  type="text" 
                  className="erp-input" 
                  value={paymentNotes} 
                  onChange={(e) => setPaymentNotes(e.target.value)} 
                  placeholder="Гүйлгээний утга эсвэл нэмэлт тайлбар"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" onClick={() => setIsPaymentModalOpen(false)} className="btn btn-outline" disabled={isSubmittingPayment}>
                  Цуцлах
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmittingPayment}>
                  {isSubmittingPayment ? 'Хадгалж байна...' : 'Хадгалах'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

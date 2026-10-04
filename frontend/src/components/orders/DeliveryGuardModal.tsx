"use client";

import React, { useState } from 'react';

interface DeliveryGuardModalProps {
  order: any;
  onClose: () => void;
  onSuccess: (updatedOrder?: any) => void;
  token: string;
}

export default function DeliveryGuardModal({ order, onClose, onSuccess, token }: DeliveryGuardModalProps) {
  const [tab, setTab] = useState<'PAY_AND_DELIVER' | 'CREDIT_DELIVER'>('PAY_AND_DELIVER');
  const [paymentMethod, setPaymentMethod] = useState('Данс');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [creditNotes, setCreditNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!order) return null;

  const finalPrice = Math.round(Number(order.final_price ?? order.total_price) || 0);
  const paidAmount = Math.round(Number(order.paid_amount) || 0);
  const remainingBalance = Math.max(0, finalPrice - paidAmount);

  const handlePayAndDeliver = async () => {
    setIsSubmitting(true);
    try {
      // 1. Record payment for the remaining balance
      const payRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/orders/${order.id}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: remainingBalance,
          method: paymentMethod,
          notes: paymentNotes ? `Бараа олгох үеийн төлөлт: ${paymentNotes}` : 'Бараа олгох үеийн үлдэгдэл төлөлт'
        })
      });

      if (!payRes.ok) {
        const err = await payRes.json();
        alert(`Төлбөр бүртгэхэд алдаа гарлаа: ${err.error || 'Тодорхойгүй'}`);
        setIsSubmitting(false);
        return;
      }

      // 2. Change status to Delivered
      const statusRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/orders/${order.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          new_status: 'Хүлээлгэн өгсөн',
          notes: `Үлдэгдэл ${remainingBalance.toLocaleString()} ₮ бүрэн төлөгдөж бараа хүлээлгэн өгөв (${paymentMethod})`
        })
      });

      if (statusRes.ok) {
        const resData = await statusRes.json();
        alert('Үлдэгдэл төлбөр амжилттай бүртгэгдэж, барааг хүлээлгэн өгсөн төлөвт шилжүүллээ.');
        onSuccess(resData.order);
      } else {
        alert('Төлбөр бүртгэгдсэн боловч төлөв өөрчлөхөд алдаа гарлаа.');
        onSuccess();
      }
    } catch (error) {
      console.error(error);
      alert('Сүлжээний алдаа гарлаа');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreditDeliver = async () => {
    if (!creditNotes.trim()) {
      alert('Зээлээр олгох зөвшөөрөл эсвэл гэрээний тайлбарыг заавал бичнэ үү!');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/orders/${order.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          new_status: 'Хүлээлгэн өгсөн',
          force_delivery: true,
          delivery_notes: creditNotes.trim()
        })
      });

      if (res.ok) {
        const resData = await res.json();
        alert('Захиалга зөвшөөрлийн тайлбартайгаар амжилттай хүлээлгэн өгөгдлөө.');
        onSuccess(resData.order);
      } else {
        const err = await res.json();
        alert(`Алдаа гарлаа: ${err.error || err.message || 'Тодорхойгүй'}`);
      }
    } catch (error) {
      console.error(error);
      alert('Сүлжээний алдаа гарлаа');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      backdropFilter: 'blur(4px)',
      padding: '1rem'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '1rem',
        width: '100%',
        maxWidth: '540px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden',
        border: '1px solid #fee2e2'
      }}>
        {/* Header with warning banner */}
        <div style={{
          background: '#ef4444',
          color: '#ffffff',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🚨</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>
                ҮЛДЭГДЭЛ ТӨЛБӨР ДУТУУ БАЙНА!
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', opacity: 0.9 }}>
                Бараа олгохоос өмнө төлбөрийг шалгана уу
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: '#fff',
              fontSize: '1.2rem',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '1.5rem' }}>
          {/* Order Brief Info */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '0.5rem',
            padding: '1rem',
            marginBottom: '1.25rem',
            fontSize: '0.85rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <span style={{ color: '#64748b' }}>Захиалга:</span>
              <strong style={{ color: '#0f172a' }}>{order.order_number || `#${order.id}`} — {order.product_name} ({order.total_qty} ш)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <span style={{ color: '#64748b' }}>Харилцагч:</span>
              <span style={{ fontWeight: 600 }}>{order.customer_name} {order.phone ? `(${order.phone})` : ''}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <span style={{ color: '#64748b' }}>Нийт үнэ:</span>
              <span style={{ fontWeight: 600 }}>{finalPrice.toLocaleString()} ₮</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: '#64748b' }}>Төлөгдсөн дүн:</span>
              <span style={{ color: '#16a34a', fontWeight: 600 }}>{paidAmount.toLocaleString()} ₮</span>
            </div>
            
            {/* Remaining Balance Highlight Box */}
            <div style={{
              background: '#fef2f2',
              border: '2px solid #ef4444',
              borderRadius: '0.5rem',
              padding: '0.75rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '0.5rem'
            }}>
              <span style={{ fontWeight: 700, color: '#991b1b', fontSize: '0.95rem' }}>
                ТӨЛӨХ ҮЛДЭГДЭЛ:
              </span>
              <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#dc2626' }}>
                {remainingBalance.toLocaleString()} ₮
              </span>
            </div>
          </div>

          {/* Action Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setTab('PAY_AND_DELIVER')}
              style={{
                flex: 1,
                padding: '0.5rem',
                borderRadius: '0.375rem',
                border: 'none',
                background: tab === 'PAY_AND_DELIVER' ? '#10b981' : '#f1f5f9',
                color: tab === 'PAY_AND_DELIVER' ? '#fff' : '#475569',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              💸 1. Төлбөр авч Хүлээлгэн өгөх
            </button>
            <button
              type="button"
              onClick={() => setTab('CREDIT_DELIVER')}
              style={{
                flex: 1,
                padding: '0.5rem',
                borderRadius: '0.375rem',
                border: 'none',
                background: tab === 'CREDIT_DELIVER' ? '#f59e0b' : '#f1f5f9',
                color: tab === 'CREDIT_DELIVER' ? '#fff' : '#475569',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              📝 2. Зээлээр олгох (Тайлбартай)
            </button>
          </div>

          {/* Tab 1: Pay and Deliver */}
          {tab === 'PAY_AND_DELIVER' && (
            <div>
              <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '0.75rem' }}>
                Харилцагчаас үлдэгдэл <strong>{remainingBalance.toLocaleString()} ₮</strong>-ийг хүлээн авсан тул шууд бүртгээд захиалгыг <strong>Хүлээлгэн өгсөн</strong> болгох:
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>Төлбөрийн хэлбэр:</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="erp-input"
                    style={{ width: '100%', padding: '0.45rem', fontSize: '0.85rem' }}
                  >
                    <option value="Данс">Дансаар</option>
                    <option value="Бэлэн">Бэлнээр</option>
                    <option value="QPay">QPay</option>
                    <option value="Картаар">Картаар</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>Төлсөн дүн:</label>
                  <input
                    type="text"
                    disabled
                    value={`${remainingBalance.toLocaleString()} ₮`}
                    className="erp-input"
                    style={{ width: '100%', padding: '0.45rem', fontSize: '0.85rem', background: '#f1f5f9', fontWeight: 700, color: '#10b981' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>Тэмдэглэл / Гүйлгээний утга (сонголтоор):</label>
                <input
                  type="text"
                  placeholder="Жишээ: Хаан банкны шилжүүлэг, баримт №12"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="erp-input"
                  style={{ width: '100%', padding: '0.45rem', fontSize: '0.85rem' }}
                />
              </div>

              <button
                type="button"
                onClick={handlePayAndDeliver}
                disabled={isSubmitting}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '0.65rem',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  background: '#10b981',
                  borderColor: '#10b981',
                  justifyContent: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                {isSubmitting ? 'Бүртгэж байна...' : `✓ Төлбөр ${remainingBalance.toLocaleString()} ₮ бүртгэж Хүлээлгэн өгөх`}
              </button>
            </div>
          )}

          {/* Tab 2: Credit Deliver */}
          {tab === 'CREDIT_DELIVER' && (
            <div>
              <p style={{ fontSize: '0.85rem', color: '#b45309', background: '#fffbeb', padding: '0.5rem', borderRadius: '4px', border: '1px solid #fde68a', marginBottom: '0.75rem' }}>
                ⚠️ АНХААР: Үлдэгдэл төлбөр аваагүй бараа олгох нь өр авлага үүсгэнэ. Удирдлага эсвэл Санхүүгийн зөвшөөрлийн үндэслэлийг доор тодорхой бичнэ үү.
              </p>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>
                  Зээлээр олгох зөвшөөрөл / Гэрээний тайлбар (Заавал):
                </label>
                <textarea
                  rows={3}
                  placeholder="Жишээ: Гэрээ №24-ийн дагуу 14 хоногт төлөхөөр захирал зөвшөөрсөн"
                  value={creditNotes}
                  onChange={(e) => setCreditNotes(e.target.value)}
                  className="erp-input"
                  style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem' }}
                />
              </div>

              <button
                type="button"
                onClick={handleCreditDeliver}
                disabled={isSubmitting || !creditNotes.trim()}
                className="btn"
                style={{
                  width: '100%',
                  padding: '0.65rem',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  background: '#f59e0b',
                  color: '#fff',
                  border: 'none',
                  justifyContent: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  opacity: (!creditNotes.trim() || isSubmitting) ? 0.6 : 1,
                  cursor: (!creditNotes.trim() || isSubmitting) ? 'not-allowed' : 'pointer'
                }}
              >
                {isSubmitting ? 'Шилжүүлж байна...' : `⚠️ Зөвшөөрлийн тайлбартайгаар олгох`}
              </button>
            </div>
          )}

          {/* Close button */}
          <div style={{ marginTop: '0.75rem', textAlign: 'center' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                fontSize: '0.85rem',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Буцах (Бараа олгохгүйгээр хаах)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

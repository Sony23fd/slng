"use client";

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../../../../stores/useAuthStore';
import { useRouter, useParams } from 'next/navigation';

export default function QuotationPage() {
  const { token, user } = useAuthStore();
  const router = useRouter();
  const params = useParams();
  const { id } = params as { id: string };

  const [order, setOrder] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [companyLogo, setCompanyLogo] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Live customizer states
  const [editMode, setEditMode] = useState(false);
  const [customCustomer, setCustomCustomer] = useState('');
  const [customProduct, setCustomProduct] = useState('');
  const [customSize, setCustomSize] = useState('');
  const [customColors, setCustomColors] = useState('');
  const [customInner, setCustomInner] = useState('');
  const [customCover, setCustomCover] = useState('');
  const [customOps, setCustomOps] = useState('');
  const [customQty, setCustomQty] = useState(0);
  const [customUnitPrice, setCustomUnitPrice] = useState(0);
  const [customTotal, setCustomTotal] = useState(0);
  const [validityDays, setValidityDays] = useState(30);
  const [productionDays, setProductionDays] = useState('5-7');
  const [showVat, setShowVat] = useState(true);
  const [customDate, setCustomDate] = useState('');

  useEffect(() => {
    if (!token) return;

    // Fetch order
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/orders/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setOrder(data);

        // Extract specs cleanly
        let matArray = Array.isArray(data.materials) ? data.materials : [];
        if (typeof data.materials === 'string') {
          try { matArray = JSON.parse(data.materials); } catch (e) {}
        }
        let opArray = Array.isArray(data.operations) ? data.operations : [];
        if (typeof data.operations === 'string') {
          try { opArray = JSON.parse(data.operations); } catch (e) {}
        }

        const innerMats = matArray.filter((m: any) => !m.is_cover);
        const coverMats = matArray.filter((m: any) => m.is_cover);

        const innerDesc = innerMats.map((m: any) => m.material_name || m.name).join(', ') || '128 гр мат';
        const coverDesc = coverMats.map((m: any) => m.material_name || m.name).join(', ') || '-';
        const opsDesc = opArray.map((o: any) => o.op_name || o.name).join(', ') || 'мат бүрэлт';

        setCustomCustomer(data.customer_name || '');
        setCustomProduct(data.product_name || '');
        setCustomSize(data.size || 'A5');
        setCustomColors(data.colors || '4+4');
        setCustomInner(innerDesc);
        setCustomCover(coverDesc);
        setCustomOps(opsDesc);
        setCustomQty(data.total_qty || 0);
        
        let total = data.final_price || data.finalPrice || 0;
        if (total === 0 && matArray.length > 0) {
          const matCost = matArray.reduce((acc: number, m: any) => acc + ((Number(m.sheet_qty) || 0) * (Number(m.unit_cost) || 0)), 0);
          const opCost = opArray.reduce((acc: number, o: any) => acc + ((Number(o.qty) || 0) * (Number(o.unit_cost) || 0)), 0);
          const factoryCost = matCost + opCost + (Number(data.print_cost) || 0);
          const margin = Number(data.profit_margin) || 0;
          const net = factoryCost * ((100 + margin) / 100);
          total = data.has_vat !== false ? net * 1.1 : net;
        }
        setCustomTotal(Math.round(total));
        setCustomUnitPrice(data.total_qty > 0 ? Math.round(total / data.total_qty) : 0);
        setShowVat(data.has_vat !== false);
        setCustomDate(new Date().toISOString().slice(0, 10));
        setLoading(false);
      })
      .catch(console.error);

    // Fetch profile for stamp
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/auth/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setProfile(data))
      .catch(console.error);

    // Fetch constants for COMPANY_LOGO
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/constants`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(constants => {
        if (Array.isArray(constants)) {
          const logoConst = constants.find((c: any) => c.type === 'COMPANY_LOGO');
          if (logoConst?.value) setCompanyLogo(logoConst.value);
        }
      })
      .catch(console.error);
  }, [token, id]);

  const handleDownloadPDF = async () => {
    const html2pdf = (await import('html2pdf.js')).default;
    const element = document.getElementById('printable-area');
    
    const opt = {
      margin:       [15, 15, 15, 15],
      filename:     `Үнийн_санал_${order?.order_number || id}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    html2pdf().set(opt as any).from(element || document.body).save();
  };

  if (loading || !order) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <p>Үнийн санал уншиж байна...</p>
      </div>
    );
  }

  return (
    <div style={{ background: '#f1f5f9', minHeight: '100vh', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-area, #printable-area * {
            visibility: visible;
          }
          #printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 20px;
            box-shadow: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}} />

      {/* Top Action & Live Customizer Bar */}
      <div className="no-print" style={{ maxWidth: '850px', width: '100%', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <button className="btn btn-outline" onClick={() => router.back()}>
              ← Буцах
            </button>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              className="btn btn-outline"
              onClick={() => setEditMode(!editMode)}
              style={{ background: editMode ? '#eff6ff' : 'white', borderColor: editMode ? '#3b82f6' : '#cbd5e1' }}
            >
              ✏️ {editMode ? 'Засварлагчийг хаах' : 'Үзүүлэлт & Нөхцөл засах'}
            </button>
            <button className="btn btn-outline" onClick={() => window.print()}>
              🖨️ Хэвлэх
            </button>
            <button className="btn btn-primary" onClick={handleDownloadPDF}>
              📄 PDF татах
            </button>
          </div>
        </div>

        {/* Live Editor Panel */}
        {editMode && (
          <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem', background: '#ffffff', border: '1px solid #bfdbfe' }}>
            <h3 style={{ margin: '0 0 1rem', color: '#1e3a8a', fontSize: '1.1rem' }}>⚙️ Үнийн санал тохируулах (Live Customizer)</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label className="label">Захиалагч байгууллага:</label>
                <input type="text" className="input" value={customCustomer} onChange={e => setCustomCustomer(e.target.value)} />
              </div>
              <div>
                <label className="label">Бүтээгдэхүүний нэр:</label>
                <input type="text" className="input" value={customProduct} onChange={e => setCustomProduct(e.target.value)} />
              </div>
              <div>
                <label className="label">Огноо:</label>
                <input type="date" className="input" value={customDate} onChange={e => setCustomDate(e.target.value)} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label className="label">Хэмжээ:</label>
                <input type="text" className="input" value={customSize} onChange={e => setCustomSize(e.target.value)} />
              </div>
              <div>
                <label className="label">Өнгө:</label>
                <input type="text" className="input" value={customColors} onChange={e => setCustomColors(e.target.value)} />
              </div>
              <div>
                <label className="label">Дотор цаас:</label>
                <input type="text" className="input" value={customInner} onChange={e => setCustomInner(e.target.value)} />
              </div>
              <div>
                <label className="label">Хавтас цаас:</label>
                <input type="text" className="input" value={customCover} onChange={e => setCustomCover(e.target.value)} />
              </div>
              <div>
                <label className="label">Нэмэлт ажиллагаа:</label>
                <input type="text" className="input" value={customOps} onChange={e => setCustomOps(e.target.value)} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label className="label">Тоо ширхэг (ш):</label>
                <input
                  type="number"
                  className="input"
                  value={customQty}
                  onChange={e => {
                    const q = Number(e.target.value);
                    setCustomQty(q);
                    setCustomTotal(q * customUnitPrice);
                  }}
                />
              </div>
              <div>
                <label className="label">Нэгж үнэ (₮):</label>
                <input
                  type="number"
                  className="input"
                  value={customUnitPrice}
                  onChange={e => {
                    const u = Number(e.target.value);
                    setCustomUnitPrice(u);
                    setCustomTotal(customQty * u);
                  }}
                />
              </div>
              <div>
                <label className="label">Нийт үнэ (₮):</label>
                <input
                  type="number"
                  className="input"
                  value={customTotal}
                  onChange={e => setCustomTotal(Number(e.target.value))}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
              <div>
                <label className="label">Хүчинтэй хугацаа (хоног):</label>
                <input type="number" className="input" value={validityDays} onChange={e => setValidityDays(Number(e.target.value))} />
              </div>
              <div>
                <label className="label">Үйлдвэрлэх хугацаа (хоног):</label>
                <input type="text" className="input" value={productionDays} onChange={e => setProductionDays(e.target.value)} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginTop: '1.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 500 }}>
                  <input type="checkbox" checked={showVat} onChange={e => setShowVat(e.target.checked)} style={{ width: '18px', height: '18px' }} />
                  НӨАТ 10% орсон гэж харуулах
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Printable Area - Official Template 100% Match */}
      <div
        id="printable-area"
        style={{
          maxWidth: '850px',
          width: '100%',
          background: 'white',
          padding: '3.5rem 4rem',
          borderRadius: '4px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
          color: '#000000',
          fontFamily: "'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
        }}
      >
        {/* Header Block */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
          <div>
            {/* SP Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.8rem' }}>
              {companyLogo ? (
                <img 
                  src={companyLogo.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}${companyLogo}` : companyLogo} 
                  alt="Company Logo" 
                  style={{ maxHeight: '60px', objectFit: 'contain' }} 
                />
              ) : (
                <div style={{
                  border: '2.5px solid #2563eb',
                  borderRadius: '50%',
                  width: '54px',
                  height: '34px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontStyle: 'italic',
                  fontSize: '1.3rem',
                  letterSpacing: '-1px'
                }}>
                  <span style={{ color: '#2563eb' }}>S</span>
                  <span style={{ color: '#f97316' }}>P</span>
                </div>
              )}
            </div>

            <h1 style={{ fontSize: '1.3rem', fontWeight: 700, margin: '0 0 0.4rem', color: '#000000', letterSpacing: '0.5px' }}>
              "СЭЛЭНГЭПРЕСС" ХХК
            </h1>
            <div style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.45 }}>
              <div>Монгол улс, Улаанбаатар хот</div>
              <div>Баянзүрх дүүрэг, 2-р хороо, Б.Доржийн гудамж</div>
              <div>"СЭЛЭНГЭПРЕСС" ХХК-ийн байр</div>
              <div>И-мэйл: info@selengepress.mn Вэб: www.selengepress.mn</div>
              <div>Утас / факс: (976)-11-459790</div>
            </div>
          </div>

          <div style={{ textAlign: 'right', marginTop: '1.5rem' }}>
            <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#000000' }}>
              {customCustomer}
            </div>
          </div>
        </div>

        {/* Date */}
        <div style={{ fontSize: '1.05rem', fontWeight: 600, color: '#000000', marginBottom: '1.5rem' }}>
          {customDate}
        </div>

        {/* Title & Intro */}
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, textAlign: 'center', margin: '0 0 1.5rem', color: '#000000' }}>
          Үнийн санал хүргүүлэх тухай
        </h2>
        
        <p style={{ fontSize: '0.98rem', lineHeight: 1.6, color: '#000000', textAlign: 'justify', marginBottom: '2.5rem' }}>
          “Сэлэнгэпресс” ХХК нь Монгол улсад хэвлэлийн чиглэлээр үүсгэн байгуулагдсан анхны компаниудын нэг бөгөөд бид тогтвортой үйл ажиллагаа, найдвартай түншлэл, дэлхийн жишигт нийцсэн техник технологиор үйлдвэрлэсэн хэвлэлийн бүтээгдэхүүн, үйлчилгээг санал болгож байна.
        </p>

        {/* Specs Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000000', marginBottom: '2.5rem' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              <th style={{ border: '1px solid #000000', padding: '0.75rem', textAlign: 'center', fontSize: '0.95rem', fontWeight: 700 }}>Бүтээгдэхүүний нэр</th>
              <th style={{ border: '1px solid #000000', padding: '0.75rem', textAlign: 'center', fontSize: '0.95rem', fontWeight: 700 }}>Үзүүлэлт</th>
              <th style={{ border: '1px solid #000000', padding: '0.75rem', textAlign: 'center', fontSize: '0.95rem', fontWeight: 700 }}>Тоо ширхэг</th>
              <th style={{ border: '1px solid #000000', padding: '0.75rem', textAlign: 'center', fontSize: '0.95rem', fontWeight: 700 }}>Нэгж үнэ</th>
              <th style={{ border: '1px solid #000000', padding: '0.75rem', textAlign: 'center', fontSize: '0.95rem', fontWeight: 700 }}>Нийт үнэ</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #000000', padding: '1.25rem 0.75rem', textAlign: 'center', fontWeight: 600, verticalAlign: 'middle', fontSize: '0.95rem' }}>
                {customProduct}
              </td>
              <td style={{ border: '1px solid #000000', padding: '1.25rem 1rem', verticalAlign: 'top', fontSize: '0.92rem', lineHeight: 1.6 }}>
                <div><strong>Хэмжээ:</strong> {customSize}</div>
                {customColors && <div><strong>Өнгө:</strong> {customColors}</div>}
                {customInner && <div><strong>Дотор цаас:</strong> {customInner}</div>}
                {customCover && customCover !== '-' && <div><strong>Хавтас цаас:</strong> {customCover}</div>}
                {customOps && customOps !== '-' && <div><strong>Нэмэлт:</strong> {customOps}</div>}
              </td>
              <td style={{ border: '1px solid #000000', padding: '1.25rem 0.75rem', textAlign: 'center', verticalAlign: 'middle', fontSize: '0.95rem' }}>
                {customQty?.toLocaleString()}ш
              </td>
              <td style={{ border: '1px solid #000000', padding: '1.25rem 0.75rem', textAlign: 'center', verticalAlign: 'middle', fontSize: '0.95rem' }}>
                {customUnitPrice?.toLocaleString()}₮
              </td>
              <td style={{ border: '1px solid #000000', padding: '1.25rem 0.75rem', textAlign: 'center', verticalAlign: 'middle', fontWeight: 600, fontSize: '0.95rem' }}>
                {customTotal?.toLocaleString()}₮
              </td>
            </tr>
          </tbody>
        </table>

        {/* Terms Paragraph */}
        <p style={{ fontSize: '0.95rem', lineHeight: 1.65, color: '#000000', textAlign: 'justify', marginBottom: '2rem' }}>
          Энэхүү үнийн санал {validityDays} хоногийн хугацаанд хүчинтэй байна. Дээрхи үнийн саналд {showVat ? 'НӨАТ-10% орсон болно.' : 'НӨАТ тооцогдоогүй болно.'} Бэлэн болох хугацаа хэвлэх зөвшөөрөл өгсөнөөс хойш ажлын {productionDays} хоног байна. Бүтээгдэхүүний нөхцөл өөрчлөгдвөл үнийн саналд өөрчлөлт орохыг анхаарна уу?
        </p>
        
        <p style={{ fontSize: '0.95rem', fontStyle: 'italic', color: '#000000', textAlign: 'center', marginBottom: '3.5rem' }}>
          Бидний саналыг хүлээн авч хамтран ажиллана гэдэгт итгэлтэй байна.
        </p>

        {/* Signatures & Stamp Block */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pageBreakInside: 'avoid' }}>
          <div style={{ fontSize: '0.95rem', color: '#000000' }}>
            Үнийн санал боловсруулсан:
          </div>

          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {(order?.user?.stamp_url || profile?.stamp_url) ? (
              <img src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}${order?.user?.stamp_url || profile?.stamp_url}`} alt="Stamp" style={{ width: '170px', objectFit: 'contain' }} />
            ) : (
              <div style={{
                border: '2px solid #1d4ed8',
                borderRadius: '4px',
                padding: '0.5rem 1rem',
                textAlign: 'center',
                color: '#1d4ed8',
                transform: 'rotate(-4deg)',
                boxShadow: 'inset 0 0 0 1px #1d4ed8',
                background: 'rgba(239, 246, 255, 0.4)'
              }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 800 }}>СЭЛЭНГЭПРЕСС ХХК</div>
                <div style={{ fontSize: '0.7rem', fontWeight: 600, borderTop: '1px dashed #1d4ed8', borderBottom: '1px dashed #1d4ed8', margin: '3px 0', padding: '2px 0' }}>МАРКЕТИНГИЙН АЛБА</div>
                <div style={{ fontSize: '0.65rem' }}>ТТ659689 № 2715732</div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700 }}>УЛААНБААТАР ХОТ</div>
              </div>
            )}
          </div>

          <div style={{ fontSize: '0.95rem', color: '#000000', textAlign: 'right' }}>
            <div>Менежер {order?.user?.name || order?.sales_person_name || user?.name || 'Э.Мөнх-Эрдэнэ'}</div>
            <div style={{ marginTop: '0.3rem' }}>Утас: {order?.user?.phone || profile?.phone || (user as any)?.phone || '88992238'}</div>
          </div>
        </div>

        {/* Bonus: Digital Quote Verification Badge */}
        <div style={{ marginTop: '3.5rem', borderTop: '1px solid #cbd5e1', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: '#64748b', pageBreakInside: 'avoid' }}>
          <div>
            <strong>Баталгаажуулах дугаар:</strong> SP-QUOTE-{order?.id || id}-{new Date().getFullYear()} &nbsp;|&nbsp; <strong>Хэвлэсэн:</strong> {new Date().toLocaleDateString('mn-MN')}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', border: '1px solid #cbd5e1', padding: '0.25rem 0.6rem', borderRadius: '4px', background: '#f8fafc', color: '#334155', fontWeight: 600 }}>
            <span>🔒 Цахим баталгаажилттай албан үнийн санал</span>
          </div>
        </div>

      </div>
    </div>
  );
}

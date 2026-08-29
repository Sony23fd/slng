"use client";

import React, { useRef } from 'react';

interface Props {
  order: any;
  onClose: () => void;
}

export default function JobTicketModal({ order, onClose }: Props) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  if (!order) return null;

  const hasNotes = Boolean(order.notes) || (order.materials && order.materials.some((m: any) => m.notes)) || (order.operations && order.operations.some((o: any) => o.notes)) || (order.outsourcedJobs && order.outsourcedJobs.some((oj: any) => oj.notes));

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
      padding: '2rem'
    }} className="job-ticket-overlay" onClick={onClose}>
      
      <div 
        className="job-ticket-modal"
        style={{
          background: '#fff',
          borderRadius: '0.75rem',
          width: '100%',
          maxWidth: '800px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          position: 'relative'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header Actions - hidden on print */}
        <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', position: 'sticky', top: 0, background: '#fff', zIndex: 10 }}>
          <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--primary-color)' }}>Ажлын хуудас дэлгэрэнгүй</h2>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={handlePrint} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: 'none', background: 'var(--primary-color)', color: '#fff', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}>
              🖨️ Хэвлэх
            </button>
            <button onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}>
              &times;
            </button>
          </div>
        </div>

        {/* Printable Content */}
        <div ref={printRef} className="print-area" style={{ padding: '2rem', color: '#000', fontFamily: 'sans-serif' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #000', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', textTransform: 'uppercase' }}>Үйлдвэрлэлийн ажлын хуудас</h1>
              <div style={{ fontSize: '1.1rem' }}><strong>Харилцагч:</strong> {order.customer_name}</div>
              <div style={{ fontSize: '1.1rem' }}><strong>Бүтээгдэхүүн:</strong> {order.product_name}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{order.order_number || `#${order.id}`}</div>
              <div style={{ fontSize: '1rem' }}><strong>Огноо:</strong> {new Date(order.createdAt).toLocaleDateString()}</div>
              {order.deadline && <div style={{ fontSize: '1rem', color: '#e11d48', fontWeight: 'bold' }}><strong>Хүлээлгэн өгөх:</strong> {new Date(order.deadline).toLocaleDateString()}</div>}
              {order.sales_person_name && <div style={{ fontSize: '1rem' }}><strong>Борлуулагч:</strong> {order.sales_person_name}</div>}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '4px' }}>
              <h3 style={{ margin: '0 0 0.75rem 0', borderBottom: '1px solid #ccc', paddingBottom: '0.25rem' }}>Үндсэн үзүүлэлт</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem', fontSize: '0.95rem' }}>
                <strong>Тоо ширхэг:</strong> <span>{order.total_qty} ш</span>
                <strong>Хэмжээ:</strong> <span>{order.size} {order.sub_size ? `(${order.sub_size})` : ''}</span>
                {order.specifications && order.specifications.length > 0 && (
                  <>
                    <strong>Хуудасны тоо:</strong> <span>{order.specifications[0].total_pages}</span>
                    <strong>Гадна өнгө:</strong> <span>{order.specifications[0].cover_color}</span>
                    <strong>Дотор өнгө:</strong> <span>{order.specifications[0].inner_color}</span>
                  </>
                )}
                <strong>Угсралт:</strong> <span>{order.binding_type || 'Үгүй'}</span>
              </div>
            </div>
            
            <div style={{ border: order.is_urgent ? '2px solid #ef4444' : '1px solid #ccc', padding: '1rem', borderRadius: '4px', background: order.is_urgent ? '#fef2f2' : 'transparent' }}>
               <h3 style={{ margin: '0 0 0.75rem 0', borderBottom: '1px solid #ccc', paddingBottom: '0.25rem' }}>Төлөв</h3>
               <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                 {order.is_urgent && <span style={{ color: '#ef4444', marginRight: '0.5rem' }}>🚨 ЯАРАЛТАЙ!</span>}
               </div>
               <div><strong>Эх бэлтгэл:</strong> {order.design_status}</div>
            </div>
          </div>

          {/* Notes Warning Block */}
          {hasNotes && (
            <div style={{ border: '2px dashed #ef4444', padding: '1rem', borderRadius: '4px', marginBottom: '1.5rem', background: '#fff' }}>
              <h3 style={{ color: '#ef4444', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                ⚠️ ОНЦГОЙ АНХААРАХ ЗҮЙЛС (Борлуулагчаас)
              </h3>
              <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#b91c1c', fontWeight: 'bold', fontSize: '1rem' }}>
                {order.notes && <li>{order.notes}</li>}
                {order.materials?.filter((m: any) => m.notes).map((m: any, i: number) => (
                  <li key={`mn-${i}`}>Материал [{m.material_name}]: {m.notes}</li>
                ))}
                {order.operations?.filter((o: any) => o.notes).map((o: any, i: number) => (
                  <li key={`on-${i}`}>Ажиллагаа [{o.operation_name}]: {o.notes}</li>
                ))}
                {order.outsourcedJobs?.filter((oj: any) => oj.notes).map((oj: any, i: number) => (
                  <li key={`ojn-${i}`}>Гадуур ажил [{oj.job_name}]: {oj.notes}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Materials Table */}
          {order.materials && order.materials.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ margin: '0 0 0.5rem 0', borderBottom: '1px solid #000' }}>Материал ба Хэвлэл</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9' }}>
                    <th style={{ border: '1px solid #cbd5e1', padding: '0.5rem', textAlign: 'left' }}>Материал</th>
                    <th style={{ border: '1px solid #cbd5e1', padding: '0.5rem', textAlign: 'center' }}>Зүсэх хэмжээ</th>
                    <th style={{ border: '1px solid #cbd5e1', padding: '0.5rem', textAlign: 'center' }}>Хэвлэлийн хуудас</th>
                    <th style={{ border: '1px solid #cbd5e1', padding: '0.5rem', textAlign: 'center' }}>Орох тоо</th>
                  </tr>
                </thead>
                <tbody>
                  {order.materials.map((m: any, idx: number) => (
                    <tr key={idx}>
                      <td style={{ border: '1px solid #cbd5e1', padding: '0.5rem' }}>{m.material_name}</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '0.5rem', textAlign: 'center' }}>{m.print_size}</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '0.5rem', textAlign: 'center' }}>{m.press_sheet} {m.divide_by ? `(1/${m.divide_by})` : ''}</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '0.5rem', textAlign: 'center', fontWeight: 'bold' }}>{m.total_qty} ш</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Operations Table */}
          {order.operations && order.operations.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ margin: '0 0 0.5rem 0', borderBottom: '1px solid #000' }}>Ажиллагаа (Нэмэлт)</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9' }}>
                    <th style={{ border: '1px solid #cbd5e1', padding: '0.5rem', textAlign: 'center', width: '40px' }}>✓</th>
                    <th style={{ border: '1px solid #cbd5e1', padding: '0.5rem', textAlign: 'left' }}>Ажиллагааны нэр</th>
                    <th style={{ border: '1px solid #cbd5e1', padding: '0.5rem', textAlign: 'center' }}>Тоо ширхэг</th>
                    <th style={{ border: '1px solid #cbd5e1', padding: '0.5rem', textAlign: 'left' }}>Тайлбар</th>
                  </tr>
                </thead>
                <tbody>
                  {order.operations.map((o: any, idx: number) => (
                    <tr key={idx}>
                      <td style={{ border: '1px solid #cbd5e1', padding: '0.5rem', textAlign: 'center' }}>
                        <div style={{ width: '20px', height: '20px', border: '2px solid #000', borderRadius: '3px', margin: '0 auto' }}></div>
                      </td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '0.5rem', fontWeight: 600 }}>{o.operation_name}</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '0.5rem', textAlign: 'center', fontWeight: 'bold' }}>{o.qty} ш</td>
                      <td style={{ border: '1px solid #cbd5e1', padding: '0.5rem' }}>{o.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #000', paddingTop: '1rem' }}>
             <div style={{ textAlign: 'center', width: '200px' }}>
                <div>........................................</div>
                <div style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>Ажил хүлээлгэн өгсөн</div>
             </div>
             <div style={{ textAlign: 'center', width: '200px' }}>
                <div>........................................</div>
                <div style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>Ажил хүлээн авсан</div>
             </div>
          </div>
          
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          .job-ticket-modal, .job-ticket-modal * {
            visibility: visible;
          }
          .job-ticket-modal {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            max-width: 100%;
            box-shadow: none;
            overflow: visible;
            border-radius: 0;
            background: #fff;
          }
          .no-print {
            display: none !important;
          }
          /* Override background overlay */
          .job-ticket-overlay {
            background: #fff !important;
            padding: 0 !important;
            align-items: flex-start !important;
            position: absolute !important;
          }
        }
      `}} />
    </div>
  );
}

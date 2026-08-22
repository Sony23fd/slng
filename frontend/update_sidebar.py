import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    new_sidebar = '''        <div className="rail" id="rail-summary">
          <div className="erp-summary-card">
            <div className="erp-summary-top">
              <div className="erp-lbl">Нийт үнэ (харилцагчид)</div>
              <div className="erp-big"><span className="erp-cur">₮</span><span id="totalPriceOut">{prices.finalPrice.toLocaleString()}</span></div>
              <div className="erp-margin-badge">📈 Ашгийн маржин {formValues.profit_margin || 20}%</div>
            </div>

            <div className="erp-summary-body">
              <div className="erp-stat-grid">
                <div className="erp-stat"><div className="erp-l">Материалын өртөг</div><div className="erp-v">{prices.totalMaterialCost.toLocaleString()} ₮</div></div>
                <div className="erp-stat"><div className="erp-l">Ажиллагааны өртөг</div><div className="erp-v">{prices.totalOperationCost.toLocaleString()} ₮</div></div>
                <div className="erp-stat"><div className="erp-l">Нийт өртөг</div><div className="erp-v">{prices.factoryTotalCost.toLocaleString()} ₮</div></div>
                <div className="erp-stat erp-profit"><div className="erp-l">Цэвэр ашиг</div><div className="erp-v">{(prices.finalPrice - prices.factoryTotalCost).toLocaleString()} ₮</div></div>
              </div>

              <div className="erp-row-line"><span className="erp-l">Нэгжийн өртөг</span><span className="erp-v">{prices.unitCost.toLocaleString()} ₮</span></div>
              <div className="erp-field-inline">
                <label>Ашгийн хувь (%)</label>
                <div className="erp-mini-input"><input type="number" step="any" {...register("profit_margin")} /></div>
              </div>
              <div className="erp-field-inline">
                <label>Нэгжийн үнэ (ашигтай)</label>
                <div className="erp-mini-input"><input type="text" value={`${prices.unitPrice.toLocaleString()} ₮`} readOnly /></div>
              </div>

              <div className="erp-summary-sub">Төлбөрийн хэлбэр & хувь</div>
              <div className="erp-pay-row">
                <select {...register("payment_type")} style={{flex: 1}}>
                  <option value="Урьдчилгаа">Урьдчилгаа</option>
                  <option value="Бэлэн">Бэлэн</option>
                  <option value="Дансаар">Дансаар</option>
                </select>
                <div style={{width:'64px'}}><input type="number" step="any" className="erp-pct erp-mono" {...register("deposit_percent")} style={{width: '100%', padding: '7px 9px'}} /></div>
              </div>
              <div className="erp-pay-bar"><div className="erp-a" style={{width: `${formValues.deposit_percent || 0}%`}}></div><div className="erp-b" style={{width: `${100 - (formValues.deposit_percent || 0)}%`}}></div></div>

              <div className="erp-field" style={{marginBottom:'10px'}}>
                <label>Санхүүгийн тайлбар, тэмдэглэл</label>
                <textarea {...register("financial_notes")} style={{minHeight:'44px'}}></textarea>
              </div>

              <div className="erp-grid erp-grid-2 erp-status-select">
                <div className="erp-field">
                  <label>Төлөв</label>
                  <select {...register("current_status")}>
                    {groupedConstants['ORDER_STATUS']?.map((c: any) => (
                      <option key={c.id} value={c.value}>{c.value}</option>
                    ))}
                  </select>
                </div>
                <div className="erp-field">
                  <label>Дараагийн процесс</label>
                  <select {...register("next_process")}>
                    <option value="">Сонгох...</option>
                    {groupedConstants['NEXT_PROCESS']?.map((c: any) => (
                      <option key={c.id} value={c.value}>{c.value}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Захиалгын хураангуй (Хураангуйлсан/Маш жижиг) */}
              <div style={{ marginTop: '12px', fontSize: '11.5px', background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: '9px', padding: '10px' }}>
                <div style={{ fontWeight: 600, color: 'var(--muted-2)', textTransform: 'uppercase', marginBottom: '8px' }}>Задаргаа</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--muted)' }}>Захиалгын тоо:</span>
                  <span style={{ fontWeight: 600 }}>{Number(formValues.total_qty || 0).toLocaleString()} ш</span>
                </div>
                {formValues.design_cost ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--muted)' }}>Эх бэлтгэл:</span>
                    <span style={{ fontWeight: 600 }}>{Math.round(formValues.design_cost).toLocaleString()} ₮</span>
                  </div>
                ) : null}
              </div>

            </div>

            <div className="erp-summary-actions">
              {isCalculatorMode ? (
                <>
                  <button type="submit" onClick={() => setSubmitType('Шинэ захиалга')} className="erp-btn erp-btn-primary erp-btn-block">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 5v14M5 12h14"/></svg> Захиалга үүсгэх
                  </button>
                  <button type="submit" onClick={() => setSubmitType('Үнийн санал')} className="erp-btn erp-btn-ghost erp-btn-block">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z"/><path d="M17 21v-8H7v8M7 3v5h8"/></svg> Үнийн санал хадгалах
                  </button>
                </>
              ) : (
                <>
                  <button type="submit" className="erp-btn erp-btn-primary erp-btn-block">
                    {submitType === 'Үнийн санал' ? '💾 Үнийн санал шинэчлэх' : (isEdit ? '💾 Захиалга шинэчлэх' : '💾 Захиалга бүртгэх')}
                  </button>
                  {isEdit && initialData?.current_status === 'Үнийн санал' && (
                    <button type="submit" onClick={() => setSubmitType('Шинэ захиалга')} className="erp-btn erp-btn-ghost erp-btn-block">
                      📦 Захиалга болгож батлах
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>'''

    # Find where <div className="rail" id="rail-summary"> starts
    # and replace everything up to the final </div> of that rail.
    
    # Actually, we can just split content by `<div className="rail" id="rail-summary">`
    # The rail is the last element inside `<div className="erp-layout">`.
    # Following it is `      </div> {/* End of erp-layout */} \n      </form>`
    
    match = re.search(r'<div className="rail" id="rail-summary">.*?</form>', content, flags=re.DOTALL)
    if match:
        content = content[:match.start()] + new_sidebar + '\n      </div>\n      </form>' + content[match.end():]
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print("Done")

process_file('src/components/orders/OrderForm.tsx')

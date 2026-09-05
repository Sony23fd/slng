"use client";

import { evaluate } from 'mathjs';
import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { usePriceCalculator } from '../../hooks/usePriceCalculator';
import { useAuthStore } from '../../stores/useAuthStore';
import { useRouter } from 'next/navigation';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { parseMaterial } from '../../utils/parseMaterial';
import { calculatePaperDivision } from '../../utils/paperSizes';
import CalculationHelpBadge from '../common/CalculationHelpBadge';

interface OrderFormValues {
  // 1. Үндсэн
  customer_name: string;
  phone: string;
  company_name?: string;
  company_registry?: string;
  order_type?: string;
  lead_source?: string;
  deadline: string;
  product_name: string;
  category: string;
  total_qty: number;
  size: string;
  sub_size: string;
  custom_width?: number;
  custom_height?: number;
  needs_design: boolean;
  design_status: string;
  design_cost: number;
  is_urgent: boolean;
  sales_person_name: string;
  notes: string;
  binding_type?: string;
  has_printed_endpaper?: boolean;
  
  // 2. Өнгө
  cover_color: string;
  inner_color: string;
  
  // 3. Хавчуурга
  has_bookmark: string;
  
  // 4. Нүүр
  total_pages: number;
  print_cost: number;
  
  // 5. Материал
  materials: { 
    material_name: string; size: string; print_size: string; press_sheet: string; 
    base_qty: number; extra_qty: number; total_qty: number; divide_by: number; 
    sheet_qty: number; unit_cost: number; notes: string; is_cover?: boolean;
  }[];
  
  // 6. Ажиллагаа
  operations: { operation_name: string; qty: number; unit_cost: number; notes: string; is_manual?: boolean }[];
  
  // 8. Гадуур ажил
  outsourced: { job_name: string; contractor_name?: string; qty: number; unit_cost: number; notes: string }[];
  
  // 8. Санхүү
  profit_margin: number;
  payment_method_1: string;
  payment_percent_1: number;
  payment_method_2: string;
  payment_percent_2: number;
  has_vat: boolean;
  finance_notes: string;
  status: string;
  next_process: string;
}


// helpers for folding algorithm
function popcount(n: number) {
  let count = 0;
  let val = Math.floor(n);
  while (val > 0) {
    count += val & 1;
    val >>= 1;
  }
  return count;
}


function getCoverLogic(size: string, bindingType: string, coverRules: any[] = []) {
  const s = size?.trim().toUpperCase() || '';
  const bt = bindingType?.trim().toLowerCase() || '';

  if (coverRules && coverRules.length > 0) {
    const rule = coverRules.find((r: any) => r.size?.trim().toUpperCase() === s && r.binding?.trim().toLowerCase() === bt);
    if (rule) return { pressSheet: rule.press_sheet, divideBy: rule.divide_by, printSize: rule.print_size };
  }

  if (s === 'A4' && bt === 'наалттай') return { pressSheet: 1.0, divideBy: 6, printSize: 'A3' };
  if (s === 'A4' && bt === 'үдээстэй') return { pressSheet: 0.5, divideBy: 4, printSize: 'A2' };
  if (s === 'A5' && bt === 'наалттай') return { pressSheet: 0.5, divideBy: 5, printSize: 'B3' };
  if (s === 'A5' && bt === 'үдээстэй') return { pressSheet: 0.25, divideBy: 4, printSize: 'A2' };
  if (s === 'B5' && bt === 'наалттай') return { pressSheet: 0.5, divideBy: 4, printSize: 'A2' };
  if (s === 'B5' && bt === 'үдээстэй') return { pressSheet: 0.5, divideBy: 5, printSize: 'B3' };

  // Hardcover (Хатуу хавтас) fallbacks
  if (s === 'A5' && (bt === 'хатуу хавтастай' || bt === 'хатуу')) return { pressSheet: 0.5, divideBy: 4, printSize: 'A2' };
  if (s === 'B5' && (bt === 'хатуу хавтастай' || bt === 'хатуу')) return { pressSheet: 1.0, divideBy: 5, printSize: 'B3' };
  if (s === 'A4' && (bt === 'хатуу хавтастай' || bt === 'хатуу')) return { pressSheet: 1.0, divideBy: 5, printSize: 'B3' };
  if (s === 'B4' && (bt === 'хатуу хавтастай' || bt === 'хатуу')) return { pressSheet: 1.0, divideBy: 4, printSize: 'A2' };

  // Foam Hardcover (Хөөсөн хатуу хавтас) fallbacks
  if (s === 'A4' && (bt === 'хөөсөн хатуу хавтастай' || bt === 'хөөсөн')) return { pressSheet: 1.0, divideBy: 3, printSize: 'B2' };
  if (s === 'A5' && (bt === 'хөөсөн хатуу хавтастай' || bt === 'хөөсөн')) return { pressSheet: 0.5, divideBy: 4, printSize: 'A2' };
  if (s === 'B5' && (bt === 'хөөсөн хатуу хавтастай' || bt === 'хөөсөн')) return { pressSheet: 0.5, divideBy: 4, printSize: 'A2' };
  
  return null;
}

function calculateSetups(pressSheet: number, divisions: number) {
  const fullSheets = Math.floor(pressSheet);
  const fraction = pressSheet - fullSheets;
  if (fraction === 0) return fullSheets;
  const fractionLeaves = Math.round(fraction * divisions);
  const fractionalSetups = popcount(fractionLeaves);
  return fullSheets + fractionalSetups;
}

const compactSelectStyles = {
  control: (base: any) => ({
    ...base,
    background: 'white',
    borderRadius: '6px',
    borderColor: '#cbd5e1',
    minHeight: '34px',
    height: '34px',
    maxHeight: '34px',
    boxSizing: 'border-box',
    fontSize: '12.8px',
    boxShadow: 'none',
    '&:hover': { borderColor: '#94a3b8' }
  }),
  valueContainer: (base: any) => ({ ...base, height: '34px', padding: '0 8px', display: 'flex', alignItems: 'center' }),
  input: (base: any) => ({ ...base, margin: 0, padding: 0 }),
  indicatorsContainer: (base: any) => ({ ...base, height: '34px' }),
  dropdownIndicator: (base: any) => ({ ...base, padding: '4px 6px' }),
  clearIndicator: (base: any) => ({ ...base, padding: '4px 4px' })
};

const tableSelectStyles = {
  control: (base: any) => ({
    ...base,
    background: 'white',
    borderRadius: '4px',
    borderColor: '#cbd5e1',
    minHeight: '32px',
    height: '32px',
    maxHeight: '32px',
    boxSizing: 'border-box',
    fontSize: '12.2px',
    boxShadow: 'none',
    '&:hover': { borderColor: '#94a3b8' }
  }),
  valueContainer: (base: any) => ({ ...base, height: '32px', padding: '0 6px', display: 'flex', alignItems: 'center' }),
  input: (base: any) => ({ ...base, margin: 0, padding: 0 }),
  indicatorsContainer: (base: any) => ({ ...base, height: '32px' }),
  dropdownIndicator: (base: any) => ({ ...base, padding: '2px 4px' }),
  clearIndicator: (base: any) => ({ ...base, padding: '2px 4px' })
};

const tableInputStyle: React.CSSProperties = {
  width: '100%',
  minWidth: '40px',
  height: '32px',
  lineHeight: '32px',
  padding: '0 6px',
  border: '1px solid #cbd5e1',
  borderRadius: '4px',
  fontSize: '12.2px',
  boxSizing: 'border-box'
};

const SectionCard = ({ id, step, title, sub, children }: any) => {
  const [collapsed, setCollapsed] = React.useState(false);
  return (
    <section className={`erp-card ${collapsed ? 'collapsed' : ''}`} id={id}>
      <div className="erp-card-head" onClick={() => setCollapsed(!collapsed)}>
        <div className="erp-left">
          <div className="step-badge">{step}</div>
          <div>
            <h2 style={{margin:0, fontSize:'13.8px', fontWeight:700}}>{title}</h2>
            {sub && <div className="sub" style={{fontSize:'11.5px', color:'var(--muted-2)', fontWeight:500, marginTop:'1px'}}>{sub}</div>}
          </div>
        </div>
        <svg className="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
      </div>
      <div className="erp-card-body">
        {children}
      </div>
    </section>
  );
};

const calculateMakeready = (baseQty: number): number => {
  if (baseQty <= 1000) return 100;
  if (baseQty <= 2000) return 150;
  if (baseQty <= 4000) return 200;
  if (baseQty <= 5000) return 300;
  if (baseQty <= 10000) return 400;
  if (baseQty <= 14999) return 500;
  if (baseQty <= 20000) return 600;
  if (baseQty <= 25000) return 800;
  if (baseQty <= 29999) return 900;
  return 1000;
};

export default function OrderForm({ initialData, isEdit, orderId, isQuoteMode }: { initialData?: any, isEdit?: boolean, orderId?: number, isQuoteMode?: boolean }) {
  const { token, user } = useAuthStore();
  const router = useRouter();
  const [isExpandedMaterial, setIsExpandedMaterial] = useState(user?.role === 'PRODUCTION' || user?.role === 'ADMIN');
  const [constants, setConstants] = useState<any[]>([]);
  const [coverRules, setCoverRules] = useState<any[]>([]);
  const [productCategories, setProductCategories] = useState<any[]>([]);
  const [masterPrices, setMasterPrices] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [formulas, setFormulas] = useState<any[]>([]);
  const [orderStatuses, setOrderStatuses] = useState<any[]>([]);
  const [bagDims, setBagDims] = useState({ height: 32, width: 24, gusset: 8, topFold: 6, bottomFold: 6 });

  const OP_CATEGORIES = [
    { name: 'Хэвлэл', keywords: ['хэвлэгч', 'хэвлэл', 'хальс', 'эх бэлтгэл', 'cd'] },
    { name: 'Угсралт / Оёдол', keywords: ['нугалаа', 'үдээ', 'наалт', 'оёо', 'дэвтэрлэгээ', 'шугамын', 'гараар'] },
    { name: 'Хавтас / Гадаргуу', keywords: ['бүрэлт', 'лак', 'клише', 'хатуу хавтас', 'кальк'] },
    { name: 'Зүсэлт / Хэлбэрт', keywords: ['огтлоо', 'хээлэгч', 'сприаль', 'бөгж', 'хэв дарагч', 'суурь', 'шалгах', 'нууцлал', 'тооцогч'] },
    { name: 'Бусад', keywords: [] }
  ];
  const [activeOpCategory, setActiveOpCategory] = useState<string>('Хэвлэл');

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/constants`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    })
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (Array.isArray(data)) {
          setConstants(data);
          if (!initialData) {
            const profit = data.find(c => c.type === 'DEFAULT_PROFIT_MARGIN')?.value;
            let defaultProfit = 2.3;
            if (profit) {
              const pNum = Number(profit);
              if (pNum > 100) defaultProfit = pNum / 100;
              else if (pNum > 10) defaultProfit = 2.3;
              else if (pNum > 0) defaultProfit = pNum;
            }
            const deposit = data.find(c => c.type === 'DEFAULT_DEPOSIT_PERCENT')?.value || 50;
            setValue('profit_margin', defaultProfit);
            setValue('payment_percent_1', Number(deposit));
            setValue('payment_percent_2', 100 - Number(deposit));
          }
        }
      })
      .catch(console.error);

    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/prices`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    })
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (Array.isArray(data)) setMasterPrices(data);
      })
      .catch(console.error);

    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/customers`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    })
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (Array.isArray(data)) setCustomers(data);
      })
      .catch(console.error);

    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/coverrules`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    })
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (Array.isArray(data)) setCoverRules(data);
      })
      .catch(console.error);

    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/product-categories`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    })
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (Array.isArray(data)) setProductCategories(data);
      })
      .catch(console.error);

    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/formulas`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    })
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (Array.isArray(data)) setFormulas(data);
      })
      .catch(console.error);

    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/templates`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    })
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (Array.isArray(data)) setTemplates(data);
      })
      .catch(console.error);

    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/order-statuses`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    })
      .then(r => r.ok ? r.json() : [])
      .then(d => {
        if (Array.isArray(d)) setOrderStatuses(d);
      })
      .catch(() => {});

  }, [token]);

  const groupedConstants = constants.reduce((acc, curr) => {
    if (!acc[curr.type]) acc[curr.type] = [];
    acc[curr.type].push(curr);
    return acc;
  }, {} as Record<string, any[]>);

  // Format deadline for date input
  const defaultDeadline = initialData?.deadline ? new Date(initialData.deadline).toISOString().split('T')[0] : '';
  
  const { register, control, watch, handleSubmit, setValue, getValues } = useForm<OrderFormValues>({
    defaultValues: initialData ? { ...initialData, deadline: defaultDeadline } : {
      customer_name: '', phone: '', company_name: '', company_registry: '', order_type: 'STANDARD', lead_source: 'Шууд харилцагч', deadline: '', product_name: '', category: '', total_qty: 0,
      size: '', sub_size: '', custom_width: 0, custom_height: 0, needs_design: false, design_status: 'Эх бэлэн', design_cost: 0, is_urgent: false, sales_person_name: user?.full_name || user?.name || '', notes: '',
      cover_color: '', inner_color: '', has_bookmark: '', total_pages: 0, print_cost: 0,
      materials: [{ material_name: '', size: '', print_size: '', press_sheet: '', base_qty: 0, extra_qty: 0, total_qty: 0, divide_by: 1, sheet_qty: 0, unit_cost: 0, notes: '' }],
      operations: [],
      outsourced: [],
      profit_margin: 2.3, payment_method_1: '', payment_percent_1: 50, payment_method_2: '', payment_percent_2: 50,
      has_vat: false, finance_notes: '', status: 'Санхүү хүлээгдэж буй', next_process: ''
    }
  });

  const { fields: materialFields, append: appendMaterial, remove: removeMaterial } = useFieldArray({ control, name: 'materials' });
  const { fields: opFields, append: appendOp, remove: removeOp, update: updateOp } = useFieldArray({ control, name: 'operations' });
  const { fields: outFields, append: appendOut, remove: removeOut } = useFieldArray({ control, name: 'outsourced' });


  const getA7Size = () => {
    const s = getValues('size');
    return s === 'Custom' ? `${getValues('custom_width') || 0}x${getValues('custom_height') || 0}` : (s || 'A5');
  };

  const evaluateDynamicFormula = (index: number, mOverrides: any = {}, globalOverrides: any = {}) => {
    const currentM = getValues(`materials.${index}`) || {};
    const m = { ...currentM, ...mOverrides };
    if (!m.formula_id) return false;
    const f = formulas.find(x => x.id === Number(m.formula_id));
    if (!f) return false;
    try {
      const a7 = globalOverrides.size !== undefined ? globalOverrides.size : getA7Size();
      const b4 = globalOverrides.total_pages !== undefined ? globalOverrides.total_pages : (getValues('total_pages') || 0);
      const divs = calculatePaperDivision(m.print_size || 'A2', a7);
      const press = Number(m.press_sheet) || 1;
      const setups = calculateSetups(press, divs);
      const scope = {
        base_qty: Number(m.base_qty) || 0,
        extra_qty: Number(m.extra_qty) || 0,
        divide_by: Number(m.divide_by) || 1,
        press_sheet: press,
        total_pages: Number(b4) || 0,
        setups: setups
      };
      const total = evaluate(f.expression, scope);
      setValue(`materials.${index}.total_qty`, total);
      const divBy = Number(m.divide_by) || 1;
      setValue(`materials.${index}.sheet_qty`, Math.ceil(total / divBy));
      return true;
    } catch(e) {
      console.error("Formula eval error", e);
      return false;
    }
  };
  const formValues = watch();

  const [prevCategory, setPrevCategory] = useState(initialData?.category || '');
  const isApplyingTemplateRef = React.useRef(false);

  useEffect(() => {
    if (!formValues.category) return;
    if (isApplyingTemplateRef.current) {
      setPrevCategory(formValues.category);
      isApplyingTemplateRef.current = false;
      return;
    }
    if (formValues.category !== prevCategory) {
      setPrevCategory(formValues.category);
      // Find the category config
      const catConfig = productCategories.find(c => c.name === formValues.category);
      if (catConfig) {
        try {
          const defaults = catConfig.default_operations ? (Array.isArray(catConfig.default_operations) 
            ? catConfig.default_operations 
            : JSON.parse(catConfig.default_operations)) : [];
          
          const currentOps = getValues('operations') || [];
          // Хуучин Үндсэн ажиллагаануудыг устгах (зөвхөн гараар нэмсэн нь үлдэнэ)
          let newOps = currentOps.filter((o: any) => o.notes !== 'Үндсэн ажиллагаа');

          if (Array.isArray(defaults) && defaults.length > 0) {
            defaults.forEach((opName: string) => {
              const mp = masterPrices.find(m => m.category === 'Ажиллагаа' && m.item_name === opName);
              newOps.push({
                operation_name: opName,
                qty: 0, // will be auto-calculated later by evaluateOperationFormula
                unit_cost: mp ? mp.unit_cost : 0,
                notes: 'Үндсэн ажиллагаа',
                is_manual: false
              });
            });
          }

          setValue('operations', newOps);
        } catch(e) {
          console.error("Failed to parse default operations", e);
        }

        try {
          const defMats = catConfig.default_materials ? (Array.isArray(catConfig.default_materials) 
            ? catConfig.default_materials 
            : JSON.parse(catConfig.default_materials)) : [];
          
          const currentMats = getValues('materials') || [];
          let newMats = currentMats.filter((m: any) => m.notes !== 'Үндсэн материал');

          if (Array.isArray(defMats) && defMats.length > 0) {
            defMats.forEach((matName: string) => {
              const mp = masterPrices.find(m => m.category === 'Материал' && m.item_name === matName);
              newMats.push({
                material_name: matName,
                is_cover: false, 
                print_size: '',
                size: '',
                press_sheet: '',
                base_qty: 0,
                extra_qty: 0,
                divide_by: 1,
                sheet_qty: 0,
                unit_cost: mp ? mp.unit_cost : 0,
                total_qty: 0,
                notes: 'Үндсэн материал'
              });
            });
          }
          setValue('materials', newMats);
        } catch(e) {
          console.error("Failed to parse default materials", e);
        }
      }
    }
  }, [formValues.category, prevCategory, productCategories, masterPrices, getValues, setValue]);

  const pricingParams = {
    total_product_qty: Number(formValues.total_qty) || 0,
    materials: formValues.materials || [],
    operations: formValues.operations || [],
    outsourced: formValues.outsourced || [],
    profit_margin: Number(formValues.profit_margin) || 0,
    has_vat: formValues.has_vat || false,
    print_cost: Number(formValues.print_cost) || 0,
    design_cost: Number(formValues.design_cost) || 0,
  };

  const prices = usePriceCalculator(pricingParams);

  const [displayUnitPrice, setDisplayUnitPrice] = useState<string>('');

  useEffect(() => {
    const calcPlates = (colorStr: string, pressSheet: number, divisions: number) => {
      if (!colorStr || !pressSheet) return 0;
      const parts = colorStr.split('+').map(Number);
      if (parts.length !== 2) return 0;
      const front = parts[0] || 0;
      const back = parts[1] || 0;
      const platesPerFull = front + back;
      if (platesPerFull === 0) return 0;

      const fullSheets = Math.floor(pressSheet);
      const fraction = pressSheet - fullSheets;

      let fractionalSetups = 0;
      if (fraction > 0) {
        const fractionLeaves = Math.round(fraction * divisions);
        fractionalSetups = popcount(fractionLeaves);
      }
      
      const platesPerFraction = Math.max(front, back);
      return (fullSheets * platesPerFull) + (fractionalSetups * platesPerFraction);
    };

    const b1 = formValues.cover_color;
    const b2 = formValues.inner_color;
    const mats = formValues.materials || [];
    const ops = getValues('operations') || [];
    
    const ctpPriceStr = constants.find(c => c.type === 'CTP_PLATE_PRICE')?.value || '8800';
    const ctpPrice = Number(ctpPriceStr);
    
    const requiredCtps: Record<string, number> = {};
    
    mats.forEach((m, i) => {
      const isCover = m.is_cover || false;
      const colorToUse = isCover ? b1 : b2;
      const currentA7Size = formValues.size === 'Custom' ? `${formValues.custom_width || 0}x${formValues.custom_height || 0}` : (formValues.size || 'A5');
      const a7 = currentA7Size;
      const divisions = calculatePaperDivision(m.print_size || 'A2', a7);
      const plates = calcPlates(colorToUse, Number(m.press_sheet) || 0, divisions);
      if (plates > 0) {
        const name = `CTP хавтан - ${m.material_name || `Материал ${i+1}`}`;
        requiredCtps[name] = (requiredCtps[name] || 0) + plates;
      }
    });

    let opsChanged = false;
    let newOps = [...ops];

    // Устгагдсан эсвэл тоо хэмжээ нь 0 болсон CTP хавтангуудыг устгах
    newOps = newOps.filter(o => {
      if ((o.operation_name || '').startsWith('CTP хавтан')) {
        if (!requiredCtps[o.operation_name]) {
          opsChanged = true;
          return false;
        }
      }
      return true;
    });

    // Шинээр нэмэгдсэн эсвэл тоо нь өөрчлөгдсөн CTP хавтангуудыг шинэчлэх
    Object.entries(requiredCtps).forEach(([name, qty]) => {
      const existing = newOps.find(o => o.operation_name === name);
      if (existing) {
        if (existing.qty !== qty || existing.unit_cost !== ctpPrice) {
          const index = newOps.indexOf(existing);
          newOps[index] = { ...existing, qty, unit_cost: ctpPrice };
          opsChanged = true;
        }
      } else {
        newOps.push({
          operation_name: name,
          qty,
          unit_cost: ctpPrice,
          notes: 'Автомат тооцоолол'
        });
        opsChanged = true;
      }
    });

    if (opsChanged) {
      setValue('operations', newOps);
    }
  }, [formValues.materials, formValues.cover_color, formValues.inner_color, constants, getValues, setValue, appendOp]);

  useEffect(() => {
    const currentRounded = Math.round(prices.unitPrice).toString();
    if (Math.abs(Number(displayUnitPrice) - prices.unitPrice) > 1) {
      setDisplayUnitPrice(currentRounded);
    }
  }, [prices.unitPrice, displayUnitPrice]);

  useEffect(() => {
    let perUnitCost = 0;
    let fixedCtpCost = 0;
    
    const parsePrice = (str: any) => {
      if (!str) return NaN;
      const num = Number(String(str).replace(/[^0-9.-]+/g, ""));
      return isNaN(num) ? NaN : num;
    };

    const getColorsCount = (colorStr: string) => {
      if (!colorStr) return 0;
      const match = colorStr.match(/(\d+)\s*\+\s*(\d+)/);
      if (match) return Number(match[1]) + Number(match[2]);
      const single = colorStr.match(/(\d+)/);
      if (single) return Number(single[1]);
      return 1;
    };

    if (formValues.cover_color) {
      const c = groupedConstants['COVER_COLOR']?.find((x: any) => x.value === formValues.cover_color);
      const parsedPrice = c ? parsePrice(c.description) : NaN;
      if (!isNaN(parsedPrice) && parsedPrice > 0) {
        const coverMats = formValues.materials?.filter((m: any) => m.is_cover) || [];
        let totalCoverSetups = 0;
        coverMats.forEach((m: any) => {
          const m4 = Number(m.press_sheet) || 0;
          const divs = Number(m.divide_by) || 1;
          totalCoverSetups += calculateSetups(m4, divs);
        });
        if (totalCoverSetups === 0) totalCoverSetups = 1;
        fixedCtpCost += parsedPrice * totalCoverSetups * getColorsCount(formValues.cover_color);
      } else {
        const p = masterPrices.find((x: any) => x.category === 'Хавтасны өнгө' && x.item_name === formValues.cover_color);
        if (p) perUnitCost += p.unit_cost;
      }
    }
    
    if (formValues.inner_color) {
      const c = groupedConstants['INNER_COLOR']?.find((x: any) => x.value === formValues.inner_color);
      const parsedPrice = c ? parsePrice(c.description) : NaN;
      if (!isNaN(parsedPrice) && parsedPrice > 0) {
        const innerMats = formValues.materials?.filter((m: any) => !m.is_cover) || [];
        let totalInnerSetups = 0;
        innerMats.forEach((m: any) => {
          const m4 = Number(m.press_sheet) || 0;
          const divs = Number(m.divide_by) || 1;
          totalInnerSetups += calculateSetups(m4, divs);
        });
        if (totalInnerSetups === 0) totalInnerSetups = 1;
        fixedCtpCost += parsedPrice * totalInnerSetups * getColorsCount(formValues.inner_color);
      } else {
        const p = masterPrices.find((x: any) => x.category === 'Дотор өнгө' && x.item_name === formValues.inner_color);
        if (p) perUnitCost += p.unit_cost;
      }
    }
    
    const finalCost = (perUnitCost * (Number(formValues.total_qty) || 0)) + fixedCtpCost;
    setValue('print_cost', finalCost);
  }, [formValues.cover_color, formValues.inner_color, formValues.total_qty, formValues.materials, masterPrices, setValue, groupedConstants]);

  const recalculateMaterialsOnSizeChange = (newSize: string, w?: number, h?: number) => {
    let a7 = newSize;
    if (newSize === 'Custom' && w && h) {
      a7 = `${w}x${h}`;
    }
    const b4 = Number(getValues('total_pages')) || 0;
    const a6 = Number(getValues('total_qty')) || 0;
    const bt = getValues('binding_type') || '';
    const materials = getValues('materials') || [];
    
    materials.forEach((m, index) => {
      const isCover = m.is_cover || false;
      const coverLogic = isCover ? getCoverLogic(a7, bt, coverRules) : null;
      let m4 = 0;
      let divBy = Number(m.divide_by) || 1;

      if (coverLogic) {
        m4 = coverLogic.pressSheet;
        divBy = coverLogic.divideBy;
        setValue(`materials.${index}.press_sheet`, String(m4));
        setValue(`materials.${index}.divide_by`, divBy);
        if (coverLogic.printSize) {
          setValue(`materials.${index}.print_size`, coverLogic.printSize);
        }
      } else {
        const targetPages = isCover ? 4 : b4;
        if (m.print_size && a7) {
          const newDivs = calculatePaperDivision(m.print_size, a7);
          
          const matDivs = calculatePaperDivision(m.size || 'A0', m.print_size);
          if (matDivs > 0) {
            setValue(`materials.${index}.divide_by`, matDivs);
            divBy = matDivs;
          }

          if (targetPages > 0) {
            const pagesPerSheet = newDivs * 2;
            if (pagesPerSheet > 0) {
              m4 = targetPages / pagesPerSheet;
              setValue(`materials.${index}.press_sheet`, String(m4));
            }
          }
        }
      }

      if (m4 > 0) {
        const base = Number(m.base_qty) || a6;
        const extra = calculateMakeready(base);
        setValue(`materials.${index}.extra_qty`, extra);
        const divs = divBy;
        const setups = calculateSetups(m4, divs);
        const total = (base * m4) + (extra * setups);
        setValue(`materials.${index}.total_qty`, total);
        if (!evaluateDynamicFormula(index, { size: a7 })) {
          setValue(`materials.${index}.sheet_qty`, Math.ceil(total / divBy));
        }
      }
    });
  };

  const handleAddHardcoverAuxiliary = () => {
    const size = (getValues('size') || 'A5').toUpperCase();
    const totalQty = Number(getValues('total_qty')) || 1000;
    const isPrintedEndpaper = !!getValues('has_printed_endpaper');
    const hasRibbon = !!getValues('has_bookmark');
    
    let cardboardDiv = 14;
    let endpaperDiv = 8;
    let endpaperPrinted = { printSize: 'A2', pressSheet: '0.5', divBy: 4, extra: 100, baseMultiplier: 0.5 };
    let headbandDiv = 25;
    let ribbonLength = 0.30;
    let opName = 'Хатуу хавтас (A5)';

    if (size === 'B5') {
      cardboardDiv = 9;
      endpaperDiv = 5;
      endpaperPrinted = { printSize: 'B3', pressSheet: '1.0', divBy: 5, extra: 100, baseMultiplier: 1.0 };
      headbandDiv = 16;
      ribbonLength = 0.33;
      opName = 'Хатуу хавтас (B5)';
    } else if (size === 'A4') {
      cardboardDiv = 7;
      endpaperDiv = 4;
      endpaperPrinted = { printSize: 'B3', pressSheet: '1.0', divBy: 4, extra: 100, baseMultiplier: 1.0 };
      headbandDiv = 14;
      ribbonLength = 0.38;
      opName = 'Хатуу хавтас (A4)';
    } else if (size === 'B4') {
      cardboardDiv = 4.5;
      endpaperDiv = 2.5;
      endpaperPrinted = { printSize: 'A2', pressSheet: '1.0', divBy: 5, extra: 100, baseMultiplier: 2.0 };
      headbandDiv = 12;
      ribbonLength = 0.44;
      opName = 'Хатуу хавтас (B4)';
    }

    const existingMaterials = getValues('materials') || [];
    const cleanMaterials = existingMaterials.filter(m => {
      const name = m.material_name || '';
      const notes = m.notes || '';
      return !name.includes('Картон') && !notes.includes('картон') &&
             !name.includes('Форзац') && !notes.includes('Форзац') && !notes.includes('форзац') &&
             !name.includes('капитал') && !notes.includes('Капитал') &&
             !name.includes('Хавчуурга') && !notes.includes('Хавчуурга');
    });

    const cardboardPrice = masterPrices.find(p => p.item_name.includes('Картон 2'))?.unit_cost || 6300;
    const endpaperPrice = masterPrices.find(p => p.item_name.includes('Мат цаас 200гр') || p.item_name.includes('200гр'))?.unit_cost || 1200;
    const capitalPrice = masterPrices.find(p => p.item_name.includes('капитал'))?.unit_cost || 0;
    const ribbonPrice = masterPrices.find(p => p.item_name.includes('Хавчуурга тууз'))?.unit_cost || 0;

    const cardboardSheets = Math.ceil(totalQty / cardboardDiv);
    const cardboardRow = {
      material_name: 'Картон 2 A0 (889x1194)',
      size: 'A0',
      print_size: '',
      press_sheet: '1',
      base_qty: totalQty,
      extra_qty: 0,
      total_qty: totalQty,
      divide_by: cardboardDiv,
      sheet_qty: cardboardSheets,
      unit_cost: cardboardPrice,
      notes: `Хатуу хавтасны картон (${cardboardDiv}ш гарна)`,
      is_cover: false
    };

    let endpaperRow: any;
    if (isPrintedEndpaper) {
      const endpaperTotal = (totalQty * endpaperPrinted.baseMultiplier) + endpaperPrinted.extra;
      const endpaperSheets = Math.ceil(endpaperTotal / endpaperPrinted.divBy);
      endpaperRow = {
        material_name: 'Мат цаас 200гр A0 (889x1194)',
        size: 'A0',
        print_size: endpaperPrinted.printSize,
        press_sheet: endpaperPrinted.pressSheet,
        base_qty: totalQty,
        extra_qty: endpaperPrinted.extra,
        total_qty: endpaperTotal,
        divide_by: endpaperPrinted.divBy,
        sheet_qty: endpaperSheets,
        unit_cost: endpaperPrice,
        notes: `Хэвлэлтэй форзац (200гр)`,
        is_cover: false
      };
    } else {
      const endpaperSheets = Math.ceil(totalQty / endpaperDiv);
      endpaperRow = {
        material_name: 'Мат цаас 200гр A0 (889x1194)',
        size: 'A0',
        print_size: '',
        press_sheet: '1',
        base_qty: totalQty,
        extra_qty: 0,
        total_qty: totalQty,
        divide_by: endpaperDiv,
        sheet_qty: endpaperSheets,
        unit_cost: endpaperPrice,
        notes: `Хэвлэлгүй форзац (${endpaperDiv}ш гарна)`,
        is_cover: false
      };
    }

    const headbandMeters = Math.ceil(totalQty / headbandDiv);
    const headbandRow = {
      material_name: 'Номын капитал (м)',
      size: '',
      print_size: '',
      press_sheet: '1',
      base_qty: totalQty,
      extra_qty: 0,
      total_qty: totalQty,
      divide_by: headbandDiv,
      sheet_qty: headbandMeters,
      unit_cost: capitalPrice,
      notes: `Капитал тууз (1м-ээр ${headbandDiv} ном)`,
      is_cover: false
    };

    const newMaterials = [...cleanMaterials, cardboardRow, endpaperRow, headbandRow];

    if (hasRibbon) {
      const ribbonMeters = Math.ceil(totalQty * ribbonLength);
      const ribbonRow = {
        material_name: 'Хавчуурга тууз (м)',
        size: '',
        print_size: '',
        press_sheet: '1',
        base_qty: totalQty,
        extra_qty: 0,
        total_qty: totalQty,
        divide_by: 1,
        sheet_qty: ribbonMeters,
        unit_cost: ribbonPrice,
        notes: `Хавчуурга тууз (${Math.round(ribbonLength * 100)}см)`,
        is_cover: false
      };
      newMaterials.push(ribbonRow);
    }

    setValue('materials', newMaterials);

    const existingOps = getValues('operations') || [];
    if (!existingOps.some(o => o.operation_name?.includes('Хатуу хавтас'))) {
      const opMaster = masterPrices.find(p => p.item_name === opName);
      setValue('operations', [
        ...existingOps,
        {
          operation_name: opName,
          qty: totalQty,
          unit_cost: opMaster ? opMaster.unit_cost : (size === 'A4' ? 5000 : size === 'B5' ? 4000 : 3500),
          notes: `${size} хатуу хавтас угсрах, наах`
        }
      ]);
    }
  };

  const isOpInCategory = (opName: string, categoryName: string) => {
    const cat = OP_CATEGORIES.find(c => c.name === categoryName);
    if (!cat) return false;
    const lowerName = opName.toLowerCase();
    if (categoryName === 'Бусад') {
      const isAnyOther = OP_CATEGORIES.some(c => c.name !== 'Бусад' && c.keywords.some(kw => lowerName.includes(kw)));
      return !isAnyOther;
    }
    return cat.keywords.some(kw => lowerName.includes(kw));
  };

  const addQuickOp = (op: any) => {
    let calcQty = op.formula && op.formula.expression ? evaluateOperationFormula(op.formula.expression) : 0;
    appendOp({
      operation_name: op.item_name,
      qty: calcQty,
      unit_cost: op.unit_cost || 0,
      notes: op.item_name.startsWith('Бүрэлт') ? 'Бүрэлтийн хуулга' : ''
    });
  };

  const evaluateOperationFormula = (expression: string) => {
    try {
      const categoryConfig = productCategories.find((c: any) => c.name === getValues('category')) || {};
      const getColorsCount = (colorStr: string) => {
        if (!colorStr) return 0;
        const match = colorStr.match(/(\d+)\s*\+\s*(\d+)/);
        if (match) return Number(match[1]) + Number(match[2]);
        const single = colorStr.match(/(\d+)/);
        if (single) return Number(single[1]);
        return 1;
      };

      const materials = getValues('materials') || [];
      const innerMats = materials.filter((m: any) => !m.is_cover);
      const coverMats = materials.filter((m: any) => m.is_cover);

      const inner_press_sheet = innerMats.reduce((acc: number, m: any) => acc + (Number(m.press_sheet) || 0), 0);
      const cover_press_sheet = coverMats.reduce((acc: number, m: any) => acc + (Number(m.press_sheet) || 0), 0);
      const press_sheet = inner_press_sheet + cover_press_sheet;

      const inner_base_sheets = innerMats.reduce((acc: number, m: any) => acc + ((Number(m.base_qty) || 0) * (Number(m.press_sheet) || 0)), 0);
      const cover_base_sheets = coverMats.reduce((acc: number, m: any) => acc + ((Number(m.base_qty) || 0) * (Number(m.press_sheet) || 0)), 0);
      const total_base_sheets = inner_base_sheets + cover_base_sheets;

      const inner_printed_sheets = innerMats.reduce((acc: number, m: any) => acc + (Number(m.total_qty) || 0), 0);
      const cover_printed_sheets = coverMats.reduce((acc: number, m: any) => acc + (Number(m.total_qty) || 0), 0);
      const total_printed_sheets = inner_printed_sheets + cover_printed_sheets;

      const cover_sheets = coverMats.reduce((acc: number, m: any) => acc + (Number(m.base_qty) || 0) + (Number(m.extra_qty) || 0), 0);

      const scope = {
        total_qty: Number(getValues('total_qty')) || 0,
        total_pages: Number(getValues('total_pages')) || 0,
        waste_qty: Number(categoryConfig.waste_qty) || 0,
        cover_colors: getColorsCount(getValues('cover_color') || ''),
        inner_colors: getColorsCount(getValues('inner_color') || ''),
        press_sheet,
        cover_sheets,
        inner_base_sheets,
        cover_base_sheets,
        total_base_sheets,
        inner_printed_sheets,
        cover_printed_sheets,
        total_printed_sheets,
        inner_press_sheet,
        cover_press_sheet,
      };
      const res = evaluate(expression, scope);
      return Math.max(0, Math.ceil(res));
    } catch (e) {
      console.error('Operation formula error:', e);
      return 0;
    }
  };

  useEffect(() => {
    const ops = getValues('operations') || [];
    let changed = false;
    const newOps = ops.map((op: any) => {
      if (!op.operation_name) return op;
      if (op.is_manual) return op; // Гараар оруулсан бол тоог өөрчлөхгүй

      const mp = masterPrices.find(p => p.item_name === op.operation_name);
      if (mp && mp.formula && mp.formula.expression) {
        const newQty = evaluateOperationFormula(mp.formula.expression);
        if (newQty !== Number(op.qty)) {
          changed = true;
          return { ...op, qty: newQty };
        }
      }
      return op;
    });

    if (changed) {
      setValue('operations', newOps);
    }
  }, [formValues.materials, formValues.total_qty, formValues.total_pages, formValues.cover_color, formValues.inner_color, formValues.category, masterPrices, setValue]);

  useEffect(() => {
    const cat = formValues.category;
    const isBag = cat === 'Тор' || cat === 'Цаасан тор';
    const isBrochure = cat === 'Брошур';

    const a6 = Number(formValues.total_qty) || 0;
    const currentA7Size = formValues.size === 'Custom' ? `${formValues.custom_width || 0}x${formValues.custom_height || 0}` : (formValues.size || 'A4');
    const a7 = currentA7Size;
    const mats = getValues('materials') || [];

    if (isBag && (!formValues.size || !formValues.size.startsWith('Тор'))) {
      const fw = (bagDims.width + bagDims.gusset) * 2;
      const fh = bagDims.height + bagDims.topFold + bagDims.bottomFold;
      setValue('size', `Тор ${bagDims.width}х${bagDims.height}х${bagDims.gusset} (Дэлгээс: ${fw}х${fh}см)`);
    }

    mats.forEach((m: any, index: number) => {
      const matName = m.material_name || '';
      
      // Special logic for Бүрэлт
      if (matName.includes('Бүрэлт')) {
         const m3 = m.print_size || 'A3';
         let coef = 0.004;
         if (m3 === 'A2') { coef = 0.006; }
         else if (m3 === 'B2') { coef = 0.007; }
         else if (m3 === 'A3' || m3 === 'B3') { coef = 0.004; }

         const base = Number(m.base_qty) > 0 ? Number(m.base_qty) : a6;
         const extra = Number(m.extra_qty) || 0;
         const tQty = base + extra;
         
         if (Number(m.total_qty) !== tQty) setValue(`materials.${index}.total_qty`, tQty);
         const sQty = Number((tQty * coef).toFixed(2));
         if (Number(m.sheet_qty) !== sQty) setValue(`materials.${index}.sheet_qty`, sQty);
         if (Number(m.base_qty) !== base) setValue(`materials.${index}.base_qty`, base);
         if (Number(m.divide_by) !== 1) setValue(`materials.${index}.divide_by`, 1);
         return;
      }
      
      // Special logic for Оосор
      if (matName.includes('Оосор')) {
         const sQty = a6 * 2;
         if (Number(m.sheet_qty) !== sQty) setValue(`materials.${index}.sheet_qty`, sQty);
         if (Number(m.total_qty) !== sQty) setValue(`materials.${index}.total_qty`, sQty);
         if (Number(m.base_qty) !== sQty) setValue(`materials.${index}.base_qty`, sQty);
         if (Number(m.divide_by) !== 1) setValue(`materials.${index}.divide_by`, 1);
         return;
      }

      if (isBag || isBrochure) {
        const m3 = m.print_size || 'B2';
        let div = 1;
        let m5 = a6;
        if (isBag) {
          div = 1;
          m5 = a6;
          if (!m.print_size) setValue(`materials.${index}.print_size`, 'B2');
        } else {
          div = calculatePaperDivision(m3, a7) || 1;
          m5 = Math.ceil(a6 / div);
        }
        const m4 = '1';

        if (String(m.press_sheet) !== m4) setValue(`materials.${index}.press_sheet`, m4);
        if (Number(m.base_qty) !== m5) setValue(`materials.${index}.base_qty`, m5);

        const extra = calculateMakeready(m5);
        setValue(`materials.${index}.extra_qty`, extra);
        const setups = isBag ? extra : calculateSetups(1, div);
        const total = (m5 * 1) + setups;
        if (Number(m.total_qty) !== total) setValue(`materials.${index}.total_qty`, total);
        const divBy = Number(m.divide_by) || (isBag ? 2 : 1);
        if (isBag && Number(m.divide_by) !== divBy) setValue(`materials.${index}.divide_by`, divBy);
        const sQty = Math.ceil(total / divBy);
        if (Number(m.sheet_qty) !== sQty) setValue(`materials.${index}.sheet_qty`, sQty);
      }
    });
  }, [formValues.category, formValues.total_qty, formValues.size, formValues.materials, bagDims, setValue, getValues]);

  const [submitType, setSubmitType] = useState<string>('');
  const [showOperationsModal, setShowOperationsModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const onSubmit = (data: OrderFormValues) => {
    // Calculator mode default values for required fields
    if (submitType === 'Үнийн санал') {
      if (!data.customer_name) data.customer_name = 'Үнийн санал (Хадгалсан)';
      if (!data.product_name) data.product_name = 'Үнийн санал - бүтээгдэхүүн';
    } else {
      if (!data.customer_name?.trim() || !data.product_name?.trim()) {
        alert("Захиалга үүсгэхийн тулд 'Захиалагчийн нэр' болон 'Бүтээгдэхүүний нэр'-ийг заавал оруулна уу!");
        return;
      }
    }
    
    let targetStatus = initialData?.current_status || 'Санхүү хүлээгдэж буй';
    if (submitType === 'Үнийн санал') {
      targetStatus = 'Үнийн санал';
    } else if (submitType === 'Шинэ захиалга') {
      targetStatus = 'Санхүү хүлээгдэж буй';
    }

    const payload = { 
      ...data, 
      ...prices, 
      final_price: prices?.finalPrice || 0,
      current_status: targetStatus
    };
    const method = isEdit ? 'PUT' : 'POST';
    const url = isEdit ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/orders/${orderId}` : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/orders`;
    
    setIsSubmitting(true);
    fetch(url, {
      method,
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(resData => {
        setIsSubmitting(false);
        if (resData.error) {
          alert('Алдаа гарлаа: ' + resData.error + (resData.details ? '\nДэлгэрэнгүй: ' + resData.details : ''));
        } else {
          setIsSuccess(true);
          setTimeout(() => {
            alert(isEdit ? 'Захиалга амжилттай шинэчлэгдлээ!' : 'Захиалга амжилттай үүслээ!');
            router.push('/sales/orders');
          }, 300);
        }
      })
      .catch((e) => {
        setIsSubmitting(false);
        console.error(e);
      });
  };

  return (
    <div className="erp-shell">

    <div className="erp-main">

      <form onSubmit={handleSubmit(onSubmit)} onKeyDown={(e) => {
        if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
          e.preventDefault();
        }
      }}>
        
        {/* 3-Column Layout: Customer Sidebar + Product & Calc Column + Price Summary Rail */}
        <div className="erp-three-col-layout">
          
          {/* 1. Left Sidebar: Customer Information Panel */}
          <div className="erp-customer-panel">
            <div className="erp-card" style={{ borderTop: '3px solid #2563eb' }}>
              <div className="erp-card-head" style={{ background: '#f1f5f9', cursor: 'default' }}>
                <div className="left" style={{ gap: '6px' }}>
                  <span style={{ fontSize: '15px' }}>🤝</span>
                  <div>
                    <h2 style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>Харилцагчийн мэдээлэл</h2>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Захиалагч & Бүртгэл</div>
                  </div>
                </div>
              </div>
              
              <div className="erp-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div className="erp-field">
                  <label>Захиалагчийн нэр {isQuoteMode ? <span style={{fontWeight: 'normal', fontSize: '11px', color: '#64748b'}}>(сонголттой)</span> : <span style={{ color: 'red' }}>*</span>}</label>
                  <Controller
                    name="customer_name"
                    control={control}
                    render={({ field }) => (
                      <CreatableSelect
                        {...field}
                        options={customers.map(c => ({ value: c.name, label: c.name, customer: c }))}
                        onChange={(selected: any) => {
                          field.onChange(selected ? selected.value : '');
                          if (selected && selected.customer) {
                            setValue('phone', selected.customer.phone || '');
                            if (selected.customer.company_name) setValue('company_name', selected.customer.company_name);
                            if (selected.customer.company_registry) setValue('company_registry', selected.customer.company_registry);
                            if (selected.customer.discount_margin) {
                              const dm = Number(selected.customer.discount_margin);
                              const mult = dm > 100 ? dm / 100 : (dm > 10 ? 2.3 : dm);
                              setValue('profit_margin', mult);
                            }
                          }
                        }}
                        value={field.value ? { value: field.value, label: field.value } : null}
                        placeholder="Хайх эсвэл шинээр..."
                        isClearable
                        styles={{
                          control: (base) => ({
                            ...base,
                            background: 'white',
                            borderRadius: '6px',
                            borderColor: '#cbd5e1',
                            minHeight: '34px',
                            height: '34px',
                            fontSize: '12.5px'
                          }),
                          valueContainer: (base) => ({ ...base, padding: '0 6px' }),
                          indicatorsContainer: (base) => ({ ...base, height: '34px' })
                        }}
                      />
                    )}
                  />
                </div>

                <div className="erp-field">
                  <label title="[A2]">Утасны дугаар</label>
                  <input {...register("phone")} placeholder="9911..." />
                </div>

                <div className="erp-grid erp-grid-2" style={{ gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  <div className="erp-field">
                    <label>Байгууллагын нэр</label>
                    <input {...register("company_name")} placeholder="Компани..." />
                  </div>
                  <div className="erp-field">
                    <label>Регистр</label>
                    <input {...register("company_registry")} placeholder="РД..." />
                  </div>
                </div>

                <div className="erp-grid erp-grid-2" style={{ gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  <div className="erp-field">
                    <label>Захиалгын төрөл</label>
                    <select {...register("order_type")} defaultValue="STANDARD">
                      <option value="STANDARD">Стандарт</option>
                      <option value="BARTER">Бартер</option>
                      <option value="DONATION">Хандив</option>
                      <option value="INTERNAL">Дотоод</option>
                    </select>
                  </div>
                  <div className="erp-field">
                    <label>Эх үүсвэр</label>
                    <select {...register("lead_source")} defaultValue="Шууд харилцагч">
                      <option value="Шууд харилцагч">Шууд</option>
                      <option value="Сошиал медиа">Сошиал</option>
                      <option value="Утсаар">Утсаар</option>
                      <option value="Имэйлээр">Имэйл</option>
                      <option value="Гэрээт байгууллага">Гэрээт</option>
                      <option value="Хуучин харилцагч">Хуучин</option>
                    </select>
                  </div>
                </div>

                <div className="erp-field">
                  <label>Хүлээлгэн өгөх огноо</label>
                  <input type="date" {...register("deadline")} />
                </div>

                <div className="erp-field">
                  <label>Хаяг / Тэмдэглэл</label>
                  <textarea {...register("notes")} placeholder="Хаяг, хүргэлтийн санамж..." style={{ minHeight: '44px', fontSize: '12px' }} />
                </div>

                <div className="toggle-row" style={{ marginTop: '2px', padding: '5px 8px' }}>
                  <span className="t" style={{ fontSize: '11.8px' }}>⚡ Яаралтай захиалга</span>
                  <label className="switch">
                    <input type="checkbox" {...register("is_urgent")} />
                    <span className="track"></span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Center Column: Product & Calculation Workspace */}
          <div className="erp-calc-col">

            {/* Compact Presets & Templates Bar directly atop the calculation form */}
            <div className="compact-presets-bar">
              <div className="compact-presets-chips">
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  ⚡ Загварууд:
                </span>
                <button
                  type="button"
                  className="preset-chip-btn"
                  onClick={() => {
                    isApplyingTemplateRef.current = true;
                    setPrevCategory('Брошур');
                    setValue('category', 'Брошур');
                    setValue('product_name', 'Түгээмэл 1000ш Брошур');
                    setValue('size', 'A4');
                    setValue('total_qty', 1000);
                    setValue('materials', [{ material_name: 'Шохойтой 150гр', size: 'A4', print_size: 'A2', unit_cost: 150, notes: '', base_qty: 1000, extra_qty: 50, press_sheet: '1', total_qty: 1050, divide_by: 1, sheet_qty: 1050, is_cover: false }]);
                  }}
                >
                  📄 1000ш Брошур
                </button>
                <button
                  type="button"
                  className="preset-chip-btn"
                  onClick={() => {
                    isApplyingTemplateRef.current = true;
                    setPrevCategory('Тор');
                    setValue('category', 'Тор');
                    setValue('product_name', 'Стандарт Цаасан тор (32х24х8см)');
                    setBagDims({ height: 32, width: 24, gusset: 8, topFold: 6, bottomFold: 6 });
                    setValue('size', 'Тор 24х32х8 (Дэлгээс: 64х44см)');
                    setValue('total_qty', 1000);
                    setValue('materials', [{ material_name: 'Картон 250гр', size: '64х44см', print_size: 'B2', unit_cost: 400, notes: '', base_qty: 1000, extra_qty: 100, press_sheet: '1', total_qty: 1100, divide_by: 2, sheet_qty: 550, is_cover: false }]);
                  }}
                >
                  🛍️ 1000ш Цаасан тор
                </button>
                <button
                  type="button"
                  className="preset-chip-btn"
                  onClick={() => {
                    isApplyingTemplateRef.current = true;
                    setPrevCategory('Ном');
                    setValue('category', 'Ном');
                    setValue('product_name', 'Стандарт А5 Ном (160 хуудас)');
                    setValue('size', 'A5');
                    setValue('total_pages', 160);
                    setValue('binding_type', 'Наалттай');
                    setValue('total_qty', 1000);
                    setValue('materials', [
                      { material_name: 'Шохойтой 250гр', size: 'A5', print_size: 'A2', unit_cost: 300, notes: 'Хавтас', base_qty: 1000, extra_qty: 100, press_sheet: '0.5', total_qty: 600, divide_by: 2, sheet_qty: 300, is_cover: true },
                      { material_name: 'Офсет 80гр', size: 'A5', print_size: 'A2', unit_cost: 80, notes: 'Дотор хуудас', base_qty: 1000, extra_qty: 200, press_sheet: '10', total_qty: 10200, divide_by: 1, sheet_qty: 10200, is_cover: false }
                    ]);
                  }}
                >
                  📚 1000ш Ном
                </button>
                <button
                  type="button"
                  className="preset-chip-btn"
                  onClick={() => {
                    isApplyingTemplateRef.current = true;
                    setPrevCategory('Календарь');
                    setValue('category', 'Календарь');
                    setValue('product_name', 'Ширээний Календарь (A5, 26 нүүр)');
                    setValue('size', 'A5');
                    setValue('total_pages', 26);
                    setValue('total_qty', 300);
                    setValue('materials', [
                      { material_name: 'Мат цаас 250гр A0 (889x1194)', size: 'A5', print_size: 'A2', unit_cost: 1400, notes: 'Дотор 26 нүүр (13 хуудас)', base_qty: 300, extra_qty: 300, press_sheet: '1.625', total_qty: 787.5, divide_by: 4, sheet_qty: 197, is_cover: false },
                      { material_name: 'Мат цаас 300гр A0 (889x1194)', size: 'B3', print_size: 'B3', unit_cost: 1800, notes: 'Хавтас / Суурь (1ш гарна)', base_qty: 300, extra_qty: 100, press_sheet: '1', total_qty: 400, divide_by: 5, sheet_qty: 80, is_cover: true },
                      { material_name: 'Картон 2 A0 (889x1194)', size: 'A0', print_size: 'A0', unit_cost: 6300, notes: 'Суурь картон (12ш багтана)', base_qty: 300, extra_qty: 0, press_sheet: '1', total_qty: 300, divide_by: 12, sheet_qty: 25, is_cover: false }
                    ]);
                    setValue('operations', [
                      { operation_name: 'Бүрэлт', qty: 0.35, unit_cost: 1500, notes: 'Эхний 1 хуудсыг бүрнэ (44см хэмжээтэй хуулга)' },
                      { operation_name: 'Нуруу (Спирал үдээс А5)', qty: 7200, unit_cost: 20, notes: 'А5 календарт 24 ш (300 × 24 = 7200ш)' },
                      { operation_name: 'Суурь хийх (А5)', qty: 300, unit_cost: 1500, notes: 'Ширээний календарын хатуу картон суурь наах, угсрах' }
                    ]);
                  }}
                >
                  🗓️ 300ш Календарь (A5)
                </button>
                <button
                  type="button"
                  className="preset-chip-btn"
                  onClick={() => {
                    isApplyingTemplateRef.current = true;
                    setPrevCategory('Календарь');
                    setValue('category', 'Календарь');
                    setValue('product_name', 'Ширээний Календарь (B5, 26 нүүр)');
                    setValue('size', 'B5');
                    setValue('total_pages', 26);
                    setValue('total_qty', 300);
                    setValue('materials', [
                      { material_name: 'Мат цаас 250гр B1 (787x1092)', size: 'B5', print_size: 'B2', unit_cost: 1150, notes: 'Дотор 26 нүүр (13 хуудас)', base_qty: 300, extra_qty: 300, press_sheet: '1.625', total_qty: 787.5, divide_by: 2, sheet_qty: 394, is_cover: false },
                      { material_name: 'Мат цаас 300гр A0 (889x1194)', size: 'A2', print_size: 'A2', unit_cost: 1800, notes: 'Хавтас / Суурь (1ш гарна)', base_qty: 300, extra_qty: 100, press_sheet: '1', total_qty: 400, divide_by: 4, sheet_qty: 100, is_cover: true },
                      { material_name: 'Картон 2 A0 (889x1194)', size: 'A0', print_size: 'A0', unit_cost: 6300, notes: 'Суурь картон (8ш багтана)', base_qty: 300, extra_qty: 0, press_sheet: '1', total_qty: 300, divide_by: 8, sheet_qty: 38, is_cover: false }
                    ]);
                    setValue('operations', [
                      { operation_name: 'Бүрэлт', qty: 2.80, unit_cost: 1500, notes: 'Хавтас (2.4) болон эхний 1 хуудас (0.4) бүрнэ' },
                      { operation_name: 'Нуруу (Спирал үдээс B5)', qty: 8400, unit_cost: 20, notes: 'B5 календарт 28 ш (300 × 28 = 8400ш)' },
                      { operation_name: 'Суурь хийх (B5)', qty: 300, unit_cost: 1800, notes: 'B5 календарийн хатуу картон суурь наах, угсрах' }
                    ]);
                  }}
                >
                  🗓️ 300ш Календарь (B5)
                </button>
                <button
                  type="button"
                  className="preset-chip-btn"
                  onClick={() => {
                    isApplyingTemplateRef.current = true;
                    setPrevCategory('Календарь');
                    setValue('category', 'Календарь');
                    setValue('product_name', 'Ханын Календарь (A2, 14 нүүр / 7 хуудас)');
                    setValue('size', 'A2');
                    setValue('total_pages', 14);
                    setValue('total_qty', 500);
                    setValue('materials', [
                      { material_name: 'Мат цаас 250гр A0 (889x1194)', size: 'A2', print_size: 'A2', unit_cost: 1400, notes: '14 нүүр (7 хуудас / хэвлэлийн хуудас)', base_qty: 500, extra_qty: 100, press_sheet: '7', total_qty: 4200, divide_by: 4, sheet_qty: 1050, is_cover: false }
                    ]);
                    setValue('operations', [
                      { operation_name: 'Бүрэлт', qty: 3.12, unit_cost: 1500, notes: 'Эхний 1 хуудсыг бүрнэ (44см хэмжээтэй хуулга)' },
                      { operation_name: 'Нуруу (Спирал үдээс Ханын А2)', qty: 28000, unit_cost: 5, notes: 'А2 ханын календарт 3/8 хэмжээтэй 56 ш (500 × 56 = 28000ш)' }
                    ]);
                  }}
                >
                  🗓️ 500ш Ханын Кал. (A2)
                </button>
                <button
                  type="button"
                  className="preset-chip-btn"
                  onClick={() => {
                    isApplyingTemplateRef.current = true;
                    setPrevCategory('Ном');
                    setValue('category', 'Ном');
                    setValue('product_name', 'Стандарт А5 Хатуу хавтастай ном (160 хуудас)');
                    setValue('size', 'A5');
                    setValue('total_pages', 160);
                    setValue('binding_type', 'Хатуу хавтастай');
                    setValue('has_printed_endpaper', false);
                    setValue('has_bookmark', 'true');
                    setValue('total_qty', 1000);
                    setValue('materials', [
                      { material_name: 'Шохойтой 157гр', size: 'A2', print_size: 'A2', unit_cost: 250, notes: 'Хавтас (157гр)', base_qty: 1000, extra_qty: 100, press_sheet: '0.5', total_qty: 600, divide_by: 4, sheet_qty: 150, is_cover: true },
                      { material_name: 'Картон 2 A0 (889x1194)', size: 'A0', print_size: '', unit_cost: 6300, notes: 'Хатуу хавтасны картон (14ш гарна)', base_qty: 1000, extra_qty: 0, press_sheet: '1', total_qty: 1000, divide_by: 14, sheet_qty: 72, is_cover: false },
                      { material_name: 'Мат цаас 200гр A0 (889x1194)', size: 'A0', print_size: '', unit_cost: 1200, notes: 'Форзац (8ш гарна)', base_qty: 1000, extra_qty: 0, press_sheet: '1', total_qty: 1000, divide_by: 8, sheet_qty: 125, is_cover: false },
                      { material_name: 'Номын капитал (м)', size: '', print_size: '', unit_cost: 0, notes: 'Капитал тууз (1м-ээр 25 ном)', base_qty: 1000, extra_qty: 0, press_sheet: '1', total_qty: 1000, divide_by: 25, sheet_qty: 40, is_cover: false },
                      { material_name: 'Хавчуурга тууз (м)', size: '', print_size: '', unit_cost: 0, notes: 'Хавчуурга тууз (30см)', base_qty: 1000, extra_qty: 0, press_sheet: '1', total_qty: 1000, divide_by: 1, sheet_qty: 300, is_cover: false },
                      { material_name: 'Офсет 80гр', size: 'A5', print_size: 'A2', unit_cost: 80, notes: 'Дотор 160 нүүр', base_qty: 1000, extra_qty: 200, press_sheet: '10', total_qty: 10200, divide_by: 1, sheet_qty: 10200, is_cover: false }
                    ]);
                    setValue('operations', [
                      { operation_name: 'Хатуу хавтас (A5)', qty: 1000, unit_cost: 3500, notes: 'Хатуу хавтас угсрах, наах' }
                    ]);
                  }}
                >
                  📖 1000ш А5 Хатуу
                </button>
                <button
                  type="button"
                  className="preset-chip-btn"
                  onClick={() => {
                    isApplyingTemplateRef.current = true;
                    setPrevCategory('Ном');
                    setValue('category', 'Ном');
                    setValue('product_name', 'Стандарт В5 Хатуу хавтастай ном (160 хуудас)');
                    setValue('size', 'B5');
                    setValue('total_pages', 160);
                    setValue('binding_type', 'Хатуу хавтастай');
                    setValue('has_printed_endpaper', false);
                    setValue('has_bookmark', 'true');
                    setValue('total_qty', 1000);
                    setValue('materials', [
                      { material_name: 'Шохойтой 157гр', size: 'B3', print_size: 'B3', unit_cost: 250, notes: 'Хавтас (157гр)', base_qty: 1000, extra_qty: 100, press_sheet: '1.0', total_qty: 1100, divide_by: 5, sheet_qty: 220, is_cover: true },
                      { material_name: 'Картон 2 A0 (889x1194)', size: 'A0', print_size: '', unit_cost: 6300, notes: 'Хатуу хавтасны картон (9ш гарна)', base_qty: 1000, extra_qty: 0, press_sheet: '1', total_qty: 1000, divide_by: 9, sheet_qty: 112, is_cover: false },
                      { material_name: 'Мат цаас 200гр A0 (889x1194)', size: 'A0', print_size: '', unit_cost: 1200, notes: 'Форзац (5ш гарна)', base_qty: 1000, extra_qty: 0, press_sheet: '1', total_qty: 1000, divide_by: 5, sheet_qty: 200, is_cover: false },
                      { material_name: 'Номын капитал (м)', size: '', print_size: '', unit_cost: 0, notes: 'Капитал тууз (1м-ээр 16 ном)', base_qty: 1000, extra_qty: 0, press_sheet: '1', total_qty: 1000, divide_by: 16, sheet_qty: 63, is_cover: false },
                      { material_name: 'Хавчуурга тууз (м)', size: '', print_size: '', unit_cost: 0, notes: 'Хавчуурга тууз (33см)', base_qty: 1000, extra_qty: 0, press_sheet: '1', total_qty: 1000, divide_by: 1, sheet_qty: 330, is_cover: false },
                      { material_name: 'Офсет 80гр', size: 'B5', print_size: 'B2', unit_cost: 90, notes: 'Дотор 160 нүүр', base_qty: 1000, extra_qty: 200, press_sheet: '10', total_qty: 10200, divide_by: 1, sheet_qty: 10200, is_cover: false }
                    ]);
                    setValue('operations', [
                      { operation_name: 'Хатуу хавтас (B5)', qty: 1000, unit_cost: 4000, notes: 'Хатуу хавтас угсрах, наах' }
                    ]);
                  }}
                >
                  📖 1000ш В5 Хатуу
                </button>
                <button
                  type="button"
                  className="preset-chip-btn"
                  onClick={() => {
                    isApplyingTemplateRef.current = true;
                    setPrevCategory('Ном');
                    setValue('category', 'Ном');
                    setValue('product_name', 'Стандарт А4 Хатуу хавтастай ном (160 хуудас)');
                    setValue('size', 'A4');
                    setValue('total_pages', 160);
                    setValue('binding_type', 'Хатуу хавтастай');
                    setValue('has_printed_endpaper', false);
                    setValue('has_bookmark', 'true');
                    setValue('total_qty', 1000);
                    setValue('materials', [
                      { material_name: 'Шохойтой 157гр', size: 'B3', print_size: 'B3', unit_cost: 250, notes: 'Хавтас (157гр)', base_qty: 1000, extra_qty: 100, press_sheet: '1.0', total_qty: 1100, divide_by: 5, sheet_qty: 220, is_cover: true },
                      { material_name: 'Картон 2 A0 (889x1194)', size: 'A0', print_size: '', unit_cost: 6300, notes: 'Хатуу хавтасны картон (7ш гарна)', base_qty: 1000, extra_qty: 0, press_sheet: '1', total_qty: 1000, divide_by: 7, sheet_qty: 143, is_cover: false },
                      { material_name: 'Мат цаас 200гр A0 (889x1194)', size: 'A0', print_size: '', unit_cost: 1200, notes: 'Форзац (4ш гарна)', base_qty: 1000, extra_qty: 0, press_sheet: '1', total_qty: 1000, divide_by: 4, sheet_qty: 250, is_cover: false },
                      { material_name: 'Номын капитал (м)', size: '', print_size: '', unit_cost: 0, notes: 'Капитал тууз (1м-ээр 14 ном)', base_qty: 1000, extra_qty: 0, press_sheet: '1', total_qty: 1000, divide_by: 14, sheet_qty: 72, is_cover: false },
                      { material_name: 'Хавчуурга тууз (м)', size: '', print_size: '', unit_cost: 0, notes: 'Хавчуурга тууз (38см)', base_qty: 1000, extra_qty: 0, press_sheet: '1', total_qty: 1000, divide_by: 1, sheet_qty: 380, is_cover: false },
                      { material_name: 'Офсет 80гр', size: 'A4', print_size: 'A1', unit_cost: 120, notes: 'Дотор 160 нүүр', base_qty: 1000, extra_qty: 200, press_sheet: '20', total_qty: 20200, divide_by: 1, sheet_qty: 20200, is_cover: false }
                    ]);
                    setValue('operations', [
                      { operation_name: 'Хатуу хавтас (A4)', qty: 1000, unit_cost: 5000, notes: 'Хатуу хавтас угсрах, наах' }
                    ]);
                  }}
                >
                  📖 1000ш А4 Хатуу
                </button>
              </div>

              <div style={{ width: '220px', flex: 'none' }}>
                {(() => {
                  const groupedOptions = Object.values(templates.reduce((acc, t) => {
                    const cat = t.category || 'Бусад';
                    if (!acc[cat]) acc[cat] = { label: `📦 ${cat}`, options: [] };
                    acc[cat].options.push({ value: t.id, label: t.template_name, template: t });
                    return acc;
                  }, {} as Record<string, { label: string, options: any[] }>));
                  
                  return (
                    <Select
                      options={groupedOptions}
                      onChange={(selected: any) => {
                        if (selected && selected.template) {
                          isApplyingTemplateRef.current = true;
                          const t = selected.template;
                          if (t.category) {
                            setPrevCategory(t.category);
                            setValue('category', t.category);
                          }
                          if (t.size) setValue('size', t.size);
                          if (t.binding_type) setValue('binding_type', t.binding_type);
                          if (t.cover_color) setValue('cover_color', t.cover_color);
                          if (t.inner_color) setValue('inner_color', t.inner_color);
                          if (t.total_pages) setValue('total_pages', t.total_pages);
                          if (t.needs_design !== undefined) setValue('needs_design', t.needs_design);
                          if (t.design_status) setValue('design_status', t.design_status);
                          if (t.design_cost !== undefined) setValue('design_cost', t.design_cost);

                          if (t.order_data) {
                            const od = typeof t.order_data === 'string' ? JSON.parse(t.order_data) : t.order_data;
                            if (od.sub_size) setValue('sub_size', od.sub_size);
                            
                            if (od.materials && Array.isArray(od.materials)) {
                              const smartMaterials = od.materials.map((m: any) => {
                                const mp = masterPrices.find(p => p.item_name === m.material_name);
                                return {
                                  ...m,
                                  unit_cost: mp ? mp.unit_cost : m.unit_cost
                                };
                              });
                              setValue('materials', smartMaterials);
                            }
                            
                            if (od.operations && Array.isArray(od.operations)) {
                              const smartOperations = od.operations.map((o: any) => {
                                const mp = masterPrices.find(p => p.item_name === o.operation_name);
                                return {
                                  ...o,
                                  unit_cost: mp ? mp.unit_cost : o.unit_cost
                                };
                              });
                              setValue('operations', smartOperations);
                            }
                            
                            if (od.specifications) {
                              if (od.specifications.has_bookmark) setValue('has_bookmark', od.specifications.has_bookmark);
                              if (od.specifications.print_cost !== undefined) setValue('print_cost', od.specifications.print_cost);
                            }
                          }
                        }
                      }}
                      placeholder="🔍 Загвар хайх..."
                      isClearable
                      styles={compactSelectStyles}
                    />
                  );
                })()}
              </div>
            </div>

            {/* 2. Захиалгын мэдээлэл */}
            <SectionCard id="sec2" step="2" title="2. Захиалгын мэдээлэл">
          
          <div className="erp-grid erp-grid-3">
            <div className="erp-field"><label>Бүтээгдэхүүний нэр {isQuoteMode ? <span style={{fontWeight: 'normal', fontSize: '0.85rem', color: '#64748b'}}>(Захиалга үүсгэхэд заавал)</span> : <span style={{ color: 'red' }}>*</span>}</label><input {...register("product_name")} /></div>
            <div className="erp-field">
              <label>Бүтээгдэхүүний ангилал</label>
              <Controller
                name="category"
                control={control}
                render={({ field }) => {
                  const dbCategories = groupedConstants['CATEGORY']?.map((c: any) => ({ value: c.value, label: c.value })) || [
                    { value: 'Ном', label: 'Ном' }, { value: 'Сэтгүүл', label: 'Сэтгүүл' },
                    { value: 'Брошур', label: 'Брошур' }, { value: 'Календарь', label: 'Календарь' }
                  ];
                  const categoryOptions = [
                    { value: 'Түргэн хэвлэл', label: 'Түргэн хэвлэл (Quick Print)' },
                    { value: 'Тор', label: 'Тор (Цаасан тор)' },
                    ...dbCategories
                  ];
                  return (
                    <CreatableSelect
                      {...field}
                      options={categoryOptions}
                      onChange={(selected: any) => {
                        const val = selected ? selected.value : '';
                        field.onChange(val);
                        setValue('category', val);
                        if (val === 'Түргэн хэвлэл') {
                          // Force all existing materials to A3
                          const materials = getValues('materials') || [];
                          materials.forEach((m: any, index: number) => {
                            setValue(`materials.${index}.print_size`, 'A3');
                            setValue(`materials.${index}.extra_qty`, 0);
                          });
                        }
                      }}
                      value={field.value ? { value: field.value, label: field.value } : null}
                      placeholder="Сонгох эсвэл бичих..."
                      isClearable
                      styles={compactSelectStyles}
                    />
                  );
                }}
              />
            </div>
            <div className="erp-field">
              <label title="[A6]">Хэвлэгдэх тоо нийт</label>
              <input type="number" {...register("total_qty", {
                onChange: (e) => {
                  const a6 = Number(e.target.value) || 0;
                  const oldA6 = Number(getValues('total_qty')) || 0;
                  const materials = getValues('materials') || [];
                  materials.forEach((m, index) => {
                    const currentBase = Number(m.base_qty) || 0;
                    const isManualBase = currentBase > 0 && currentBase !== oldA6;
                    const newBase = isManualBase ? currentBase : a6;
                    setValue(`materials.${index}.base_qty`, newBase);
                    const press = Number(m.press_sheet) || 1;
                    const currentMaterialName = m.material_name || '';
                    const extra = currentMaterialName.includes('Бүрэлт') || currentMaterialName.includes('Оосор') ? (Number(m.extra_qty) || 0) : calculateMakeready(newBase);
                    setValue(`materials.${index}.extra_qty`, extra);
                    const a7 = getA7Size();
                    const divs = calculatePaperDivision(m.print_size || 'A2', a7);
                    const setups = calculateSetups(press, divs);
                    const total = (newBase * press) + (extra * setups);
                    setValue(`materials.${index}.total_qty`, total);
                    const divBy = Number(m.divide_by) || 1;
                    if (!evaluateDynamicFormula(index, { base_qty: newBase })) { setValue(`materials.${index}.sheet_qty`, Math.ceil(total / divBy)); }
                  });
                }
              })} />
            </div>
            <div className="erp-field">
              <label title="[A7]">Бүтээгдэхүүний хэмжээ</label>
              <Controller
                name="size"
                control={control}
                render={({ field }) => {
                  const sizeOptions = groupedConstants['SIZE']?.map((c: any) => ({ value: c.value, label: c.value })) || [
                    { value: 'A4', label: 'A4' }, { value: 'A5', label: 'A5' }, { value: 'B5', label: 'B5' }, { value: 'Custom', label: 'Custom' }
                  ];
                  return (
                    <CreatableSelect
                      {...field}
                      options={sizeOptions}
                      onChange={(selected: any) => {
                        const val = selected ? selected.value : '';
                        field.onChange(val);
                        recalculateMaterialsOnSizeChange(val, formValues.custom_width, formValues.custom_height);
                      }}
                      value={field.value ? { value: field.value, label: field.value } : null}
                      placeholder="Сонгох эсвэл бичих..."
                      isClearable
                      styles={compactSelectStyles}
                    />
                  );
                }}
              />
            </div>
            {formValues.size === 'Custom' && (
              <>
                <div className="erp-field">
                  <label>Өргөн (мм)</label>
                  <input type="number" placeholder="Өргөн" {...register("custom_width", {
                    valueAsNumber: true,
                    onChange: (e) => {
                      const w = Number(e.target.value) || 0;
                      recalculateMaterialsOnSizeChange('Custom', w, formValues.custom_height);
                    }
                  })} />
                </div>
                <div className="erp-field">
                  <label>Өндөр (мм)</label>
                  <input type="number" placeholder="Өндөр" {...register("custom_height", {
                    valueAsNumber: true,
                    onChange: (e) => {
                      const h = Number(e.target.value) || 0;
                      recalculateMaterialsOnSizeChange('Custom', formValues.custom_width, h);
                    }
                  })} />
                </div>
              </>
            )}

            <div className="erp-field">
              <label title="[A8]">Хавтасны төрөл</label>
              <select {...register("binding_type", {
                onChange: (e) => {
                  const bt = e.target.value;
                  const b4 = Number(getValues('total_pages')) || 0;
                  const a7 = getA7Size();
                  const materials = getValues('materials') || [];
                  materials.forEach((m, index) => {
                    const isCover = m.is_cover || false;
                    if (!isCover) return;
                    
                    const categoryConfig = productCategories.find((c: any) => c.name === getValues('category')) || {};
                    if (categoryConfig.calc_mode === 'STANDARD_MODE') return;
                    const coverLogic = getCoverLogic(a7, bt, coverRules);
                    if (coverLogic) {
                      const m4 = coverLogic.pressSheet;
                      const divBy = coverLogic.divideBy;
                      setValue(`materials.${index}.press_sheet`, String(m4));
                      setValue(`materials.${index}.divide_by`, divBy);
                      if (coverLogic?.printSize) {
                        setValue(`materials.${index}.print_size`, coverLogic.printSize);
                      }
                      
                      const base = Number(m.base_qty) || 0;
                      const extra = Number(m.extra_qty) || 0;
                      const divs = calculatePaperDivision(coverLogic?.printSize || m.print_size || 'A2', a7);
                      const setups = calculateSetups(m4, divs);
                      const total = (base * m4) + (extra * setups);
                      setValue(`materials.${index}.total_qty`, total);
                      if (!evaluateDynamicFormula(index, (e && e.target && e.target.name) ? { [e.target.name.split('.').pop()]: e.target.value } : {})) { setValue(`materials.${index}.sheet_qty`, Math.ceil(total / divBy)); }
                    }
                  });
                }
              })}>
                <option value="">Сонгох...</option>
                <option value="Наалттай">Наалттай</option>
                <option value="Үдээстэй">Үдээстэй</option>
                <option value="Хатуу хавтастай">Хатуу хавтастай</option>
                <option value="Хөөсөн хатуу хавтастай">Хөөсөн хатуу хавтастай</option>
              </select>
            </div>
            {(formValues.binding_type === 'Хатуу хавтастай' || formValues.binding_type === 'Хөөсөн хатуу хавтастай') && (
              <div className="erp-field col-span-full" style={{ gridColumn: '1 / -1', background: '#f8fafc', padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>📘 Хатуу хавтасны тохиргоо:</span>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.82rem', color: '#1e293b' }}>
                  <input 
                    type="checkbox" 
                    {...register("has_printed_endpaper")} 
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <span>📄 Хэвлэлтэй форзац</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.82rem', color: '#1e293b' }}>
                  <input 
                    type="checkbox" 
                    {...register("has_bookmark")} 
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <span>🔖 Хавчуурга туузтай</span>
                </label>
              </div>
            )}
            <div className="erp-field">
              <label>Эх бэлтгэлийн төлөв</label>
              <select {...register("design_status", {
                onChange: (e) => {
                  const val = e.target.value;
                  setValue('needs_design', val !== 'Эх бэлэн');
                  if (val === 'Эх бэлтгэл хийх') {
                    setValue('design_cost', 20000);
                  } else if (val === 'Засварлах шаардлагатай') {
                    setValue('design_cost', 10000);
                  } else {
                    setValue('design_cost', 0);
                  }
                }
              })}>
                <option value="Эх бэлэн">Эх бэлэн</option>
                <option value="Эх бэлтгэл хийх">Эх бэлтгэл хийх</option>
                <option value="Засварлах шаардлагатай">Засварлах шаардлагатай</option>
              </select>
            </div>
            {formValues.design_status !== 'Эх бэлэн' && (
              <div className="erp-field">
                <label>Эх бэлтгэлийн үнэ (₮)</label>
                <input type="number" {...register("design_cost", { valueAsNumber: true })} />
              </div>
            )}
          </div>

          {(formValues.category === 'Тор' || formValues.category === 'Цаасан тор') && (
            <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ margin: 0, color: '#1e293b', fontSize: '1rem', fontWeight: 'bold' }}>🛍️ Торны хэмжээ (см) болон Дэлгээс</h4>
                <CalculationHelpBadge
                  title="Цаасан торны дэлгээс хэмжээ"
                  formula="Дэлгээс Өргөн = (Өргөн + Хажуу) × 2 | Дэлгээс Өндөр = Өндөр + Амсар (6см) + Ёроол (6см)"
                  liveCalculation={`Дэлгээс: ${((bagDims.width + bagDims.gusset) * 2)}х{(bagDims.height + bagDims.topFold + bagDims.bottomFold)} см`}
                  details={[
                    "3 хэмжээст торыг хэвлэлийн цаасан дээр дэлгэхэд хажуу болон нугалааснууд нэмэгдэн тооцогдоно.",
                    "Амсар болон Ёроол нугалааг стандартаар тус бүр 6 см гэж авна."
                  ]}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
                <div className="erp-field">
                  <label>Өндөр (см)</label>
                  <input
                    type="number"
                    value={bagDims.height}
                    onChange={(e) => {
                      const h = Number(e.target.value) || 0;
                      const next = { ...bagDims, height: h };
                      setBagDims(next);
                      const fw = (next.width + next.gusset) * 2;
                      const fh = next.height + next.topFold + next.bottomFold;
                      setValue('size', `Тор ${next.width}х${next.height}х${next.gusset} (Дэлгээс: ${fw}х${fh}см)`);
                    }}
                  />
                </div>
                <div className="erp-field">
                  <label>Өргөн (см)</label>
                  <input
                    type="number"
                    value={bagDims.width}
                    onChange={(e) => {
                      const w = Number(e.target.value) || 0;
                      const next = { ...bagDims, width: w };
                      setBagDims(next);
                      const fw = (next.width + next.gusset) * 2;
                      const fh = next.height + next.topFold + next.bottomFold;
                      setValue('size', `Тор ${next.width}х${next.height}х${next.gusset} (Дэлгээс: ${fw}х${fh}см)`);
                    }}
                  />
                </div>
                <div className="erp-field">
                  <label>Хажуу (см)</label>
                  <input
                    type="number"
                    value={bagDims.gusset}
                    onChange={(e) => {
                      const g = Number(e.target.value) || 0;
                      const next = { ...bagDims, gusset: g };
                      setBagDims(next);
                      const fw = (next.width + next.gusset) * 2;
                      const fh = next.height + next.topFold + next.bottomFold;
                      setValue('size', `Тор ${next.width}х${next.height}х${next.gusset} (Дэлгээс: ${fw}х${fh}см)`);
                    }}
                  />
                </div>
                <div className="erp-field">
                  <label>Амсар нугалаа (см)</label>
                  <input
                    type="number"
                    value={bagDims.topFold}
                    onChange={(e) => {
                      const tf = Number(e.target.value) || 0;
                      const next = { ...bagDims, topFold: tf };
                      setBagDims(next);
                      const fw = (next.width + next.gusset) * 2;
                      const fh = next.height + next.topFold + next.bottomFold;
                      setValue('size', `Тор ${next.width}х${next.height}х${next.gusset} (Дэлгээс: ${fw}х${fh}см)`);
                    }}
                  />
                </div>
                <div className="erp-field">
                  <label>Ёроол нугалаа (см)</label>
                  <input
                    type="number"
                    value={bagDims.bottomFold}
                    onChange={(e) => {
                      const bf = Number(e.target.value) || 0;
                      const next = { ...bagDims, bottomFold: bf };
                      setBagDims(next);
                      const fw = (next.width + next.gusset) * 2;
                      const fh = next.height + next.topFold + next.bottomFold;
                      setValue('size', `Тор ${next.width}х${next.height}х${next.gusset} (Дэлгээс: ${fw}х${fh}см)`);
                    }}
                  />
                </div>
              </div>
              <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#eff6ff', borderLeft: '4px solid #3b82f6', color: '#1e3a8a', fontWeight: '500' }}>
                💡 Автомат бодогдсон Дэлгээс хэмжээ: <strong>Өргөн {((bagDims.width + bagDims.gusset) * 2)} см х Өндөр {(bagDims.height + bagDims.topFold + bagDims.bottomFold)} см</strong> ({((bagDims.width + bagDims.gusset) * 2) * 10}х{(bagDims.height + bagDims.topFold + bagDims.bottomFold) * 10} мм) — B2 эсвэл А2 хэвлэлийн хуудсанд 1 ш багтана.
              </div>
            </div>
          )}
        </SectionCard>

        {/* 2, 3, 4 Хавтас, Хавчуурга, Нүүр */}
        <SectionCard id="sec3" step="3" title="3-5. Технологийн мэдээлэл">
          
          <div className="erp-grid erp-grid-3">
            <div className="erp-field">
              <label>[B1] Хавтасны өнгө (Гадна)</label>
              <select {...register("cover_color")}>
                <option value="">Сонгох...</option>
                {groupedConstants['COVER_COLOR']?.map((c: any) => (
                  <option key={c.id} value={c.value}>{c.value}</option>
                ))}
              </select>
            </div>
            <div className="erp-field">
              <label>[B2] Хуудасны өнгө</label>
              <select {...register("inner_color")}>
                <option value="">Сонгох...</option>
                {groupedConstants['INNER_COLOR']?.map((c: any) => (
                  <option key={c.id} value={c.value}>{c.value}</option>
                ))}
                <option value="Custom (Тусгай)">Custom (Тусгай)</option>
              </select>
            </div>
            {formValues.inner_color === 'Custom (Тусгай)' && (
              <div className="erp-field">
                <label>[B3] Хавчуурга / Тусгай хуудасны тайлбар</label>
                <input {...register("has_bookmark")} placeholder="Жишээ: Дэлгэдэг 1 хуудас" />
              </div>
            )}
            <div className="erp-field">
              <label>[B4] Нийт нүүр (Хавтас орохгүй)</label>
              <input type="number" {...register("total_pages", {
                onChange: (e) => {
                  const b4 = Number(e.target.value) || 0;
                  const a7 = getA7Size();
                  const materials = getValues('materials') || [];
                  materials.forEach((m, index) => {
                    const isCover = m.is_cover || false;

                            const bt = getValues('binding_type') || '';
                            const categoryConfig = productCategories.find((c: any) => c.name === getValues('category')) || {};
                            const coverLogic = (isCover && categoryConfig.calc_mode !== 'STANDARD_MODE') ? getCoverLogic(a7, bt, coverRules) : null;
                            let m4 = 0;
                            let divBy = Number(m.divide_by) || 1;

                            if (coverLogic) {
                              m4 = coverLogic.pressSheet;
                              divBy = coverLogic.divideBy;
                              setValue(`materials.${index}.press_sheet`, String(m4));
                              setValue(`materials.${index}.divide_by`, divBy);
                              if (coverLogic?.printSize) {
                                setValue(`materials.${index}.print_size`, coverLogic.printSize);
                              }
                            } else {
                              const targetPages = isCover ? 4 : b4;
                              if (m.print_size && a7 && targetPages > 0) {
                                const pagesPerSheet = calculatePaperDivision(m.print_size, a7) * 2;
                                if (pagesPerSheet > 0) {
                                  m4 = targetPages / pagesPerSheet;
                                  setValue(`materials.${index}.press_sheet`, String(m4));
                                }
                              }
                            }

                            if (m4 > 0) {
                              const base = Number(m.base_qty) || 0;
                              const currentMaterialName = m.material_name || '';
                              const extra = currentMaterialName.includes('Бүрэлт') || currentMaterialName.includes('Оосор') ? (Number(m.extra_qty) || 0) : calculateMakeready(base);
                              setValue(`materials.${index}.extra_qty`, extra);
                              const divs = calculatePaperDivision(coverLogic?.printSize || m.print_size || 'A2', a7);
                              const setups = calculateSetups(m4, divs);
                              const total = (base * m4) + (extra * setups);
                              setValue(`materials.${index}.total_qty`, total);
                              if (!evaluateDynamicFormula(index, (e && e.target && e.target.name) ? { [e.target.name.split('.').pop()]: e.target.value } : {})) { setValue(`materials.${index}.sheet_qty`, Math.ceil(total / divBy)); }
                            }

                  });
                }
              })} />
            </div>
            <input type="hidden" {...register("print_cost")} />
          </div>


        </SectionCard>

        {/* 5. Материал */}
        <SectionCard id="sec6" step="6" title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <span>6. Шаардлагатай материал</span>
            <button 
              type="button" 
              onClick={() => setIsExpandedMaterial(!isExpandedMaterial)} 
              className="btn btn-outline" 
              style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', height: 'auto', minHeight: 'unset' }}
            >
              {isExpandedMaterial ? '[-] Хураангуйлах' : '[+] Дэлгэрэнгүй үйлдвэрлэлийн бодолт харах'}
            </button>
          </div>
        }>
          
          <div className="table-responsive" style={{ marginBottom: '1rem' }}>
            <table className="smart-table" style={{ minWidth: isExpandedMaterial ? '950px' : '500px' }}>
              <thead>
                {isExpandedMaterial ? (
                  <>
                    <tr>
                      <th rowSpan={2} title="[M1] Материалын нэр" style={{ padding: '0.4rem 0.3rem', borderRight: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#334155', fontWeight: '600', textAlign: 'left', minWidth: '160px' }}>Материал</th>
                      <th rowSpan={2} title="[M2] Хэмжээ" style={{ padding: '0.4rem 0.3rem', borderRight: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#334155', fontWeight: '600', textAlign: 'left', minWidth: '95px' }}>Хэмжээ</th>
                      <th rowSpan={2} title="[M3] Хэв. хэмжээ" style={{ padding: '0.4rem 0.3rem', borderRight: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#334155', fontWeight: '600', textAlign: 'center', width: '70px' }}>Хэв. хэмжээ</th>
                      <th rowSpan={2} style={{ padding: '0.4rem 0.3rem', borderRight: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#334155', fontWeight: '600', textAlign: 'center', width: '85px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span title="[M4] Хэв. хуудас">Хэв. хуудас</span>
                        </div>
                      </th>
                      <th colSpan={3} style={{ padding: '0.3rem', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', textAlign: 'center', fontSize: '0.8rem', color: '#334155', fontWeight: '600' }}>Хэвлэгдэх тоо</th>
                      <th rowSpan={2} style={{ padding: '0.4rem 0.3rem', borderRight: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#334155', fontWeight: '600', textAlign: 'center', width: '75px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span title="[M8] Хуваалт">Хуваалт</span>
                        </div>
                      </th>
                      <th rowSpan={2} style={{ padding: '0.4rem 0.3rem', borderRight: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#334155', fontWeight: '600', textAlign: 'center', width: '75px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span title="[M9] Тоо">Нийт (ш)</span>
                        </div>
                      </th>
                      <th colSpan={2} style={{ padding: '0.3rem', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', textAlign: 'center', fontSize: '0.8rem', color: '#334155', fontWeight: '600' }}>Өртөг</th>
                      <th rowSpan={2} title="[MC] Тэмдэглэл" style={{ padding: '0.4rem 0.3rem', fontSize: '0.8rem', color: '#334155', fontWeight: '600', textAlign: 'left', minWidth: '100px' }}>Тэмдэглэл</th>
                      <th rowSpan={2} style={{ padding: '0.4rem 0.3rem', width: '38px' }}></th>
                    </tr>
                    <tr>
                      <th style={{ padding: '0.25rem', borderRight: '1px solid #e2e8f0', fontSize: '0.7rem', color: '#64748b', fontWeight: 'normal', textAlign: 'center', width: '90px', background: '#f8fafc' }}>Үндсэн</th>
                      <th title="[M6] Хадаас" style={{ padding: '0.25rem', borderRight: '1px solid #e2e8f0', fontSize: '0.7rem', color: '#64748b', fontWeight: 'normal', textAlign: 'center', width: '80px', background: '#f8fafc' }}>Хадаас</th>
                      <th title="[M7] Нийт" style={{ padding: '0.25rem', borderRight: '1px solid #e2e8f0', fontSize: '0.7rem', color: '#64748b', fontWeight: 'normal', textAlign: 'center', width: '85px', background: '#f8fafc' }}>Бүгд</th>
                      <th title="[MA] Нэгж өртөг" style={{ padding: '0.25rem', borderRight: '1px solid #e2e8f0', fontSize: '0.7rem', color: '#64748b', fontWeight: 'normal', textAlign: 'center', width: '70px', background: '#f8fafc' }}>Нэгж</th>
                      <th title="[MB] Нийт өртөг" style={{ padding: '0.25rem', borderRight: '1px solid #e2e8f0', fontSize: '0.7rem', color: '#64748b', fontWeight: 'normal', textAlign: 'center', width: '80px', background: '#f8fafc' }}>Нийт</th>
                    </tr>
                  </>
                ) : (
                  <tr>
                    <th style={{ padding: '0.5rem 0.6rem', borderRight: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#334155', fontWeight: '600', textAlign: 'left', width: '48%' }}>Материал</th>
                    <th style={{ padding: '0.5rem 0.4rem', borderRight: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#334155', fontWeight: '600', textAlign: 'center', width: '12%' }}>Нэгж өртөг</th>
                    <th style={{ padding: '0.5rem 0.5rem', borderRight: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#334155', fontWeight: '600', textAlign: 'right', width: '13%' }}>Нийт өртөг</th>
                    <th style={{ padding: '0.5rem 0.5rem', borderRight: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#334155', fontWeight: '600', textAlign: 'right', width: '14%' }}>Нийт үнэ</th>
                    <th style={{ padding: '0.5rem 0.4rem', borderRight: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#334155', fontWeight: '600', textAlign: 'left', width: '13%' }}>Тэмдэглэл</th>
                    <th style={{ padding: '0.5rem 0.2rem', width: '38px', textAlign: 'center' }}></th>
                  </tr>
                )}
              </thead>
              <tbody>
                {materialFields.map((field, index) => {
                  const m = formValues.materials?.[index];
                  const amt = m?.sheet_qty || 0;
                  const tCost = amt * (m?.unit_cost || 0);

                  const currentMaterialName = formValues.materials?.[index]?.material_name || '';
                  const parsedMasterPrices = masterPrices
                    .filter(p => {
                      const c = (p.category || '').toLowerCase();
                      return c.includes('цаас') || c.includes('материал') || c.includes('paper') || c.includes('material') || c.includes('double side') || c.includes('tape');
                    })
                    .map(p => ({ ...p, ...parseMaterial(p.item_name) }));
                    
                  const uniqueBaseNames = Array.from(new Set(parsedMasterPrices.map(p => p.baseName)));
                  const availableSizes = parsedMasterPrices.filter(p => p.baseName === currentMaterialName);

                  const inputStyle = tableInputStyle;

                  const isSpecialCoating = currentMaterialName.includes('Бүрэлт');
                  const isSpecialStrap = currentMaterialName.includes('Оосор');
                  const isSpecialMat = isSpecialCoating || isSpecialStrap;
                  const disabledStyle = { ...inputStyle, backgroundColor: '#f1f5f9', color: '#94a3b8', cursor: 'not-allowed' };

                  return (
                    <tr key={field.id} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background-color 0.2s', backgroundColor: isSpecialMat ? '#fdf8f6' : 'transparent' }}>
                      <td style={{ padding: '0.25rem 0.3rem', borderRight: '1px solid #e2e8f0', verticalAlign: 'top', width: !isExpandedMaterial ? '48%' : undefined }}>
                        <Controller
                          name={`materials.${index}.material_name`}
                          control={control}
                          render={({ field }) => (
                            <Select
                              {...field}
                              options={uniqueBaseNames.map(name => ({ value: name, label: name }))}
                              onChange={(selectedOption: any) => {
                                const val = selectedOption ? selectedOption.value : '';
                                field.onChange(val);
                                if (val) {
                                  const newSizes = parsedMasterPrices.filter(p => p.baseName === val);
                                  if (newSizes.length === 1) {
                                    const singleSize = newSizes[0];
                                    setValue(`materials.${index}.size`, singleSize.sizeName);
                                    setValue(`materials.${index}.unit_cost`, singleSize.unit_cost);
                                    const printSize = formValues.materials?.[index]?.print_size || '';
                                    const ratio = calculatePaperDivision(singleSize.sizeName, printSize);
                                    const isCover = formValues.materials?.[index]?.is_cover;
                                    const bt = formValues.binding_type || '';
                                    const categoryConfig = productCategories.find((c: any) => c.name === formValues.category) || {};
                                    const coverLogic = (isCover && categoryConfig.calc_mode !== 'STANDARD_MODE') ? getCoverLogic(formValues.size || '', bt, coverRules) : null;
                                    if (ratio > 1 && !coverLogic) {
                                      setValue(`materials.${index}.divide_by`, ratio);
                                    }
                                  } else {
                                    setValue(`materials.${index}.size`, '');
                                    setValue(`materials.${index}.unit_cost`, 0);
                                  }
                                } else {
                                  setValue(`materials.${index}.size`, '');
                                  setValue(`materials.${index}.unit_cost`, 0);
                                }
                              }}
                              value={field.value ? { value: field.value, label: field.value } : null}
                              placeholder="Хайх..."
                              isClearable
                              menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                              menuPosition="fixed"
                              styles={{ ...tableSelectStyles, menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                            />
                          )}
                        />
                        {!isSpecialMat && (
                        <div style={{ marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <input type="checkbox" {...register(`materials.${index}.is_cover`, {
                            onChange: (e) => {
                              const isCov = e.target.checked;
                              const bt = getValues('binding_type') || '';
                              const b4 = Number(getValues('total_pages')) || 0;
                              const a7 = getA7Size();
                              
                              let coverLogic = null;
                              let m4 = Number(getValues(`materials.${index}.press_sheet`)) || 0;
                              let divBy = Number(getValues(`materials.${index}.divide_by`)) || 1;

                              const categoryConfig = productCategories.find((c: any) => c.name === getValues('category')) || {};
                              if ((categoryConfig.calc_mode === 'BOOK_MODE' || !categoryConfig.calc_mode || categoryConfig.calc_mode === 'null') && isCov) {
                                coverLogic = getCoverLogic(a7, bt, coverRules);
                                if (coverLogic) {
                                  m4 = coverLogic.pressSheet;
                                  divBy = coverLogic.divideBy;
                                  setValue(`materials.${index}.press_sheet`, String(m4));
                                  setValue(`materials.${index}.divide_by`, divBy);
                                  if (coverLogic?.printSize) {
                                    setValue(`materials.${index}.print_size`, coverLogic.printSize);
                                  }
                                }
                              } else if (categoryConfig.calc_mode === 'STANDARD_MODE') {
                                divBy = Number(getValues(`materials.${index}.divide_by`)) || 1;
                              } else {
                                const targetPages = isCov ? 4 : b4;
                                const printSize = getValues(`materials.${index}.print_size`);
                                if (printSize && a7 && targetPages > 0) {
                                  const pagesPerSheet = calculatePaperDivision(printSize, a7) * 2;
                                  if (pagesPerSheet > 0) {
                                    m4 = targetPages / pagesPerSheet;
                                    setValue(`materials.${index}.press_sheet`, String(m4));
                                  }
                                }
                              }

                              const base = Number(getValues(`materials.${index}.base_qty`)) || 0;
                              const currentMaterialName = getValues(`materials.${index}.material_name`) || '';
                              const extra = currentMaterialName.includes('Бүрэлт') || currentMaterialName.includes('Оосор') ? (Number(getValues(`materials.${index}.extra_qty`)) || 0) : calculateMakeready(base);
                              setValue(`materials.${index}.extra_qty`, extra);
                              const currentPrintSize = coverLogic?.printSize || getValues(`materials.${index}.print_size`) || 'A2';
                              const divs = calculatePaperDivision(currentPrintSize, a7);
                              const setups = calculateSetups(m4, divs);
                              const total = (base * m4) + (extra * setups);
                              setValue(`materials.${index}.total_qty`, total);
                              
                              if (!evaluateDynamicFormula(index, { is_cover: isCov, press_sheet: m4, divide_by: divBy })) { 
                                setValue(`materials.${index}.sheet_qty`, Math.ceil(total / divBy)); 
                              }
                            }
                          })} />
                          <label style={{ fontSize: '0.75rem', color: '#475569', cursor: 'pointer', margin: 0 }}>Хавтас</label>
                        </div>
                        )}
                      </td>
                      {isExpandedMaterial && (
                      <td style={{ padding: '0.25rem 0.3rem', borderRight: '1px solid #e2e8f0', verticalAlign: 'top' }}>
                        <Controller
                          name={`materials.${index}.size`}
                          control={control}
                          render={({ field }) => (
                            <Select
                              {...field}
                              options={availableSizes.map(p => ({ value: p.sizeName, label: p.sizeName || 'Үндсэн (Хэмжээгүй)', unit_cost: p.unit_cost }))}
                              onChange={(selectedOption: any) => {
                                const val = selectedOption ? selectedOption.value : '';
                                field.onChange(val);
                                if (selectedOption) {
                                  setValue(`materials.${index}.unit_cost`, selectedOption.unit_cost);
                                  const printSize = formValues.materials?.[index]?.print_size || '';
                                  let finalDivBy = Number(formValues.materials?.[index]?.divide_by) || 1;
                                  const ratio = calculatePaperDivision(val, printSize);
                                  if (ratio > 0) {
                                    setValue(`materials.${index}.divide_by`, ratio);
                                    finalDivBy = ratio;
                                  }
                                  const totalQty = Number(formValues.materials?.[index]?.total_qty) || 0;
                                  if (!evaluateDynamicFormula(index, { divide_by: finalDivBy })) {
                                    setValue(`materials.${index}.sheet_qty`, Math.ceil(totalQty / finalDivBy));
                                  }
                                  // M4 is no longer calculated from M2, but from M3 and A7
                                }
                              }}
                              value={field.value ? { value: field.value, label: field.value || (field.value === '' && availableSizes.length > 0 && availableSizes[0].sizeName === '' ? 'Үндсэн (Хэмжээгүй)' : '') } : null}
                              placeholder="Жин, Формат..."
                              isClearable
                              isDisabled={!currentMaterialName || isSpecialMat}
                              menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                              menuPosition="fixed"
                              styles={{ ...tableSelectStyles, control: base => ({ ...tableSelectStyles.control(base), background: isSpecialMat ? '#f1f5f9' : 'white' }), menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                            />
                          )}
                        />
                      </td>
                      )}
                      {isExpandedMaterial && (
                      <td style={{ padding: '0.25rem 0.3rem', borderRight: '1px solid #e2e8f0', verticalAlign: 'top' }}>
                        <Controller
                          name={`materials.${index}.print_size`}
                          control={control}
                          render={({ field }) => (
                            <div title={formValues.category === 'Түргэн хэвлэл' ? 'Түргэн хэвлэл үед үргэлж A3 байна' : ''}>
                              <CreatableSelect
                                {...field}
                                options={[
                                  { value: 'A1', label: 'A1' },
                                  { value: 'A2', label: 'A2' },
                                  { value: 'A3', label: 'A3' },
                                  { value: 'A4', label: 'A4' },
                                  { value: 'B1', label: 'B1' },
                                  { value: 'B2', label: 'B2' },
                                  { value: 'B3', label: 'B3' },
                                  { value: 'B4', label: 'B4' }
                                ]}
                                value={field.value ? { value: field.value, label: field.value } : null}
                                onChange={(selected: any) => {
                                  if (isSpecialMat) return;
                                  const val = selected ? selected.value : '';
                                  field.onChange(val);
                                  
                                  const sourceSize = formValues.materials?.[index]?.size || '';
                                  const ratio = calculatePaperDivision(sourceSize, val);
                                  const _isCov = formValues.materials?.[index]?.is_cover;
                                  const bt = formValues.binding_type || '';
                                  if (ratio > 0) {
                                    setValue(`materials.${index}.divide_by`, ratio);
                                  }
                                  
                                  // Trigger M4 calculation
                                  const a7Raw = formValues.size || '';
                                  const a7 = a7Raw === 'Custom' ? `${formValues.custom_width}x${formValues.custom_height}` : a7Raw;
                                  const isCover = formValues.materials?.[index]?.is_cover || false;
                                  const b4 = isCover ? 4 : (Number(formValues.total_pages) || 0);
                                  if (val && a7 && b4 > 0) {
                                    const pagesPerSheet = calculatePaperDivision(val, a7) * 2;
                                    if (pagesPerSheet > 0) {
                                      const m4 = b4 / pagesPerSheet;
                                      setValue(`materials.${index}.press_sheet`, String(m4));
                                      const base = Number(formValues.materials?.[index]?.base_qty) || 0;
                                      const extra = Number(formValues.materials?.[index]?.extra_qty) || 0;
                                      const divs = calculatePaperDivision(val || 'A2', a7);
                                      const setups = calculateSetups(m4, divs);
                                      const total = (base * m4) + (extra * setups);
                                      setValue(`materials.${index}.total_qty`, total);
                                      const divBy = ratio > 0 ? ratio : (Number(formValues.materials?.[index]?.divide_by) || 1);
                                      if (!evaluateDynamicFormula(index, {})) { setValue(`materials.${index}.sheet_qty`, Math.ceil(total / divBy)); }
                                    }
                                  } else if (ratio > 0) {
                                    // If M4 calculation didn't run, still update sheet_qty based on ratio
                                    const total = Number(formValues.materials?.[index]?.total_qty) || 0;
                                    setValue(`materials.${index}.sheet_qty`, Math.ceil(total / ratio));
                                  }
                                }}
                                isClearable
                                isDisabled={isSpecialStrap || formValues.category === 'Түргэн хэвлэл'}
                                placeholder="Сонгох..."
                                menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                                menuPosition="fixed"
                                styles={{ 
                                  control: (base) => ({ 
                                    ...base, 
                                    background: (isSpecialStrap || formValues.category === 'Түргэн хэвлэл') ? '#f1f5f9' : 'white', 
                                    borderRadius: '0.25rem', 
                                    borderColor: '#cbd5e1', 
                                    minHeight: '34px', 
                                    fontSize: '0.85rem' 
                                  }), 
                                  menuPortal: base => ({ ...base, zIndex: 9999 }) 
                                }}
                              />
                            </div>
                          )}
                        />
                      </td>
                      )}
                      {isExpandedMaterial && (
                      <td style={{ padding: '0.25rem 0.3rem', borderRight: '1px solid #e2e8f0', verticalAlign: 'top' }}>
                        <input style={isSpecialMat ? disabledStyle : {...inputStyle, backgroundColor: '#f1f5f9'}} readOnly title="Автоматаар бодогдоно" {...register(`materials.${index}.press_sheet`, {
                          onChange: (e) => {
                            if (isSpecialMat) return;
                            const press = Number(e.target.value) || 1;
                            const base = Number(formValues.materials?.[index]?.base_qty) || 0;
                            const extra = Number(formValues.materials?.[index]?.extra_qty) || 0;
                            const a7 = getA7Size();
                            const divs = calculatePaperDivision(formValues.materials?.[index]?.print_size || 'A2', a7);
                            const setups = calculateSetups(press, divs);
                            const total = (base * press) + (extra * setups);
                            setValue(`materials.${index}.total_qty`, total);
                            const divBy = Number(formValues.materials?.[index]?.divide_by) || 1;
                            if (!evaluateDynamicFormula(index, (e && e.target && e.target.name) ? { [e.target.name.split('.').pop()]: e.target.value } : {})) { setValue(`materials.${index}.sheet_qty`, Math.ceil(total / divBy)); }
                          }
                        })} />
                      </td>
                      )}
                      {isExpandedMaterial && (
                      <td style={{ padding: '0.25rem 0.3rem', borderRight: '1px solid #e2e8f0', verticalAlign: 'top' }}>
                        <input type="number" style={isSpecialStrap ? disabledStyle : inputStyle} readOnly={isSpecialStrap} {...register(`materials.${index}.base_qty`, {
                          onChange: (e) => {
                            if (isSpecialMat) return;
                            const base = Number(e.target.value) || 0;
                            const extra = Number(formValues.materials?.[index]?.extra_qty) || 0;
                            const press = Number(formValues.materials?.[index]?.press_sheet) || 1;
                            const a7 = getA7Size();
                            const divs = calculatePaperDivision(formValues.materials?.[index]?.print_size || 'A2', a7);
                            const setups = calculateSetups(press, divs);
                            const total = (base * press) + (extra * setups);
                            setValue(`materials.${index}.total_qty`, total);
                            const divBy = Number(formValues.materials?.[index]?.divide_by) || 1;
                            if (!evaluateDynamicFormula(index, (e && e.target && e.target.name) ? { [e.target.name.split('.').pop()]: e.target.value } : {})) { setValue(`materials.${index}.sheet_qty`, Math.ceil(total / divBy)); }
                          }
                        })} />
                      </td>
                      )}
                      {isExpandedMaterial && (
                      <td style={{ padding: '0.25rem 0.3rem', borderRight: '1px solid #e2e8f0', verticalAlign: 'top' }}>
                        <input type="number" style={isSpecialStrap ? disabledStyle : inputStyle} readOnly={isSpecialStrap} {...register(`materials.${index}.extra_qty`, {
                          onChange: (e) => {
                            if (isSpecialMat) return;
                            const extra = Number(e.target.value) || 0;
                            const base = Number(formValues.materials?.[index]?.base_qty) || 0;
                            const press = Number(formValues.materials?.[index]?.press_sheet) || 1;
                            const a7 = getA7Size();
                            const divs = calculatePaperDivision(formValues.materials?.[index]?.print_size || 'A2', a7);
                            const setups = calculateSetups(press, divs);
                            const total = (base * press) + (extra * setups);
                            setValue(`materials.${index}.total_qty`, total);
                            const divBy = Number(formValues.materials?.[index]?.divide_by) || 1;
                            if (!evaluateDynamicFormula(index, (e && e.target && e.target.name) ? { [e.target.name.split('.').pop()]: e.target.value } : {})) { setValue(`materials.${index}.sheet_qty`, Math.ceil(total / divBy)); }
                          }
                        })} />
                      </td>
                      )}
                      {isExpandedMaterial && (
                      <td style={{ padding: '0.25rem 0.3rem', borderRight: '1px solid #e2e8f0', verticalAlign: 'top' }}>
                        <input type="number" style={{ ...inputStyle, backgroundColor: '#f8fafc' }} readOnly {...register(`materials.${index}.total_qty`)} />
                      </td>
                      )}
                      {isExpandedMaterial && (
                      <td style={{ padding: '0.25rem 0.3rem', borderRight: '1px solid #e2e8f0', verticalAlign: 'top' }}>
                        <input type="number" style={isSpecialMat ? disabledStyle : inputStyle} readOnly={isSpecialMat} {...register(`materials.${index}.divide_by`, {
                          onChange: (e) => {
                            if (isSpecialMat) return;
                            const divBy = Number(e.target.value) || 1;
                            const total = Number(formValues.materials?.[index]?.total_qty) || 0;
                            if (divBy > 0) if (!evaluateDynamicFormula(index, (e && e.target && e.target.name) ? { [e.target.name.split('.').pop()]: e.target.value } : {})) { setValue(`materials.${index}.sheet_qty`, Math.ceil(total / divBy)); }
                          }
                        })} />
                      </td>
                      )}
                      {isExpandedMaterial && (
                      <td style={{ padding: '0.25rem 0.3rem', borderRight: '1px solid #e2e8f0', verticalAlign: 'top' }}>
                        <input type="number" step="any" style={inputStyle} {...register(`materials.${index}.sheet_qty`)} />
                      </td>
                      )}
                      <td style={{ padding: '0.25rem 0.3rem', borderRight: '1px solid #e2e8f0', verticalAlign: 'top', width: !isExpandedMaterial ? '12%' : undefined }}>
                        <input type="number" step="any" style={inputStyle} {...register(`materials.${index}.unit_cost`)} />
                      </td>
                      {isExpandedMaterial ? (
                        <td style={{ padding: '0.25rem 0.3rem', borderRight: '1px solid #e2e8f0', verticalAlign: 'top', textAlign: 'right', fontWeight: 'bold', color: '#0f172a', paddingTop: '0.5rem' }}>
                          {tCost.toLocaleString()}
                        </td>
                      ) : (
                        <>
                          <td style={{ padding: '0.25rem 0.5rem', borderRight: '1px solid #e2e8f0', verticalAlign: 'top', textAlign: 'right', fontWeight: '500', color: '#475569', paddingTop: '0.5rem', width: '13%' }}>
                            {tCost.toLocaleString()}
                          </td>
                          <td style={{ padding: '0.25rem 0.5rem', borderRight: '1px solid #e2e8f0', verticalAlign: 'top', textAlign: 'right', fontWeight: 'bold', color: '#0f172a', paddingTop: '0.5rem', width: '14%' }}>
                            {(tCost * (Number(formValues.profit_margin) || 2.3)).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          </td>
                        </>
                      )}
                      <td style={{ padding: '0.25rem 0.3rem', verticalAlign: 'top', width: !isExpandedMaterial ? '13%' : undefined }}>
                        <input style={inputStyle} {...register(`materials.${index}.notes`)} />
                      </td>
                      <td style={{ padding: '0.25rem 0.3rem', verticalAlign: 'top', textAlign: 'center', width: !isExpandedMaterial ? '38px' : undefined }}>
                        <button type="button" onClick={() => removeMaterial(index)} style={{ width: '28px', height: '28px', borderRadius: '4px', backgroundColor: '#ef4444', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>X</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <button type="button" onClick={() => appendMaterial({ material_name: '', size: '', print_size: formValues.category === 'Түргэн хэвлэл' ? 'A3' : '', press_sheet: '', base_qty: Number(getValues('total_qty')) || 0, extra_qty: formValues.category === 'Түргэн хэвлэл' ? 0 : 0, total_qty: 0, divide_by: 1, sheet_qty: 0, unit_cost: 0, notes: '' })} className="btn btn-outline">
              + Материал нэмэх
            </button>
            {(formValues.binding_type === 'Хатуу хавтастай' || formValues.binding_type === 'Хөөсөн хатуу хавтастай') && (
              <button 
                type="button" 
                onClick={handleAddHardcoverAuxiliary} 
                className="btn btn-primary"
                style={{ background: '#0284c7', borderColor: '#0284c7', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}
                title="Картон, Форзац, Капитал тууз, Хавчуурга тууз болон Хатуу хавтас угсралтын ажиллагааг автоматаар бодох"
              >
                ✨ Хатуу хавтасны туслах материал бодох
              </button>
            )}
          </div>
        </SectionCard>

        {/* 6. Ажиллагаа */}
        <SectionCard id="sec7" step="7" title="7. Ажиллагаа (Нугалаа, наалт, үдээ гэх мэт)">
          
          
          <div style={{ marginBottom: '1.5rem' }}>
            <button type="button" onClick={() => setShowOperationsModal(true)} className="btn btn-primary" style={{ padding: '0.6rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg> Нэмэлт ажиллагаа сонгох
            </button>
          </div>

          {opFields.length > 0 && (
            <div className="table-responsive">
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '2px solid #cbd5e1', color: '#475569', fontSize: '0.85rem' }}>Ажиллагааны нэр</th>
                    <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '2px solid #cbd5e1', color: '#475569', fontSize: '0.85rem' }}>Тоо</th>
                    <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '2px solid #cbd5e1', color: '#475569', fontSize: '0.85rem' }}>Нэгж өртөг</th>
                    <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '2px solid #cbd5e1', color: '#475569', fontSize: '0.85rem' }}>Нийт өртөг</th>
                    <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '2px solid #cbd5e1', color: '#475569', fontSize: '0.85rem' }}>Тайлбар</th>
                  </tr>
                </thead>
                <tbody>
                  {opFields.map((field, index) => {
                    const o = formValues.operations?.[index];
                    const tCost = (o?.qty || 0) * (o?.unit_cost || 0);
                    const mpFormula = masterPrices.find(p => p.item_name === o?.operation_name)?.formula?.expression;
                    const inputStyle = tableInputStyle;
                    return (
                      <tr key={field.id} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background-color 0.2s', backgroundColor: '#f8fafc' }}>
                        <td style={{ padding: '0.25rem 0.3rem', borderRight: '1px solid #e2e8f0', verticalAlign: 'middle', fontWeight: 600, color: '#1e293b' }}>
                          {o?.operation_name}
                          {mpFormula && (
                            <div style={{ display: 'inline-block', marginLeft: '0.5rem' }}>
                              <CalculationHelpBadge
                                title="Мастер үнийн сангийн томьёо"
                                formula={mpFormula}
                                liveCalculation={`Үр дүн: ${o?.qty || 0}`}
                                details={[
                                  "Энэхүү ажиллагааны тоог Мастер үнийн санд тохируулсан динамик томьёогоор бодож байна."
                                ]}
                              />
                            </div>
                          )}
                          <input type="hidden" {...register(`operations.${index}.operation_name`)} />
                        </td>
                        <td style={{ padding: '0.25rem 0.3rem', borderRight: '1px solid #e2e8f0', verticalAlign: 'top', width: '120px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <input 
                              type="number" 
                              step="any" 
                              style={{ 
                                ...inputStyle, 
                                backgroundColor: (!mpFormula || o?.is_manual) ? '#fff' : '#e2e8f0', 
                                color: (!mpFormula || o?.is_manual) ? '#000' : '#475569', 
                                cursor: (!mpFormula || o?.is_manual) ? 'text' : 'not-allowed' 
                              }} 
                              readOnly={!!mpFormula && !o?.is_manual}
                              {...register(`operations.${index}.qty`)} 
                            />
                            {mpFormula && (
                              <button
                                type="button"
                                title={o?.is_manual ? "Гараар тохируулж байна (Автомат бодолт унтарсан)" : "Автоматаар бодогдож байна"}
                                onClick={() => setValue(`operations.${index}.is_manual`, !o?.is_manual)}
                                style={{ 
                                  background: 'transparent', 
                                  border: 'none', 
                                  cursor: 'pointer', 
                                  padding: '0.2rem',
                                  fontSize: '1rem',
                                  opacity: o?.is_manual ? 1 : 0.6
                                }}
                              >
                                {o?.is_manual ? '🔓' : '🔒'}
                              </button>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '0.25rem 0.3rem', borderRight: '1px solid #e2e8f0', verticalAlign: 'top', width: '120px' }}>
                          <input type="number" step="any" style={inputStyle} {...register(`operations.${index}.unit_cost`)} />
                        </td>
                        <td style={{ padding: '0.25rem 0.3rem', borderRight: '1px solid #e2e8f0', verticalAlign: 'middle', textAlign: 'right', fontWeight: 'bold', color: '#0f172a', width: '120px' }}>
                          {tCost.toLocaleString()}
                        </td>
                        <td style={{ padding: '0.25rem 0.3rem', verticalAlign: 'top' }}>
                          <input style={inputStyle} {...register(`operations.${index}.notes`)} placeholder="Тэмдэглэл..." />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>

        {/* 8. Гадуур ажил */}
        <SectionCard id="sec8" step="8" title="8. Гадуур ажил">
          
          {outFields.map((field, index) => {
            const out = formValues.outsourced?.[index];
            const tCost = (out?.qty || 0) * (out?.unit_cost || 0);
            return (
            <div key={field.id} className="row-item">
              <div className="erp-field" style={{ flex: 1 }}>
                <label title="[A4]">Ажлын нэр</label>
                <Controller
                  name={`outsourced.${index}.job_name`}
                  control={control}
                  render={({ field }) => {
                    const jobOptions = groupedConstants['OUTSOURCED_JOB']?.map((c: any) => ({ value: c.value, label: c.value })) || [];
                    return (
                      <CreatableSelect
                        {...field}
                        options={jobOptions}
                        onChange={(selected: any) => field.onChange(selected ? selected.value : '')}
                        value={field.value ? { value: field.value, label: field.value } : null}
                        placeholder="Сонгох эсвэл бичих..."
                        isClearable
                        styles={compactSelectStyles}
                      />
                    );
                  }}
                />
              </div>
              <div className="erp-field" style={{ flex: 1 }}>
                <label>Гүйцэтгэгч</label>
                <Controller
                  name={`outsourced.${index}.contractor_name` as any}
                  control={control}
                  render={({ field }) => {
                    const contractorOptions = groupedConstants['OUTSOURCED_CONTRACTOR']?.map((c: any) => ({ value: c.value, label: c.value })) || [];
                    return (
                      <CreatableSelect
                        {...field}
                        options={contractorOptions}
                        onChange={(selected: any) => field.onChange(selected ? selected.value : '')}
                        value={field.value ? { value: field.value, label: field.value } : null}
                        placeholder="Сонгох эсвэл бичих..."
                        isClearable
                        styles={compactSelectStyles}
                      />
                    );
                  }}
                />
              </div>
              <div className="erp-field"><label>Тоо</label><input type="number" step="any" {...register(`outsourced.${index}.qty`)} /></div>
              <div className="erp-field"><label title="[X3]">Нэгж өртөг</label><input type="number" step="any" {...register(`outsourced.${index}.unit_cost`)} /></div>
              <div className="erp-field" style={{width: '100px'}}><label title="[X4]">Нийт өртөг</label><div style={{padding: '0 8px', background: '#e2e8f0', borderRadius: '4px', height: '34px', fontSize: '12.8px', display: 'flex', alignItems: 'center'}}>{tCost.toLocaleString()}</div></div>
              <div className="erp-field" style={{ flex: 1 }}><label title="[X5]">Тэмдэглэл</label><input {...register(`outsourced.${index}.notes`)} /></div>
              <button type="button" onClick={() => removeOut(index)} className="btn btn-danger" style={{height: '34px', padding: '0 10px'}}>X</button>
            </div>
          )})}
          <button type="button" onClick={() => appendOut({ job_name: '', contractor_name: '', qty: 0, unit_cost: 0, notes: '' })} className="btn btn-outline">+ Гадуур ажил нэмэх</button>
        </SectionCard>

        </div> {/* End of erp-calc-col */}

        <div className="erp-rail-col" id="rail-summary">
          <div className="summary-card">
            <div className="summary-top">
              <div className="lbl">Нийт үнэ (харилцагчид)</div>
              <div className="big"><span className="cur">₮</span><span id="totalPriceOut">{prices.finalPrice.toLocaleString()}</span></div>
              <div className="margin-badge">📈 Ашиг {formValues.profit_margin || 2.3}</div>
            </div>

            <div className="summary-body">
              {/* Sales Person Badge */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', marginBottom: '10px', fontSize: '12px' }}>
                <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>👤 Борлуулагч:</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>{formValues.sales_person_name || user?.full_name || user?.name || 'Бүртгэгдээгүй'}</span>
                <input type="hidden" {...register("sales_person_name")} />
              </div>

              <div className="stat-grid">
                <div className="stat"><div className="l">Материалын өртөг</div><div className="v">{prices.totalMaterialCost.toLocaleString()} ₮</div></div>
                <div className="stat"><div className="l">Ажиллагааны өртөг</div><div className="v">{prices.totalOperationCost.toLocaleString()} ₮</div></div>
                <div className="stat"><div className="l">Нийт өртөг</div><div className="v">{prices.factoryTotalCost.toLocaleString()} ₮</div></div>
                <div className="stat profit"><div className="l">Цэвэр ашиг</div><div className="v">{(prices.finalPrice - prices.factoryTotalCost).toLocaleString()} ₮</div></div>
              </div>

              <div className="row-line"><span className="l">Нэгжийн өртөг:</span><span className="v">{prices.unitCost.toLocaleString()} ₮</span></div>
              <div className="erp-field-inline">
                <label>Ашиг</label>
                <div className="erp-mini-input"><input type="number" step="0.01" placeholder="2.3" {...register("profit_margin")} /></div>
              </div>
              <div className="erp-field-inline">
                <label>Нэгжийн үнэ (ашигтай)</label>
                <div className="erp-mini-input"><input type="text" value={`${prices.unitPrice.toLocaleString()} ₮`} readOnly /></div>
              </div>

              <div className="summary-sub">Төлбөрийн хэлбэр & хувь</div>
              <div className="pay-row">
                <select {...register("payment_method_1")} style={{flex: 1}}>
                  <option value="Урьдчилгаа">Урьдчилгаа</option>
                  <option value="Бэлэн">Бэлэн</option>
                  <option value="Дансаар">Дансаар</option>
                </select>
                <div style={{width:'64px'}}><input type="number" step="any" className="pct erp-mono" {...register("payment_percent_1")} style={{width: '100%', padding: '7px 9px'}} /></div>
              </div>
              <div className="pay-bar"><div className="a" style={{width: `${formValues.payment_percent_1 || 0}%`}}></div><div className="b" style={{width: `${100 - (formValues.payment_percent_1 || 0)}%`}}></div></div>
              {formValues.payment_percent_1 > 0 && (
                <div style={{ fontSize: '0.85rem', color: 'var(--primary-color)', fontWeight: 600, marginTop: '6px', textAlign: 'right' }}>
                  Урьдчилгаа дүн: {((prices.finalPrice * (formValues.payment_percent_1 || 0)) / 100).toLocaleString()} ₮
                </div>
              )}

              <div className="erp-field" style={{marginBottom:'10px'}}>
                <label>Санхүүгийн тайлбар, тэмдэглэл</label>
                <textarea {...register("finance_notes")} style={{minHeight:'44px'}}></textarea>
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

            <div className="summary-actions">
              {!isEdit ? (
                <>
                  {isQuoteMode ? (
                    <button type="button" onClick={(e) => { e.preventDefault(); setSubmitType('Үнийн санал'); handleSubmit(onSubmit)(); }} className="erp-btn erp-btn-ghost erp-btn-block" disabled={isSubmitting}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z"/><path d="M17 21v-8H7v8M7 3v5h8"/></svg> {isSubmitting && submitType === 'Үнийн санал' ? '⏳ Уншиж байна...' : isSuccess && submitType === 'Үнийн санал' ? '✅ Амжилттай' : 'Үнийн санал хадгалах (Draft)'}
                    </button>
                  ) : (
                    <button type="button" onClick={(e) => { e.preventDefault(); setSubmitType('Шинэ захиалга'); handleSubmit(onSubmit)(); }} className="erp-btn erp-btn-primary erp-btn-block" disabled={isSubmitting}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 5v14M5 12h14"/></svg> {isSubmitting && submitType === 'Шинэ захиалга' ? '⏳ Уншиж байна...' : isSuccess && submitType === 'Шинэ захиалга' ? '✅ Амжилттай' : 'Захиалга үүсгэх'}
                    </button>
                  )}
                </>
              ) : (
                <>
                  <button type="submit" className="erp-btn erp-btn-primary erp-btn-block" disabled={isSubmitting}>
                    {isSubmitting ? '⏳ Уншиж байна...' : isSuccess ? '✅ Амжилттай' : (isQuoteMode ? '💾 Үнийн санал шинэчлэх' : '💾 Захиалга шинэчлэх')}
                  </button>
                  
                  {isQuoteMode && (
                    <button type="submit" onClick={() => setSubmitType('Шинэ захиалга')} className="erp-btn erp-btn-ghost erp-btn-block" style={{color:'#10b981', borderColor:'#10b981', marginTop: '10px'}}>
                      📦 Захиалга болгож батлах
                    </button>
                  )}

                  {!isQuoteMode && orderId && initialData?.current_status === 'Бэлэн болсон' && (
                    <button type="button" onClick={async () => {
                      if (!confirm("Энэ захиалгыг хэрэглэгчид хүлээлгэн өгсөн гэж тэмдэглэх үү? (Дахин өөрчлөх боломжгүй)")) return;
                      try {
                        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/orders/${orderId}/status`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                          body: JSON.stringify({ new_status: 'Хүлээлгэн өгсөн' })
                        });
                        if (res.ok) {
                          alert("Захиалгыг хүлээлгэн өгсөн төлөвт шилжүүллээ!");
                          window.location.href = '/sales/history';
                        } else {
                          const err = await res.json();
                          alert("Алдаа: " + err.error);
                        }
                      } catch (e) {
                        console.error(e);
                      }
                    }} className="erp-btn erp-btn-block" style={{background: '#10b981', color: '#fff', marginTop: '10px', border: 'none'}}>
                      ✅ Хүлээлгэн өгөх
                    </button>
                  )}

                  {!isQuoteMode && orderId && (
                    <>
                      <button type="button" className="erp-btn erp-btn-ghost erp-btn-block" style={{color:'#10b981', borderColor:'#10b981'}} onClick={async () => {
                        const name = window.prompt("Бэлэн загвар болгож хадгалах нэрээ оруулна уу (Жишээ: А5 24-нүүр Ширээний календарь):");
                        if (!name) return;
                        try {
                          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/templates/from-order/${orderId}`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                            body: JSON.stringify({ template_name: name })
                          });
                          if (res.ok) alert("Амжилттай хадгалагдлаа! Одоо шинэ захиалга үүсгэхдээ энэ загварыг шууд сонгох боломжтой.");
                          else alert("Алдаа гарлаа");
                        } catch(e) { console.error(e); }
                      }}>
                        💾 Загвар болгож хадгалах
                      </button>
                      <button type="button" className="erp-btn erp-btn-ghost erp-btn-block" style={{color:'var(--primary-color)', borderColor:'var(--primary-color)'}} onClick={() => window.open(`/sales/orders/${orderId}/quote`, '_blank')}>
                        📄 Үнийн санал (PDF) хэвлэх
                      </button>
                    </>
                  )}
                </>
              )}

              {/* 📋 Үнийн санал хуулах (Copy Quote) */}
              <button
                type="button"
                onClick={() => {
                  const pName = formValues.product_name || 'Бүтээгдэхүүн';
                  const pQty = Number(formValues.total_qty || 0).toLocaleString();
                  const pSize = formValues.size || '-';
                  const uPrice = prices.unitPrice.toLocaleString();
                  const tPrice = prices.finalPrice.toLocaleString();
                  const deadline = formValues.deadline || '-';
                  const text = `📌 ҮНИЙН САНАЛ:\n• Бүтээгдэхүүн: ${pName}\n• Хэмжээ: ${pSize}\n• Тоо ширхэг: ${pQty} ш\n• Нэгжийн үнэ: ${uPrice} ₮\n• Нийт дүн: ${tPrice} ₮\n• Хугацаа: ${deadline}`;
                  navigator.clipboard.writeText(text);
                  alert("Үнийн саналын хураангуй текстийг амжилттай хууллаа!");
                }}
                className="erp-btn erp-btn-ghost erp-btn-block"
                style={{ marginTop: '10px', fontSize: '12px', borderColor: '#cbd5e1', color: '#334155' }}
              >
                📋 Үнийн санал хуулах
              </button>
            </div>
          </div>
        </div>
      </div>
      </form>

      {/* Нэмэлт ажиллагаа сонгох Modal */}
      {showOperationsModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '0.75rem', width: '100%', maxWidth: '800px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>Нэмэлт ажиллагаа сонгох</h3>
              <button type="button" onClick={() => setShowOperationsModal(false)} style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}>&times;</button>
            </div>
            <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
              {(() => {
                const ops = masterPrices.filter((op: any) => op.category === 'Ажиллагаа');
                const groups: { baseName: string, options: any[], isGroup: boolean }[] = [];
                ops.forEach((op: any) => {
                  const match = op.item_name.match(/^(.*)\s*\((.*)\)$/);
                  if (match) {
                    const baseName = match[1].trim();
                    const variantName = match[2].trim();
                    let group = groups.find(g => g.baseName === baseName);
                    if (!group) {
                      group = { baseName, isGroup: true, options: [] };
                      groups.push(group);
                    }
                    group.options.push({ ...op, variantName });
                  } else {
                    groups.push({ baseName: op.item_name, isGroup: false, options: [{ ...op, variantName: op.item_name }] });
                  }
                });

                return (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
                    {groups.map(group => {
                      const activeOpInGroup = group.options.find(o => opFields.some((f: any) => f.operation_name === o.item_name));
                      const isAdded = !!activeOpInGroup;

                      return (
                        <div key={group.baseName} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', padding: '0.75rem', background: isAdded ? '#eff6ff' : '#ffffff', border: isAdded ? '1px solid #93c5fd' : '1px solid #e2e8f0', borderRadius: '0.5rem', transition: 'all 0.2s' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', fontWeight: isAdded ? 600 : 500, color: isAdded ? '#1e40af' : '#475569' }}>
                            <input
                              type="checkbox"
                              checked={isAdded}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  addQuickOp(group.options[0]);
                                } else {
                                  const idx = opFields.findIndex((f: any) => group.options.some(o => o.item_name === f.operation_name));
                                  if (idx !== -1) removeOp(idx);
                                }
                              }}
                              style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#3b82f6' }}
                            />
                            {group.baseName}
                          </label>

                          {isAdded && group.isGroup && (
                            <select
                              value={activeOpInGroup?.item_name || ''}
                              onChange={(e) => {
                                const newOpName = e.target.value;
                                const newOp = group.options.find(o => o.item_name === newOpName);
                                if (newOp) {
                                  const idx = opFields.findIndex((f: any) => group.options.some(o => o.item_name === f.operation_name));
                                  if (idx !== -1) {
                                    const currentOp = formValues.operations?.[idx];
                                    updateOp(idx, { 
                                      ...currentOp,
                                      operation_name: newOp.item_name, 
                                      unit_cost: newOp.unit_cost,
                                      qty: currentOp?.qty || 0,
                                      notes: currentOp?.notes || ''
                                    } as any);
                                  }
                                }
                              }}
                              style={{ padding: '0.4rem', fontSize: '0.85rem', borderRadius: '0.375rem', border: '1px solid #bfdbfe', background: '#fff', color: '#1e293b', outline: 'none', cursor: 'pointer', marginTop: '0.25rem' }}
                            >
                              {group.options.map(opt => (
                                <option key={opt.id} value={opt.item_name}>{opt.variantName}</option>
                              ))}
                            </select>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', background: '#f8fafc', borderBottomLeftRadius: '0.75rem', borderBottomRightRadius: '0.75rem' }}>
              <button type="button" onClick={() => setShowOperationsModal(false)} className="btn btn-primary" style={{ padding: '0.5rem 2rem', fontWeight: 600 }}>
                ОК
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
    </div>
  );
}

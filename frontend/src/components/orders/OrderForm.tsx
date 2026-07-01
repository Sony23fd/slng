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
  deadline: string;
  product_name: string;
  category: string;
  total_qty: number;
  size: string;
  sub_size: string;
  needs_design: boolean;
  is_urgent: boolean;
  sales_person_name: string;
  notes: string;
  binding_type?: string;
  
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
  operations: { operation_name: string; qty: number; unit_cost: number; notes: string }[];
  
  // 7. Гадуур ажил
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
  const s = size?.toUpperCase() || '';
  const bt = bindingType?.toLowerCase() || '';

  if (coverRules && coverRules.length > 0) {
    const rule = coverRules.find((r: any) => r.size?.toUpperCase() === s && r.binding?.toLowerCase() === bt);
    if (rule) return { pressSheet: rule.press_sheet, divideBy: rule.divide_by, printSize: rule.print_size };
  }

  if (s === 'A4' && bt === 'наалттай') return { pressSheet: 1.0, divideBy: 6 };
  if (s === 'A4' && bt === 'үдээстэй') return { pressSheet: 0.5, divideBy: 4 };
  if (s === 'A5' && bt === 'наалттай') return { pressSheet: 0.5, divideBy: 5 };
  if (s === 'A5' && bt === 'үдээстэй') return { pressSheet: 0.25, divideBy: 4 };
  if (s === 'B5' && bt === 'наалттай') return { pressSheet: 0.5, divideBy: 4 };
  if (s === 'B5' && bt === 'үдээстэй') return { pressSheet: 0.5, divideBy: 5 };
  
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

export default function OrderForm({ initialData, isEdit, orderId }: { initialData?: any, isEdit?: boolean, orderId?: number }) {
  const { token, user } = useAuthStore();
  const router = useRouter();
  const [constants, setConstants] = useState<any[]>([]);
  const [coverRules, setCoverRules] = useState<any[]>([]);
  const [productCategories, setProductCategories] = useState<any[]>([]);
  const [masterPrices, setMasterPrices] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [formulas, setFormulas] = useState<any[]>([]);
  const [bagDims, setBagDims] = useState({ height: 32, width: 24, gusset: 8, topFold: 6, bottomFold: 6 });

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/constants`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setConstants(data);
          if (!initialData) {
            const profit = data.find(c => c.type === 'DEFAULT_PROFIT_MARGIN')?.value || 20;
            const deposit = data.find(c => c.type === 'DEFAULT_DEPOSIT_PERCENT')?.value || 50;
            setValue('profit_margin', Number(profit));
            setValue('payment_percent_1', Number(deposit));
            setValue('payment_percent_2', 100 - Number(deposit));
          }
        }
      })
      .catch(console.error);

    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/prices`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setMasterPrices(data);
      })
      .catch(console.error);

    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/customers`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCustomers(data);
      })
      .catch(console.error);

    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/coverrules`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCoverRules(data);
      })
      .catch(console.error);

    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/product-categories`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setProductCategories(data);
      })
      .catch(console.error);

    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/formulas`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setFormulas(data);
      })
      .catch(console.error);

    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/templates`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setTemplates(data);
      })
      .catch(console.error);
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
      customer_name: '', phone: '', deadline: '', product_name: '', category: '', total_qty: 0,
      size: '', sub_size: '', needs_design: false, is_urgent: false, sales_person_name: user?.name || '', notes: '',
      cover_color: '', inner_color: '', has_bookmark: '', total_pages: 0, print_cost: 0,
      materials: [{ material_name: '', size: '', print_size: '', press_sheet: '', base_qty: 0, extra_qty: 0, total_qty: 0, divide_by: 1, sheet_qty: 0, unit_cost: 0, notes: '' }],
      operations: [],
      outsourced: [],
      profit_margin: 20, payment_method_1: '', payment_percent_1: 50, payment_method_2: '', payment_percent_2: 50,
      has_vat: false, finance_notes: '', status: 'Хүлээгдэж буй', next_process: ''
    }
  });

  const { fields: materialFields, append: appendMaterial, remove: removeMaterial } = useFieldArray({ control, name: 'materials' });
  const { fields: opFields, append: appendOp, remove: removeOp } = useFieldArray({ control, name: 'operations' });
  const { fields: outFields, append: appendOut, remove: removeOut } = useFieldArray({ control, name: 'outsourced' });


  const evaluateDynamicFormula = (index: number, mOverrides: any = {}, globalOverrides: any = {}) => {
    const currentM = getValues(`materials.${index}`) || {};
    const m = { ...currentM, ...mOverrides };
    if (!m.formula_id) return false;
    const f = formulas.find(x => x.id === Number(m.formula_id));
    if (!f) return false;
    try {
      const a7 = globalOverrides.size !== undefined ? globalOverrides.size : (getValues('size') || 'A5');
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

  const pricingParams = {
    total_product_qty: Number(formValues.total_qty) || 0,
    materials: formValues.materials || [],
    operations: formValues.operations || [],
    outsourced: formValues.outsourced || [],
    profit_margin: Number(formValues.profit_margin) || 0,
    has_vat: formValues.has_vat || false,
    print_cost: Number(formValues.print_cost) || 0,
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
      const a7 = formValues.size || 'A5';
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

  
  const calculateCoatingOperation = (customExtra?: number) => {
    const materials = getValues('materials') || [];
    let coverMat = materials.find((m: any) => m.is_cover);
    if (!coverMat && materials.length > 0) coverMat = materials[0];

    const totalOrderQty = Number(getValues('total_qty')) || 0;
    if (!coverMat) {
      const extra = customExtra !== undefined ? customExtra : 0;
      return {
        qty: Number(((totalOrderQty + extra) * 0.004).toFixed(2)),
        notes: `36см хэмжээтэй бүрэлтийн хуулга`,
      };
    }
    const m3 = coverMat.print_size || 'A3';
    let m5 = Number(coverMat.base_qty) || 0;
    if (m5 === 0) m5 = Number(coverMat.total_qty) || totalOrderQty;
    const m6 = customExtra !== undefined ? customExtra : (Number(coverMat.extra_qty) || 0);

    let coef = 0.004;
    let fSize = '36см';
    if (m3 === 'A2') { coef = 0.006; fSize = '44см'; }
    else if (m3 === 'B2') { coef = 0.007; fSize = '54см'; }
    else if (m3 === 'A3' || m3 === 'B3') { coef = 0.004; fSize = '36см'; }

    return {
      qty: Number(((m5 + m6) * coef).toFixed(2)),
      notes: `${fSize} хэмжээтэй бүрэлтийн хуулга`,
    };
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
      const press_sheet = materials.reduce((acc: number, m: any) => acc + (Number(m.press_sheet) || 0), 0);
      const coverMat: any = materials.find((m: any) => m.is_cover) || {};
      const cover_sheets = (Number(coverMat.base_qty) || 0) + (Number(coverMat.extra_qty) || 0);

      const scope = {
        total_qty: Number(getValues('total_qty')) || 0,
        total_pages: Number(getValues('total_pages')) || 0,
        waste_qty: Number(categoryConfig.waste_qty) || 0,
        cover_colors: getColorsCount(getValues('cover_color') || ''),
        inner_colors: getColorsCount(getValues('inner_color') || ''),
        press_sheet,
        cover_sheets,
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
    const newOps = ops.map(op => {
      if (!op.operation_name) return op;

      if (op.operation_name === 'Бүрэлт' || op.operation_name.startsWith('Бүрэлт')) {
        const coat = calculateCoatingOperation(Number((op as any).extra_qty));
        if (coat) {
          if (Number(op.qty) !== coat.qty || op.notes !== coat.notes) {
            changed = true;
            return { ...op, qty: coat.qty, notes: coat.notes };
          }
        }
        return op;
      }

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

    if (isBag || isBrochure) {
      const a6 = Number(formValues.total_qty) || 0;
      const a7 = formValues.size || 'A4';
      const mats = getValues('materials') || [];

      if (isBag && (!formValues.size || !formValues.size.startsWith('Тор'))) {
        const fw = (bagDims.width + bagDims.gusset) * 2;
        const fh = bagDims.height + bagDims.topFold + bagDims.bottomFold;
        setValue('size', `Тор ${bagDims.width}х${bagDims.height}х${bagDims.gusset} (Дэлгээс: ${fw}х${fh}см)`);
      }

      mats.forEach((m: any, index: number) => {
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

        const extra = Number(m.extra_qty) || 0;
        const setups = isBag ? extra : calculateSetups(1, div);
        const total = (m5 * 1) + setups;
        if (Number(m.total_qty) !== total) setValue(`materials.${index}.total_qty`, total);
        const divBy = Number(m.divide_by) || (isBag ? 2 : 1);
        if (isBag && Number(m.divide_by) !== divBy) setValue(`materials.${index}.divide_by`, divBy);
        const sQty = Math.ceil(total / divBy);
        if (Number(m.sheet_qty) !== sQty) setValue(`materials.${index}.sheet_qty`, sQty);
      });
    }
  }, [formValues.category, formValues.total_qty, formValues.size, formValues.materials, bagDims, setValue, getValues]);

  const onSubmit = (data: OrderFormValues) => {
    const payload = { ...data, ...prices, final_price: prices?.finalPrice || 0 };
    const method = isEdit ? 'PUT' : 'POST';
    const url = isEdit ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/orders/${orderId}` : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/orders`;
    
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
        if (resData.error) {
          alert('Алдаа гарлаа: ' + resData.error + (resData.details ? '\\nДэлгэрэнгүй: ' + resData.details : ''));
        } else {
          alert(isEdit ? 'Захиалга амжилттай шинэчлэгдлээ!' : 'Захиалга амжилттай үүслээ!');
          router.push('/sales/orders');
        }
      })
      .catch(console.error);
  };

  return (
    <div>
      {!initialData && <h2 className="title">Шинэ захиалга үүсгэх</h2>}
      <form onSubmit={handleSubmit(onSubmit)}>
        
        {/* Бэлэн загвар сонгох */}
        <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'linear-gradient(to right, #eff6ff, #f8fafc)', border: '1px solid #bfdbfe', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.75rem' }}>
            <label style={{ fontWeight: 600, color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              ⚡ <span>Хурдан загвар (1 товчоор бөглөх)</span>
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => {
                  setValue('category', 'Брошур');
                  setValue('product_name', 'Түгээмэл 1000ш Брошур');
                  setValue('size', 'A4');
                  setValue('total_qty', 1000);
                  setValue('materials', [{ material_name: 'Шохойтой 150гр', size: 'A4', print_size: 'A2', unit_cost: 150, notes: '', base_qty: 1000, extra_qty: 50, press_sheet: '1', total_qty: 1050, divide_by: 1, sheet_qty: 1050, is_cover: false }]);
                }}
                style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '0.375rem', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              >
                📄 1000ш Брошур
              </button>
              <button
                type="button"
                onClick={() => {
                  setValue('category', 'Тор');
                  setValue('product_name', 'Стандарт Цаасан тор (32х24х8см)');
                  setBagDims({ height: 32, width: 24, gusset: 8, topFold: 6, bottomFold: 6 });
                  setValue('size', 'Тор 24х32х8 (Дэлгээс: 64х44см)');
                  setValue('total_qty', 1000);
                  setValue('materials', [{ material_name: 'Картон 250гр', size: '64х44см', print_size: 'B2', unit_cost: 400, notes: '', base_qty: 1000, extra_qty: 100, press_sheet: '1', total_qty: 1100, divide_by: 2, sheet_qty: 550, is_cover: false }]);
                }}
                style={{ background: '#6366f1', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '0.375rem', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              >
                🛍️ 1000ш Цаасан тор
              </button>
              <button
                type="button"
                onClick={() => {
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
                style={{ background: '#8b5cf6', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '0.375rem', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              >
                📚 1000ш Ном
              </button>
            </div>
          </div>
          <Select
            options={templates.map(t => ({ value: t.id, label: t.template_name, template: t }))}
            onChange={(selected: any) => {
              if (selected && selected.template) {
                const t = selected.template;
                if (t.category) setValue('category', t.category);
                if (t.size) setValue('size', t.size);
                if (t.binding_type) setValue('binding_type', t.binding_type);
                if (t.cover_color) setValue('cover_color', t.cover_color);
                if (t.inner_color) setValue('inner_color', t.inner_color);
                if (t.total_pages) setValue('total_pages', t.total_pages);
                if (t.needs_design) setValue('needs_design', t.needs_design);
              }
            }}
            placeholder="Эсвэл хадгалсан загваруудаас хайх..."
            isClearable
            styles={{ control: (base) => ({ ...base, background: 'white', borderRadius: '0.375rem', borderColor: '#cbd5e1', minHeight: '40px' }) }}
          />
        </div>

        {/* 1. Захиалгын мэдээлэл */}
        <section style={{ marginBottom: '2rem' }}>
          <h3 className="section-title">1. Захиалагчийн мэдээлэл</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Захиалагчийн нэр</label>
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
                        if (selected.customer.discount_margin) {
                          setValue('profit_margin', selected.customer.discount_margin);
                        }
                      }
                    }}
                    value={field.value ? { value: field.value, label: field.value } : null}
                    placeholder="Хайх эсвэл бичих..."
                    isClearable
                    styles={{ control: (base) => ({ ...base, background: 'white', borderRadius: '0.375rem', borderColor: '#cbd5e1', minHeight: '40px' }) }}
                  />
                )}
              />
            </div>
            <div className="form-group"><label>[A2] Утас</label><input {...register("phone")} /></div>
            <div className="form-group"><label>Хүлээлгэн өгөх огноо</label><input type="date" {...register("deadline")} /></div>
            <div className="form-group"><label>Бүтээгдэхүүний нэр</label><input {...register("product_name")} /></div>
            <div className="form-group">
              <label>Бүтээгдэхүүний ангилал</label>
              <select {...register("category", {
                onChange: (e) => {
                  setValue('category', e.target.value);
                }
              })}>
                <option value="">Сонгох...</option>
                <option value="Тор">Тор (Цаасан тор)</option>
                {groupedConstants['CATEGORY']?.map((c: any) => (
                  <option key={c.id} value={c.value}>{c.value}</option>
                )) || (
                  <>
                    <option value="Ном">Ном</option><option value="Сэтгүүл">Сэтгүүл</option>
                    <option value="Брошур">Брошур</option><option value="Календарь">Календарь</option>
                  </>
                )}
              </select>
            </div>
            <div className="form-group">
              <label>[A6] Хэвлэгдэх тоо нийт</label>
              <input type="number" {...register("total_qty", {
                onChange: (e) => {
                  const a6 = Number(e.target.value) || 0;
                  const materials = getValues('materials') || [];
                  materials.forEach((m, index) => {
                    setValue(`materials.${index}.base_qty`, a6);
                    const press = Number(m.press_sheet) || 1;
                    const extra = Number(m.extra_qty) || 0;
                    const a7 = formValues.size || 'A5';
                    const divs = calculatePaperDivision(m.print_size || 'A2', a7);
                    const setups = calculateSetups(press, divs);
                    const total = (a6 * press) + (extra * setups);
                    setValue(`materials.${index}.total_qty`, total);
                    const divBy = Number(m.divide_by) || 1;
                    if (!evaluateDynamicFormula(index, { base_qty: a6 })) { setValue(`materials.${index}.sheet_qty`, Math.ceil(total / divBy)); }
                  });
                }
              })} />
            </div>
            <div className="form-group">
              <label>[A7] Бүтээгдэхүүний хэмжээ</label>
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
                        // Trigger press_sheet calculation (M4 = B4 / (M3 / A7 * 2))
                        const b4 = Number(getValues('total_pages')) || 0;
                        const materials = getValues('materials') || [];
                        materials.forEach((m, index) => {
                          const isCover = m.is_cover || false;

                            const bt = getValues('binding_type') || '';
                            const coverLogic = isCover ? getCoverLogic(val, bt, coverRules) : null;
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
                              if (m.print_size && val && targetPages > 0) {
                                const pagesPerSheet = calculatePaperDivision(m.print_size, val) * 2;
                                if (pagesPerSheet > 0) {
                                  m4 = targetPages / pagesPerSheet;
                                  setValue(`materials.${index}.press_sheet`, String(m4));
                                }
                              }
                            }

                            if (m4 > 0) {
                              const base = Number(m.base_qty) || 0;
                              const extra = Number(m.extra_qty) || 0;
                              const divs = calculatePaperDivision(coverLogic?.printSize || m.print_size || 'A2', val);
                              const setups = calculateSetups(m4, divs);
                              const total = (base * m4) + (extra * setups);
                              setValue(`materials.${index}.total_qty`, total);
                              if (!evaluateDynamicFormula(index, { size: val })) { setValue(`materials.${index}.sheet_qty`, Math.ceil(total / divBy)); }
                            }

                        });
                      }}
                      value={field.value ? { value: field.value, label: field.value } : null}
                      placeholder="Сонгох эсвэл бичих..."
                      isClearable
                      styles={{ control: (base) => ({ ...base, background: 'white', borderRadius: '0.375rem', borderColor: '#cbd5e1', minHeight: '40px' }) }}
                    />
                  );
                }}
              />
            </div>
            <div className="form-group"><label>Бэлэн болох хэмжээ</label><input {...register("sub_size")} /></div>
            <div className="form-group">
              <label>[A8] Хавтасны төрөл</label>
              <select {...register("binding_type", {
                onChange: (e) => {
                  const bt = e.target.value;
                  const b4 = Number(getValues('total_pages')) || 0;
                  const a7 = getValues('size') || '';
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
              </select>
            </div>
            <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
              <input type="checkbox" {...register("needs_design")} style={{ width: '1.2rem', height: '1.2rem' }} />
              <label style={{ margin: 0 }}>Эх бэлтгэл хийх шаардлагатай</label>
            </div>
            <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
              <input type="checkbox" {...register("is_urgent")} style={{ width: '1.2rem', height: '1.2rem' }} />
              <label style={{ margin: 0, color: 'red' }}>[AA] Яаралтай эсэх</label>
            </div>
            <div className="form-group"><label>Борлуулагчийн нэр</label><input {...register("sales_person_name")} readOnly style={{ backgroundColor: '#f1f5f9', cursor: 'not-allowed' }} /></div>
            <div className="form-group"><label>Тайлбар</label><input {...register("notes")} /></div>
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
                <div className="form-group">
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
                <div className="form-group">
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
                <div className="form-group">
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
                <div className="form-group">
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
                <div className="form-group">
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
        </section>

        {/* 2, 3, 4 Хавтас, Хавчуурга, Нүүр */}
        <section style={{ marginBottom: '2rem' }}>
          <h3 className="section-title">2-4. Технологийн мэдээлэл</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>[B1] Хавтасны өнгө (Гадна)</label>
              <select {...register("cover_color")}>
                <option value="">Сонгох...</option>
                {groupedConstants['COVER_COLOR']?.map((c: any) => (
                  <option key={c.id} value={c.value}>{c.value}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>[B2] Хавтасны дотор өнгө/хэвлэл</label>
              <select {...register("inner_color")}>
                <option value="">Сонгох...</option>
                {groupedConstants['INNER_COLOR']?.map((c: any) => (
                  <option key={c.id} value={c.value}>{c.value}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>[B3] Хавчуурга</label>
              <input {...register("has_bookmark")} placeholder="Жишээ: Дэлгэдэг 1 хуудас" />
            </div>
            <div className="form-group">
              <label>[B4] Нийт нүүр (Хавтас орохгүй)</label>
              <input type="number" {...register("total_pages", {
                onChange: (e) => {
                  const b4 = Number(e.target.value) || 0;
                  const a7 = getValues('size') || '';
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
                              const extra = Number(m.extra_qty) || 0;
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

          {/* ⚡ Түгээмэл ажиллагаанууд (Хурдан сонголт) */}
          <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px dashed #cbd5e1' }}>
            <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.95rem', fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              ⚡ Түгээмэл ажиллагаанууд (Хурдан сонголт)
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.6rem' }}>
              {masterPrices
                .filter(p => {
                  const c = (p.category || '').toLowerCase();
                  return c.includes('ажилбар') || c.includes('ажиллагаа') || c.includes('operation');
                })
                .map((op: any) => {
                  const isChecked = formValues.operations?.some((o: any) => o.operation_name === op.item_name) || false;
                  return (
                    <label
                      key={op.id || op.item_name}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.5rem 0.75rem',
                        border: `1px solid ${isChecked ? 'var(--primary-color)' : '#cbd5e1'}`,
                        borderRadius: '0.375rem',
                        backgroundColor: isChecked ? '#f0fdf4' : 'white',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        fontSize: '0.85rem',
                        userSelect: 'none',
                        boxShadow: isChecked ? '0 1px 2px 0 rgba(16, 185, 129, 0.1)' : 'none'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              let calcQty = 1;
                              let calcNotes = '';
                              if (op.item_name === 'Бүрэлт' || op.item_name.startsWith('Бүрэлт')) {
                                const coat = calculateCoatingOperation();
                                if (coat) {
                                  calcQty = coat.qty;
                                  calcNotes = coat.notes;
                                }
                              } else if (op.formula && op.formula.expression) {
                                calcQty = evaluateOperationFormula(op.formula.expression);
                              }
                              appendOp({
                                operation_name: op.item_name,
                                qty: calcQty,
                                unit_cost: op.unit_cost || 0,
                                notes: calcNotes
                              });
                            } else {
                              const idx = formValues.operations?.findIndex((o: any) => o.operation_name === op.item_name);
                              if (idx !== undefined && idx >= 0) {
                                removeOp(idx);
                              }
                            }
                          }}
                          style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: 'var(--primary-color)', flexShrink: 0 }}
                        />
                        <span style={{ fontWeight: isChecked ? 600 : 400, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={op.item_name}>
                          {op.item_name}
                        </span>
                      </div>
                      {op.unit_cost > 0 && (
                        <span style={{ fontSize: '0.75rem', background: isChecked ? 'var(--primary-color)' : '#f1f5f9', color: isChecked ? 'white' : '#475569', padding: '0.15rem 0.4rem', borderRadius: '0.25rem', fontWeight: 500, flexShrink: 0, marginLeft: '0.5rem' }}>
                          {op.unit_cost.toLocaleString()} ₮
                        </span>
                      )}
                    </label>
                  );
                })}
            </div>
          </div>
        </section>

        {/* 5. Материал */}
        <section style={{ marginBottom: '2rem' }}>
          <h3 className="section-title">5. Шаардлагатай материал</h3>
          <div style={{ overflowX: 'auto', border: '1px solid #cbd5e1', borderRadius: '0.5rem', marginBottom: '1rem', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '950px', backgroundColor: 'white' }}>
              <thead style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1' }}>
                <tr>
                  <th rowSpan={2} style={{ padding: '0.4rem 0.3rem', borderRight: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#334155', fontWeight: '600', textAlign: 'left', minWidth: '160px' }}>[M1] Материалын нэр</th>
                  <th rowSpan={2} style={{ padding: '0.4rem 0.3rem', borderRight: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#334155', fontWeight: '600', textAlign: 'left', minWidth: '95px' }}>[M2] Хэмжээ</th>
                  <th rowSpan={2} style={{ padding: '0.4rem 0.3rem', borderRight: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#334155', fontWeight: '600', textAlign: 'center', width: '70px' }}>[M3] Хэв. хэмжээ</th>
                  <th rowSpan={2} style={{ padding: '0.4rem 0.3rem', borderRight: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#334155', fontWeight: '600', textAlign: 'center', width: '85px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span>[M4] Хэв. хуудас</span>
                      <CalculationHelpBadge
                        title="[M4] Хэвлэлийн хуудас (Press Sheet)"
                        formula="Брошур, Тор зэрэгт стандарт дүрмээр автоматаар тохируулагдана"
                        details={[
                          "Брошур (Brochure) дээр 1 хуудсаар албадан тохируулагдана.",
                          "Цаасан тор (Paper bag) дээр дэлгээс 1 ширхгээр тооцогдоно."
                        ]}
                      />
                    </div>
                  </th>
                  <th colSpan={3} style={{ padding: '0.3rem', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', textAlign: 'center', fontSize: '0.8rem', color: '#334155', fontWeight: '600' }}>Хэвлэгдэх тоо</th>
                  <th rowSpan={2} style={{ padding: '0.4rem 0.3rem', borderRight: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#334155', fontWeight: '600', textAlign: 'center', width: '75px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span>[M8] Хуваалт</span>
                      <CalculationHelpBadge
                        title="[M8] Цаасны хуваалт (Division)"
                        formula="Том цааснаас хэвлэлийн хэмжээгээр зүсэх тоо"
                        details={[
                          "B1 цааснаас B2 зүсэхэд 2, A1 цааснаас A2 зүсэхэд 2 гэх мэт зүсэлтээр бодогдоно.",
                          "Цаасан торонд B1-ээс B2 зүсэх тул хуваалт 2 байх стандарттай."
                        ]}
                      />
                    </div>
                  </th>
                  <th rowSpan={2} style={{ padding: '0.4rem 0.3rem', borderRight: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#334155', fontWeight: '600', textAlign: 'center', width: '75px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span>[M9] Тоо</span>
                      <CalculationHelpBadge
                        title="[M9] Нийт хэрэгцээт том цаасны тоо"
                        formula="⌈ (Үндсэн тоо [M5] + Хадаас [M6]) / Хуваалт [M8] ⌉"
                        details={[
                          "Хэвлэлтэд орох нийт жижиг хуудсыг том цаасны хуваалтад хувааж агуулахын орц гаргана."
                        ]}
                      />
                    </div>
                  </th>
                  <th colSpan={2} style={{ padding: '0.3rem', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', textAlign: 'center', fontSize: '0.8rem', color: '#334155', fontWeight: '600' }}>Өртөг</th>
                  <th rowSpan={2} style={{ padding: '0.4rem 0.3rem', fontSize: '0.8rem', color: '#334155', fontWeight: '600', textAlign: 'left', minWidth: '100px' }}>[MC] Тэмдэглэл</th>
                  <th rowSpan={2} style={{ padding: '0.4rem 0.3rem', width: '35px' }}></th>
                </tr>
                <tr>
                  <th style={{ padding: '0.25rem', borderRight: '1px solid #e2e8f0', fontSize: '0.7rem', color: '#64748b', fontWeight: 'normal', textAlign: 'center', width: '90px', background: '#f8fafc' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span>[M5] Үндсэн</span>
                      <CalculationHelpBadge
                        title="[M5] Үндсэн хэвлэх тоо"
                        formula="Брошур: ⌈ Захиалга / Хуваалт ⌉ | Тор: Захиалгын нийт тоо"
                        liveCalculation={`Захиалгын тоо: ${formValues.total_qty || 0}`}
                        details={[
                          "Брошур үед цаасны хуваалтаас хамаарна.",
                          "Цаасан торонд дэлгээс 1 ширхэг багтах тул Захиалгын тоотой тэнцэнэ."
                        ]}
                      />
                    </div>
                  </th>
                  <th style={{ padding: '0.25rem', borderRight: '1px solid #e2e8f0', fontSize: '0.7rem', color: '#64748b', fontWeight: 'normal', textAlign: 'center', width: '80px', background: '#f8fafc' }}>[M6] Хадаас</th>
                  <th style={{ padding: '0.25rem', borderRight: '1px solid #e2e8f0', fontSize: '0.7rem', color: '#64748b', fontWeight: 'normal', textAlign: 'center', width: '85px', background: '#f8fafc' }}>[M7] Нийт</th>
                  <th style={{ padding: '0.25rem', borderRight: '1px solid #e2e8f0', fontSize: '0.7rem', color: '#64748b', fontWeight: 'normal', textAlign: 'center', width: '70px', background: '#f8fafc' }}>[MA] Нэгж</th>
                  <th style={{ padding: '0.25rem', borderRight: '1px solid #e2e8f0', fontSize: '0.7rem', color: '#64748b', fontWeight: 'normal', textAlign: 'center', width: '80px', background: '#f8fafc' }}>[MB] Нийт</th>
                </tr>
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

                  const inputStyle: React.CSSProperties = { width: '100%', minWidth: '40px', padding: '0.25rem 0.35rem', border: '1px solid #cbd5e1', borderRadius: '0.25rem', fontSize: '0.85rem', boxSizing: 'border-box' };

                  return (
                    <tr key={field.id} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background-color 0.2s' }}>
                      <td style={{ padding: '0.25rem 0.3rem', borderRight: '1px solid #e2e8f0', verticalAlign: 'top' }}>
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
                              styles={{ control: (base) => ({ ...base, background: 'white', borderRadius: '0.25rem', borderColor: '#cbd5e1', minHeight: '34px', fontSize: '0.85rem' }), menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                            />
                          )}
                        />
                        <div style={{ marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <input type="checkbox" {...register(`materials.${index}.is_cover`, {
                            onChange: (e) => {
                              const isCov = e.target.checked;
                              const bt = getValues('binding_type') || '';
                              const b4 = Number(getValues('total_pages')) || 0;
                              const a7 = getValues('size') || '';
                              
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
                                  if (coverLogic.printSize) {
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
                              const extra = Number(getValues(`materials.${index}.extra_qty`)) || 0;
                              const divs = calculatePaperDivision(getValues(`materials.${index}.print_size`) || 'A2', a7);
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
                      </td>
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
                                  const isCover = formValues.materials?.[index]?.is_cover;
                                  const bt = formValues.binding_type || '';
                                  const categoryConfig = productCategories.find((c: any) => c.name === formValues.category) || {};
                                  const coverLogic = (isCover && categoryConfig.calc_mode !== 'STANDARD_MODE') ? getCoverLogic(formValues.size || '', bt, coverRules) : null;
                                  if (ratio > 1 && !coverLogic) {
                                    setValue(`materials.${index}.divide_by`, ratio);
                                    finalDivBy = ratio;
                                  }
                                  // M4 is no longer calculated from M2, but from M3 and A7
                                }
                              }}
                              value={field.value ? { value: field.value, label: field.value || (field.value === '' && availableSizes.length > 0 && availableSizes[0].sizeName === '' ? 'Үндсэн (Хэмжээгүй)' : '') } : null}
                              placeholder="Жин, Формат..."
                              isClearable
                              isDisabled={!currentMaterialName}
                              menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                              menuPosition="fixed"
                              styles={{ control: (base) => ({ ...base, background: 'white', borderRadius: '0.25rem', borderColor: '#cbd5e1', minHeight: '34px', fontSize: '0.85rem' }), menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                            />
                          )}
                        />
                      </td>
                      <td style={{ padding: '0.25rem 0.3rem', borderRight: '1px solid #e2e8f0', verticalAlign: 'top' }}>
                        <input style={inputStyle} {...register(`materials.${index}.print_size`, {
                          onChange: (e) => {
                            const val = e.target.value;
                            const sourceSize = formValues.materials?.[index]?.size || '';
                            const ratio = calculatePaperDivision(sourceSize, val);
                            const _isCov = formValues.materials?.[index]?.is_cover;
                            const bt = formValues.binding_type || '';
                            const categoryConfig = productCategories.find((c: any) => c.name === formValues.category) || {};
                            const coverLogic = (_isCov && categoryConfig.calc_mode !== 'STANDARD_MODE') ? getCoverLogic(formValues.size || '', bt, coverRules) : null;
                            if (ratio > 1 && !coverLogic) {
                              setValue(`materials.${index}.divide_by`, ratio);
                            }
                            
                            // Trigger M4 calculation
                            const a7 = formValues.size || '';
                            const isCover = formValues.materials?.[index]?.is_cover || false;
                            const b4 = isCover ? 4 : (Number(formValues.total_pages) || 0);
                            if (val && a7 && b4 > 0) {
                              const pagesPerSheet = calculatePaperDivision(val, a7) * 2;
                              if (pagesPerSheet > 0) {
                                const m4 = b4 / pagesPerSheet;
                                setValue(`materials.${index}.press_sheet`, String(m4));
                                const base = Number(formValues.materials?.[index]?.base_qty) || 0;
                                const extra = Number(formValues.materials?.[index]?.extra_qty) || 0;
                                const a7 = formValues.size || 'A5';
                                const divs = calculatePaperDivision(e.target.value || 'A2', a7);
                                const setups = calculateSetups(m4, divs);
                                const total = (base * m4) + (extra * setups);
                                setValue(`materials.${index}.total_qty`, total);
                                const divBy = ratio > 1 ? ratio : (Number(formValues.materials?.[index]?.divide_by) || 1);
                                if (!evaluateDynamicFormula(index, (e && e.target && e.target.name) ? { [e.target.name.split('.').pop()]: e.target.value } : {})) { setValue(`materials.${index}.sheet_qty`, Math.ceil(total / divBy)); }
                              }
                            } else if (ratio > 1) {
                              // If M4 calculation didn't run, still update sheet_qty based on ratio
                              const total = Number(formValues.materials?.[index]?.total_qty) || 0;
                              setValue(`materials.${index}.sheet_qty`, Math.ceil(total / ratio));
                            }
                          }
                        })} placeholder="A2" />
                      </td>
                      <td style={{ padding: '0.25rem 0.3rem', borderRight: '1px solid #e2e8f0', verticalAlign: 'top' }}>
                        <input style={{...inputStyle, backgroundColor: '#f1f5f9'}} readOnly title="Автоматаар бодогдоно" {...register(`materials.${index}.press_sheet`, {
                          onChange: (e) => {
                            const press = Number(e.target.value) || 1;
                            const base = Number(formValues.materials?.[index]?.base_qty) || 0;
                            const extra = Number(formValues.materials?.[index]?.extra_qty) || 0;
                            const a7 = formValues.size || 'A5';
                            const divs = calculatePaperDivision(formValues.materials?.[index]?.print_size || 'A2', a7);
                            const setups = calculateSetups(press, divs);
                            const total = (base * press) + (extra * setups);
                            setValue(`materials.${index}.total_qty`, total);
                            const divBy = Number(formValues.materials?.[index]?.divide_by) || 1;
                            if (!evaluateDynamicFormula(index, (e && e.target && e.target.name) ? { [e.target.name.split('.').pop()]: e.target.value } : {})) { setValue(`materials.${index}.sheet_qty`, Math.ceil(total / divBy)); }
                          }
                        })} />
                      </td>
                      <td style={{ padding: '0.25rem 0.3rem', borderRight: '1px solid #e2e8f0', verticalAlign: 'top' }}>
                        <input type="number" style={inputStyle} {...register(`materials.${index}.base_qty`, {
                          onChange: (e) => {
                            const base = Number(e.target.value) || 0;
                            const extra = Number(formValues.materials?.[index]?.extra_qty) || 0;
                            const press = Number(formValues.materials?.[index]?.press_sheet) || 1;
                            const a7 = formValues.size || 'A5';
                            const divs = calculatePaperDivision(formValues.materials?.[index]?.print_size || 'A2', a7);
                            const setups = calculateSetups(press, divs);
                            const total = (base * press) + (extra * setups);
                            setValue(`materials.${index}.total_qty`, total);
                            const divBy = Number(formValues.materials?.[index]?.divide_by) || 1;
                            if (!evaluateDynamicFormula(index, (e && e.target && e.target.name) ? { [e.target.name.split('.').pop()]: e.target.value } : {})) { setValue(`materials.${index}.sheet_qty`, Math.ceil(total / divBy)); }
                          }
                        })} />
                      </td>
                      <td style={{ padding: '0.25rem 0.3rem', borderRight: '1px solid #e2e8f0', verticalAlign: 'top' }}>
                        <input type="number" style={inputStyle} {...register(`materials.${index}.extra_qty`, {
                          onChange: (e) => {
                            const extra = Number(e.target.value) || 0;
                            const base = Number(formValues.materials?.[index]?.base_qty) || 0;
                            const press = Number(formValues.materials?.[index]?.press_sheet) || 1;
                            const a7 = formValues.size || 'A5';
                            const divs = calculatePaperDivision(formValues.materials?.[index]?.print_size || 'A2', a7);
                            const setups = calculateSetups(press, divs);
                            const total = (base * press) + (extra * setups);
                            setValue(`materials.${index}.total_qty`, total);
                            const divBy = Number(formValues.materials?.[index]?.divide_by) || 1;
                            if (!evaluateDynamicFormula(index, (e && e.target && e.target.name) ? { [e.target.name.split('.').pop()]: e.target.value } : {})) { setValue(`materials.${index}.sheet_qty`, Math.ceil(total / divBy)); }
                          }
                        })} />
                      </td>
                      <td style={{ padding: '0.25rem 0.3rem', borderRight: '1px solid #e2e8f0', verticalAlign: 'top' }}>
                        <input type="number" style={{ ...inputStyle, backgroundColor: '#f8fafc' }} readOnly {...register(`materials.${index}.total_qty`)} />
                      </td>
                      <td style={{ padding: '0.25rem 0.3rem', borderRight: '1px solid #e2e8f0', verticalAlign: 'top' }}>
                        <input type="number" style={inputStyle} {...register(`materials.${index}.divide_by`, {
                          onChange: (e) => {
                            const divBy = Number(e.target.value) || 1;
                            const total = Number(formValues.materials?.[index]?.total_qty) || 0;
                            if (divBy > 0) if (!evaluateDynamicFormula(index, (e && e.target && e.target.name) ? { [e.target.name.split('.').pop()]: e.target.value } : {})) { setValue(`materials.${index}.sheet_qty`, Math.ceil(total / divBy)); }
                          }
                        })} />
                      </td>
                      <td style={{ padding: '0.25rem 0.3rem', borderRight: '1px solid #e2e8f0', verticalAlign: 'top' }}>
                        <input type="number" step="any" style={inputStyle} {...register(`materials.${index}.sheet_qty`)} />
                      </td>
                      <td style={{ padding: '0.25rem 0.3rem', borderRight: '1px solid #e2e8f0', verticalAlign: 'top' }}>
                        <input type="number" step="any" style={inputStyle} {...register(`materials.${index}.unit_cost`)} />
                      </td>
                      <td style={{ padding: '0.25rem 0.3rem', borderRight: '1px solid #e2e8f0', verticalAlign: 'top', textAlign: 'right', fontWeight: 'bold', color: '#0f172a', paddingTop: '0.5rem' }}>
                        {tCost.toLocaleString()}
                      </td>
                      <td style={{ padding: '0.25rem 0.3rem', verticalAlign: 'top' }}>
                        <input style={inputStyle} {...register(`materials.${index}.notes`)} />
                      </td>
                      <td style={{ padding: '0.25rem 0.3rem', verticalAlign: 'top', textAlign: 'center' }}>
                        <button type="button" onClick={() => removeMaterial(index)} style={{ width: '28px', height: '28px', borderRadius: '4px', backgroundColor: '#ef4444', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>X</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <button type="button" onClick={() => appendMaterial({ material_name: '', size: '', print_size: '', press_sheet: '', base_qty: Number(getValues('total_qty')) || 0, extra_qty: 0, total_qty: 0, divide_by: 1, sheet_qty: 0, unit_cost: 0, notes: '' })} className="btn btn-outline">
            + Материал нэмэх
          </button>
        </section>

        {/* 6. Ажиллагаа */}
        <section style={{ marginBottom: '2rem' }}>
          <h3 className="section-title">6. Ажиллагаа (Нугалаа, наалт, үдээ гэх мэт)</h3>
          {opFields.map((field, index) => {
            const o = formValues.operations?.[index];
            const tCost = (o?.qty || 0) * (o?.unit_cost || 0);
            const isCoating = o?.operation_name === 'Бүрэлт' || o?.operation_name?.startsWith('Бүрэлт');
            const isStrap = o?.operation_name?.toLowerCase().includes('оосор');
            const mpFormula = masterPrices.find(p => p.item_name === o?.operation_name)?.formula?.expression;
            return (
            <div key={field.id} className="row-item">
              <div className="form-group" style={{ flex: 1 }}>
                <label>[O1] Ажиллагааны нэр</label>
                <Controller
                  name={`operations.${index}.operation_name`}
                  control={control}
                  render={({ field }) => {
                    const opOptions = masterPrices.filter(p => {
                      const c = (p.category || '').toLowerCase();
                      return c.includes('ажилбар') || c.includes('ажиллагаа') || c.includes('operation');
                    }).map(p => ({ value: p.item_name, label: p.item_name, cost: p.unit_cost, formula: p.formula }));
                    return (
                      <CreatableSelect
                        {...field}
                        options={opOptions}
                        onChange={(selected: any) => {
                          const opName = selected ? selected.value : '';
                          field.onChange(opName);
                          if (selected && selected.cost) {
                            setValue(`operations.${index}.unit_cost`, selected.cost);
                          }
                          if (selected && selected.formula && selected.formula.expression) {
                            const newQty = evaluateOperationFormula(selected.formula.expression);
                            setValue(`operations.${index}.qty`, newQty);
                          }
                          if (opName === 'Бүрэлт' || opName.startsWith('Бүрэлт')) {
                            const coat = calculateCoatingOperation();
                            if (coat) {
                              setValue(`operations.${index}.qty`, coat.qty);
                              setValue(`operations.${index}.notes`, coat.notes);
                            }
                          }
                        }}
                        value={field.value ? { value: field.value, label: field.value } : null}
                        placeholder="Сонгох эсвэл бичих..."
                        isClearable
                        styles={{ control: (base) => ({ ...base, background: 'white', borderRadius: '0.375rem', borderColor: '#cbd5e1', minHeight: '40px' }) }}
                      />
                    );
                  }}
                />
              </div>
              {(o?.operation_name === 'Бүрэлт' || o?.operation_name?.startsWith('Бүрэлт')) && (
                <div className="form-group" style={{ width: '80px' }}>
                  <label>Хадаас</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="0"
                    {...register(`operations.${index}.extra_qty` as any, {
                      onChange: (e) => {
                        const extra = Number(e.target.value) || 0;
                        const coat = calculateCoatingOperation(extra);
                        if (coat) {
                          setValue(`operations.${index}.qty`, coat.qty);
                          setValue(`operations.${index}.notes`, coat.notes);
                        }
                      }
                    })}
                  />
                </div>
              )}
               <div className="form-group">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <label style={{ margin: 0 }}>Тоо</label>
                  {isCoating && (
                    <CalculationHelpBadge
                      title="Бүрэлтийн хуулганы тооцоо"
                      formula="(Үндсэн тоо [M5] + Хадаас) × Коэффициент"
                      liveCalculation={`Бодолт: ${o?.qty || 0} (Коэффициент B2=0.007, A2=0.006, A3=0.004)`}
                      details={[
                        "Хавтасны хэвлэлийн хэмжээнээс хамааран хуулганы өргөн болон коэффициент тодорхойлогдоно.",
                        "Хадаас талбарт оруулсан нэмэлт тоог Үндсэн тоотой нэмж үржүүлнэ."
                      ]}
                    />
                  )}
                  {isStrap && (
                    <CalculationHelpBadge
                      title="Цаасан торны оосор"
                      formula="Захиалгын нийт тоо × 2"
                      liveCalculation={`${formValues.total_qty || 0} × 2 = ${(formValues.total_qty || 0) * 2} ш`}
                      details={[
                        "1 ширхэг цаасан торонд 2 ширхэг оосор орох стандарттай."
                      ]}
                    />
                  )}
                  {!isCoating && !isStrap && mpFormula && (
                    <CalculationHelpBadge
                      title="Мастер үнийн сангийн томьёо"
                      formula={mpFormula}
                      liveCalculation={`Үр дүн: ${o?.qty || 0}`}
                      details={[
                        "Энэхүү ажиллагааны тоог Мастер үнийн санд тохируулсан динамик томьёогоор бодож байна."
                      ]}
                    />
                  )}
                </div>
                <input type="number" step="any" {...register(`operations.${index}.qty`)} />
              </div>
              <div className="form-group"><label>[O3] Нэгж өртөг</label><input type="number" step="any" {...register(`operations.${index}.unit_cost`)} /></div>
              <div className="form-group" style={{width: '100px'}}><label>[O4] Нийт өртөг</label><div style={{padding: '0.75rem', background: '#e2e8f0', borderRadius: '0.25rem'}}>{tCost.toLocaleString()}</div></div>
              <div className="form-group" style={{ flex: 1 }}><label>[O5] Тэмдэглэл</label><input {...register(`operations.${index}.notes`)} /></div>
              <button type="button" onClick={() => removeOp(index)} className="btn btn-danger" style={{height: '42px'}}>X</button>
            </div>
          )})}
          <button type="button" onClick={() => appendOp({ operation_name: '', qty: 0, unit_cost: 0, notes: '' })} className="btn btn-outline">+ Ажиллагаа нэмэх</button>
        </section>

        {/* 7. Гадуур ажил */}
        <section style={{ marginBottom: '2rem' }}>
          <h3 className="section-title">7. Гадуур ажил</h3>
          {outFields.map((field, index) => {
            const out = formValues.outsourced?.[index];
            const tCost = (out?.qty || 0) * (out?.unit_cost || 0);
            return (
            <div key={field.id} className="row-item">
              <div className="form-group" style={{ flex: 1 }}>
                <label>[A4] Ажлын нэр</label>
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
                        styles={{ control: (base) => ({ ...base, background: 'white', borderRadius: '0.375rem', borderColor: '#cbd5e1', minHeight: '40px' }) }}
                      />
                    );
                  }}
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
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
                        styles={{ control: (base) => ({ ...base, background: 'white', borderRadius: '0.375rem', borderColor: '#cbd5e1', minHeight: '40px' }) }}
                      />
                    );
                  }}
                />
              </div>
              <div className="form-group"><label>Тоо</label><input type="number" step="any" {...register(`outsourced.${index}.qty`)} /></div>
              <div className="form-group"><label>[X3] Нэгж өртөг</label><input type="number" step="any" {...register(`outsourced.${index}.unit_cost`)} /></div>
              <div className="form-group" style={{width: '100px'}}><label>[X4] Нийт өртөг</label><div style={{padding: '0.75rem', background: '#e2e8f0', borderRadius: '0.25rem'}}>{tCost.toLocaleString()}</div></div>
              <div className="form-group" style={{ flex: 1 }}><label>[X5] Тэмдэглэл</label><input {...register(`outsourced.${index}.notes`)} /></div>
              <button type="button" onClick={() => removeOut(index)} className="btn btn-danger" style={{height: '42px'}}>X</button>
            </div>
          )})}
          <button type="button" onClick={() => appendOut({ job_name: '', contractor_name: '', qty: 0, unit_cost: 0, notes: '' })} className="btn btn-outline">+ Гадуур ажил нэмэх</button>
        </section>

        {/* 8. Санхүүгийн нэгтгэл */}
        <section className="summary-box" style={{ marginBottom: '2rem' }}>
          <h3 className="section-title" style={{ color: '#2a4365', borderColor: '#90cdf4' }}>8. Санхүүгийн нэгтгэл</h3>
          
          <div className="grid grid-cols-2 gap-8">
            <div>
              <div className="summary-row"><span>Нэгжийн өртөг:</span> <strong>{Math.round(prices.unitCost).toLocaleString()} ₮</strong></div>
              <div className="summary-row"><span>Нийт өртөг:</span> <strong>{prices.factoryTotalCost.toLocaleString()} ₮</strong></div>
              <div className="summary-row" style={{ marginTop: '1rem', color: 'var(--primary-hover)', alignItems: 'center' }}>
                <span>Нэгжийн үнэ (Ашигтай):</span> 
                <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                  <input
                    type="number"
                    step="any"
                    value={displayUnitPrice}
                    onChange={(e) => {
                      setDisplayUnitPrice(e.target.value);
                      const newUnitPrice = Number(e.target.value) || 0;
                      const totalQty = Number(formValues.total_qty) || 1;
                      const newFinalPrice = newUnitPrice * totalQty;
                      const hasVat = formValues.has_vat || false;
                      const newNetPrice = hasVat ? newFinalPrice / 1.1 : newFinalPrice;
                      const factoryCost = prices.factoryTotalCost || 1;
                      let newMargin = ((newNetPrice - factoryCost) / factoryCost) * 100;
                      setValue('profit_margin', Number(newMargin.toFixed(2)));
                    }}
                    style={{width: '120px', padding: '0.4rem', border: '1px solid #cbd5e1', borderRadius: '0.25rem', textAlign: 'right'}}
                  />
                  <strong>₮</strong>
                </div>
              </div>
              <div className="summary-row summary-total">
                <span>Нийт үнэ:</span> <span>{prices.finalPrice.toLocaleString()} ₮</span>
              </div>

              <div className="form-group mt-4">
                <label>[F3] Ашгийн хувь (%)</label>
                <input type="number" step="any" {...register("profit_margin")} style={{background: 'white'}} />
              </div>
              <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
                <input type="checkbox" {...register("has_vat")} style={{ width: '1.2rem', height: '1.2rem' }} />
                <label style={{ margin: 0 }}>НӨАТ бодох эсэх (10%)</label>
              </div>
            </div>

            <div style={{background: 'rgba(255,255,255,0.5)', padding: '1.5rem', borderRadius: '0.5rem'}}>
              <h4 style={{fontWeight: 600, marginBottom: '1rem'}}>Төлбөрийн мэдээлэл & Төлөв</h4>
              
              <div className="flex" style={{gap: '1rem', marginBottom: '1rem'}}>
                <div className="form-group" style={{flex: 1}}>
                  <label>Төлбөрийн хэлбэр 1 (Урьдчилгаа)</label>
                  <select {...register("payment_method_1")} style={{background: 'white'}}>
                    <option value="">Сонгох...</option>
                    {groupedConstants['PAYMENT_METHOD']?.map((c: any) => (
                      <option key={c.id} value={c.value}>{c.value}</option>
                    )) || (
                      <><option value="Бэлэн">Бэлэн</option><option value="Данс">Данс</option><option value="Карт">Карт</option></>
                    )}
                  </select>
                </div>
                <div className="form-group" style={{width: '80px'}}>
                  <label>Хувь (%)</label>
                  <input type="number" step="any" {...register("payment_percent_1", {
                    onChange: (e) => {
                      const val = Number(e.target.value) || 0;
                      setValue('payment_percent_2', 100 - val);
                    }
                  })} style={{background: 'white'}} />
                </div>
              </div>

              <div className="flex" style={{gap: '1rem', marginBottom: '1rem'}}>
                <div className="form-group" style={{flex: 1}}>
                  <label>Төлбөрийн хэлбэр 2 (Үлдэгдэл)</label>
                  <select {...register("payment_method_2")} style={{background: 'white'}}>
                    <option value="">Сонгох...</option>
                    {groupedConstants['PAYMENT_METHOD']?.map((c: any) => (
                      <option key={c.id} value={c.value}>{c.value}</option>
                    )) || (
                      <><option value="Бэлэн">Бэлэн</option><option value="Данс">Данс</option><option value="Карт">Карт</option></>
                    )}
                  </select>
                </div>
                <div className="form-group" style={{width: '80px'}}>
                  <label>Хувь (%)</label>
                  <input type="number" step="any" {...register("payment_percent_2")} style={{background: 'white'}} />
                </div>
              </div>

              <div className="form-group" style={{marginBottom: '1rem'}}>
                <label>Санхүүгийн тайлбар, тэмдэглэл</label>
                <input {...register("finance_notes")} style={{background: 'white'}} />
              </div>

              <div className="flex" style={{gap: '1rem'}}>
                <div className="form-group" style={{flex: 1}}>
                  <label>Төлөв</label>
                  <input {...register("status")} readOnly style={{background: '#f1f5f9'}} />
                </div>
                <div className="form-group" style={{flex: 1}}>
                  <label>Дараагийн процесс</label>
                  <select {...register("next_process")} style={{background: 'white'}}>
                    <option value="">Сонгох...</option>
                    {groupedConstants['NEXT_PROCESS']?.map((c: any) => (
                      <option key={c.id} value={c.value}>{c.value}</option>
                    )) || (
                      <><option value="Эх бэлтгэл">Эх бэлтгэл</option><option value="Түүхий эд бэлтгэх">Түүхий эд бэлтгэх</option></>
                    )}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Наалдамхай хураангуй мөр (Sticky Summary Bar) */}
        <div style={{
          position: 'sticky',
          bottom: 0,
          background: 'rgba(255, 255, 255, 0.96)',
          backdropFilter: 'blur(10px)',
          borderTop: '2px solid #3b82f6',
          padding: '1rem 1.5rem',
          margin: '2rem -1rem -1rem -1rem',
          boxShadow: '0 -4px 15px rgba(0, 0, 0, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          zIndex: 50
        }}>
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div>
              <span style={{ fontSize: '0.85rem', color: '#64748b', display: 'block' }}>Захиалгын тоо:</span>
              <strong style={{ fontSize: '1.1rem', color: '#0f172a' }}>{Number(formValues.total_qty || 0).toLocaleString()} ш</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.85rem', color: '#64748b', display: 'block' }}>Нэгжийн үнэ:</span>
              <strong style={{ fontSize: '1.1rem', color: '#2563eb' }}>{Math.round(Number(displayUnitPrice || prices.unitPrice || 0)).toLocaleString()} ₮</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.85rem', color: '#64748b', display: 'block' }}>Ашгийн маржин:</span>
              <span style={{
                display: 'inline-block',
                padding: '0.2rem 0.6rem',
                borderRadius: '9999px',
                fontSize: '0.85rem',
                fontWeight: 600,
                backgroundColor: (Number(formValues.profit_margin) || 0) >= 20 ? '#d1fae5' : (Number(formValues.profit_margin) || 0) >= 10 ? '#fef3c7' : '#fee2e2',
                color: (Number(formValues.profit_margin) || 0) >= 20 ? '#065f46' : (Number(formValues.profit_margin) || 0) >= 10 ? '#92400e' : '#991b1b'
              }}>
                {Number(formValues.profit_margin || 0)}%
              </span>
            </div>
            <div>
              <span style={{ fontSize: '0.85rem', color: '#64748b', display: 'block' }}>НИЙТ ДҮН:</span>
              <strong style={{ fontSize: '1.35rem', color: '#1e3a8a' }}>{(prices.finalPrice || 0).toLocaleString()} ₮</strong>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 2rem', fontSize: '1.15rem', fontWeight: 600, borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.3)' }}>
            💾 {isEdit ? 'Захиалга шинэчлэх' : 'Захиалга бүртгэх'}
          </button>
        </div>
      </form>
    </div>
  );
}

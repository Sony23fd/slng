import { useMemo } from 'react';

export interface MaterialInput {
  total_qty: number;
  divide_by: number;
  sheet_qty?: number;
  unit_cost: number;
}

export interface OperationInput {
  qty: number;
  unit_cost: number;
  is_pricing?: boolean;
  is_post_profit?: boolean;
}

export interface OutsourcedInput {
  qty: number;
  unit_cost: number;
}

export interface PricingParams {
  total_product_qty: number; // Нийт хэвлэгдэх тоо
  materials: MaterialInput[];
  operations: OperationInput[];
  outsourced: OutsourcedInput[];
  profit_margin: number;
  has_vat: boolean;
  print_cost?: number;
  design_cost?: number;
  manual_unit_price?: number | null;
}

export function usePriceCalculator(params: PricingParams) {
  const calculations = useMemo(() => {
    // 1. Материалын тооцоо (Бүх материал нь ашгийн өмнөх суурь өртөгт орно)
    const totalMaterialCost = params.materials.reduce((sum, mat) => {
      const amountNeeded = mat.sheet_qty || 0;
      return sum + (amountNeeded * (mat.unit_cost || 0));
    }, 0);

    // 2. Ажиллагааны өртөг: Ашгийн өмнөх ба Ашгийн дараах гэж ангилах
    let preProfitOpsCost = 0;
    let postProfitOpsCost = 0;

    (params.operations || []).forEach(op => {
      const cost = Number(op.unit_cost) || 0;
      if (cost <= 0 || op.is_pricing === false) return;
      const totalOpCost = (op.qty || 0) * cost;
      if (op.is_post_profit) {
        postProfitOpsCost += totalOpCost;
      } else {
        preProfitOpsCost += totalOpCost;
      }
    });

    const totalOperationCost = preProfitOpsCost + postProfitOpsCost;

    // 3. Гадуур ажлын өртөг (Хэрэглэгчийн тодруулгаар Ашгийн өмнөх суурь өртөгт орно)
    const totalOutsourcedCost = (params.outsourced || []).reduce((sum, out) => {
      return sum + ((out.qty || 0) * (out.unit_cost || 0));
    }, 0);

    const printCost = Number(params.print_cost) || 0;   // Үндсэн хэвлэлтийн зардал (Ашгийн өмнөх)
    const designCost = Number(params.design_cost) || 0; // Эх бэлтгэлийн зардал (Ашгийн дараах)

    // 4. Суурь болон Шууд өртгийн задаргаа
    // Ашгийн өмнөх нийт суурь өртөг:
    const preProfitBaseCost = totalMaterialCost + preProfitOpsCost + totalOutsourcedCost + printCost;

    // Ашгийн дараах нийт шууд өртөг:
    const postProfitTotalCost = postProfitOpsCost + designCost;

    // Үйлдвэрийн бодит нийт өртөг:
    const factoryTotalCost = preProfitBaseCost + postProfitTotalCost;

    // 5. Нэгжийн өртөг (Бутархайг арилгаж дээш нь бүхэл төгрөг болгох)
    const qty = params.total_product_qty > 0 ? params.total_product_qty : 1;
    const rawUnitCost = factoryTotalCost / qty;
    const unitCost = Math.ceil(rawUnitCost);

    // 6. Цэвэр үнэ (Томьёо: Үндсэн өртөг * Ашиг + Ашгийн дараах)
    const margin = Number(params.profit_margin);
    const multiplier = margin > 10 ? ((100 + margin) / 100) : (margin > 0 ? margin : 2.3);
    const rawNetPrice = (preProfitBaseCost * multiplier) + postProfitTotalCost;

    // 7. Суурь нэгж үнэ (НӨАТ-гүй суурь үнэ)
    const baseAutoUnitPrice = Math.ceil(rawNetPrice / qty);
    const hasManualPrice = params.manual_unit_price !== undefined && 
                           params.manual_unit_price !== null && 
                           Number(params.manual_unit_price) > 0;
    const baseManualUnitPrice = hasManualPrice ? Math.round(Number(params.manual_unit_price)) : null;
    const baseUnitPrice = baseManualUnitPrice !== null ? baseManualUnitPrice : baseAutoUnitPrice;

    // 8. Нэхэмжлэхийн нэгж үнэ (НӨАТ тооцох үед суурь үнэн дээр 10% нэмэгдэнэ)
    // Хэрэв НӨАТ асаалттай бол суурь үнэн дээр 10% нэмэгдэж бүхэл төгрөг болно.
    const autoUnitPrice = params.has_vat ? Math.ceil(baseAutoUnitPrice * 1.10) : baseAutoUnitPrice;
    const unitPrice = params.has_vat ? Math.ceil(baseUnitPrice * 1.10) : baseUnitPrice;

    // 9. Нийт үнэ ба Цэвэр дүн (Нэхэмжлэх дээр Тоо ширхэг × Нэгж үнэ = Нийт дүн яв цав бүхэл төгрөгөөр тохирно)
    const finalPrice = unitPrice * qty;
    const netPrice = baseUnitPrice * qty;
    const vatAmount = finalPrice - netPrice;

    // 10. Үйлдвэрийн цэвэр ашиг (НӨАТ-гүй цэвэр орлогоос өртгийг хасна)
    const netProfit = netPrice - factoryTotalCost;

    return {
      totalMaterialCost,
      totalOperationCost,
      preProfitOpsCost,
      postProfitOpsCost,
      totalOutsourcedCost,
      preProfitBaseCost,
      postProfitTotalCost,
      factoryTotalCost,
      unitCost,
      rawUnitCost,
      baseUnitPrice,
      baseAutoUnitPrice,
      baseManualUnitPrice,
      netPrice,
      finalPrice,
      unitPrice,
      autoUnitPrice,
      vatAmount,
      isManualUnitPrice: hasManualPrice,
      netProfit
    };
  }, [params]);

  return calculations;
}

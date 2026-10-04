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

    // 5. Нэгжийн өртөг
    const qty = params.total_product_qty > 0 ? params.total_product_qty : 1;
    const unitCost = factoryTotalCost / qty;

    // 6. Цэвэр үнэ (Шинэ томьёо: Үндсэн өртөг * Ашиг + Ашгийн дараах)
    const margin = Number(params.profit_margin);
    const multiplier = margin > 10 ? ((100 + margin) / 100) : (margin > 0 ? margin : 2.3);
    const netPrice = (preProfitBaseCost * multiplier) + postProfitTotalCost;

    // 7. Эцсийн үнэ (Хэрэв has_vat сонгосон бол 10% НӨАТ нэмэгдэнэ)
    const finalPrice = params.has_vat ? netPrice * 1.10 : netPrice;

    // 8. Нэгжийн үнэ
    const unitPrice = finalPrice / qty;

    // 9. Үйлдвэрийн цэвэр ашиг
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
      netPrice,
      finalPrice,
      unitPrice,
      netProfit
    };
  }, [params]);

  return calculations;
}

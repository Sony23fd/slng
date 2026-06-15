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
}

export function usePriceCalculator(params: PricingParams) {
  const calculations = useMemo(() => {
    // 1. Материалын тооцоо
    const totalMaterialCost = params.materials.reduce((sum, mat) => {
      const amountNeeded = mat.sheet_qty || 0;
      return sum + (amountNeeded * (mat.unit_cost || 0));
    }, 0);

    // 2. Ажиллагааны өртөг
    const totalOperationCost = params.operations.reduce((sum, op) => {
      return sum + ((op.qty || 0) * (op.unit_cost || 0));
    }, 0);

    // 3. Гадуур ажлын өртөг
    const totalOutsourcedCost = params.outsourced.reduce((sum, out) => {
      return sum + ((out.qty || 0) * (out.unit_cost || 0));
    }, 0);

    // 4. Үйлдвэрийн нийт өртөг
    const factoryTotalCost = totalMaterialCost + totalOperationCost + totalOutsourcedCost + (params.print_cost || 0);

    // 5. Нэгжийн өртөг
    const qty = params.total_product_qty > 0 ? params.total_product_qty : 1;
    const unitCost = factoryTotalCost / qty;

    // 6. Цэвэр үнэ (Ашиг нэмсэн үнэ)
    const netPrice = factoryTotalCost * ((100 + (params.profit_margin || 0)) / 100);

    // 7. Эцсийн үнэ (НӨАТ)
    const finalPrice = params.has_vat ? netPrice * 1.10 : netPrice;

    // 8. Нэгжийн үнэ
    const unitPrice = finalPrice / qty;

    return {
      totalMaterialCost,
      totalOperationCost,
      totalOutsourcedCost,
      factoryTotalCost,
      unitCost,
      netPrice,
      finalPrice,
      unitPrice
    };
  }, [params]);

  return calculations;
}

"use client";

import React from 'react';
import OrderForm from '../../../../components/orders/OrderForm';

export default function NewOrderPage() {
  return (
    <OrderForm isCalculatorMode={true} />
  );
}

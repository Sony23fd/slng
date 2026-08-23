"use client";

import React from 'react';
import OrderForm from '../../../../components/orders/OrderForm';

export default function NewQuotePage() {
  return (
    <OrderForm isQuoteMode={true} />
  );
}

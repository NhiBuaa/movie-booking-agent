import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { PaymentProcessingView } from '@/features/payment/components/PaymentProcessingView';
import { FIGMA_ORDER_FIXTURE } from '@/features/payment/model/payment-fixtures';
import type { PaymentMethod } from '@/features/payment/model/types';

export const metadata: Metadata = {
  title: 'Đang xử lý thanh toán | CINORAGENT',
  description: 'Hệ thống đang kết nối đối soát an toàn với cổng thanh toán...',
};

interface PageProps {
  params: Promise<{ bookingId: string }>;
  searchParams: Promise<{ method?: string; total?: string }>;
}

export default async function ProcessingPage({ params, searchParams }: PageProps) {
  const { bookingId } = await params;
  const { method, total } = await searchParams;

  const validMethod = (['vnpay', 'momo', 'zalopay', 'atm', 'card'].includes(method || '')
    ? method
    : 'vnpay') as PaymentMethod;

  const numericTotal = total ? parseInt(total, 10) : undefined;

  const order = {
    ...FIGMA_ORDER_FIXTURE,
    bookingId: bookingId || FIGMA_ORDER_FIXTURE.bookingId,
    paymentMethod: validMethod,
  };

  return (
    <Suspense fallback={<div style={{ padding: 48, textAlign: 'center', color: '#8f8f8f' }}>Đang kết nối cổng thanh toán...</div>}>
      <PaymentProcessingView
        order={order}
        methodParam={validMethod}
        totalParam={numericTotal}
      />
    </Suspense>
  );
}

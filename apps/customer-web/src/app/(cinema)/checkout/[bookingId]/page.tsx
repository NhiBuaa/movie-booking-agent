import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { CheckoutView } from '@/features/payment/components/CheckoutView';
import { FIGMA_ORDER_FIXTURE } from '@/features/payment/model/payment-fixtures';

export const metadata: Metadata = {
  title: 'Xác nhận đơn hàng & Chọn thanh toán | CINORAGENT',
  description: 'Xác nhận vé xem phim, chọn phương thức thanh toán và hoàn tất đặt vé an toàn.',
};

interface PageProps {
  params: Promise<{ bookingId: string }>;
}

export default async function CheckoutPage({ params }: PageProps) {
  const { bookingId } = await params;
  const initialOrder = {
    ...FIGMA_ORDER_FIXTURE,
    bookingId: bookingId || FIGMA_ORDER_FIXTURE.bookingId,
  };

  return (
    <Suspense fallback={<div style={{ padding: 48, textAlign: 'center', color: '#8f8f8f' }}>Đang tải thông tin đơn hàng...</div>}>
      <CheckoutView initialOrder={initialOrder} />
    </Suspense>
  );
}

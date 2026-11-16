import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { PaymentFailedView } from '@/features/payment/components/PaymentFailedView';
import { FIGMA_ORDER_FIXTURE, SAMPLE_PAYMENT_FAILURE } from '@/features/payment/model/payment-fixtures';

export const metadata: Metadata = {
  title: 'Thanh toán chưa thành công | CINORAGENT',
  description: 'Giao dịch chưa hoàn tất hoặc hết thời gian xác thực. Ghế và quyền ưu đãi của bạn vẫn được bảo lưu.',
};

interface PageProps {
  params: Promise<{ bookingId: string }>;
}

export default async function FailedPage({ params }: PageProps) {
  const { bookingId } = await params;
  const order = {
    ...FIGMA_ORDER_FIXTURE,
    bookingId: bookingId || FIGMA_ORDER_FIXTURE.bookingId,
  };

  return (
    <Suspense fallback={<div style={{ padding: 48, textAlign: 'center', color: '#8f8f8f' }}>Đang tải trạng thái giao dịch...</div>}>
      <PaymentFailedView order={order} failureReason={SAMPLE_PAYMENT_FAILURE} />
    </Suspense>
  );
}

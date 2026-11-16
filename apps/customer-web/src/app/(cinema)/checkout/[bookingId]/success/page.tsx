import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { PaymentSuccessView } from '@/features/payment/components/PaymentSuccessView';
import { FIGMA_ETICKET_FIXTURE } from '@/features/payment/model/payment-fixtures';

export const metadata: Metadata = {
  title: 'Thanh toán thành công & Vé điện tử QR | CINORAGENT',
  description: 'Giao dịch đã được xác nhận an toàn bởi Cinema Core. Vé điện tử và mã QR đã sẵn sàng.',
};

interface PageProps {
  params: Promise<{ bookingId: string }>;
}

export default async function SuccessPage({ params }: PageProps) {
  const { bookingId } = await params;
  const ticket = {
    ...FIGMA_ETICKET_FIXTURE,
    bookingId: bookingId || FIGMA_ETICKET_FIXTURE.bookingId,
  };

  return (
    <Suspense fallback={<div style={{ padding: 48, textAlign: 'center', color: '#8f8f8f' }}>Đang phát hành vé điện tử...</div>}>
      <PaymentSuccessView ticket={ticket} />
    </Suspense>
  );
}

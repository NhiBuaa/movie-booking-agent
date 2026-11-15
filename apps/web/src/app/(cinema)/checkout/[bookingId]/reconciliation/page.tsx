import React from 'react';
import type { Metadata } from 'next';
import { ReconciliationView } from '@/features/payment/components/ReconciliationView.tsx';

interface ReconciliationPageProps {
  params: Promise<{
    bookingId: string;
  }>;
}

export const metadata: Metadata = {
  title: 'Tra soát giao dịch thanh toán | CinoraAgent',
  description: 'Đối soát trạng thái thanh toán Cinema Core tự động để bảo đảm quyền lợi ghế ngồi của khách hàng.',
};

export default async function ReconciliationPage({ params }: ReconciliationPageProps) {
  const { bookingId } = await params;
  return <ReconciliationView bookingId={bookingId} />;
}

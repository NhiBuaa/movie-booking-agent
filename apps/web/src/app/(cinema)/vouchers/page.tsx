import React from 'react';
import type { Metadata } from 'next';
import { VouchersView } from '@/features/vouchers/components/VouchersView.tsx';
import { VOUCHER_FIXTURES } from '@/features/vouchers/model/voucher-fixtures.ts';

export const metadata: Metadata = {
  title: 'Ưu Đãi & Ví Voucher | CinoraAgent',
  description: 'Quản lý mã giảm giá, áp dụng ưu đãi giá vé và combo bắp nước cho các suất chiếu tại CinoraAgent.',
};

export default function VouchersPage() {
  return <VouchersView initialVouchers={VOUCHER_FIXTURES} />;
}

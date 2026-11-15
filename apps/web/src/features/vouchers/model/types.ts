export interface VoucherItem {
  id: string;
  code: string;
  stubTitle: string;
  stubSubtitle: string;
  title: string;
  description: string;
  expiryDate: string;
  daysRemaining?: number;
  discountType: 'amount' | 'percent' | 'free_item';
  discountValue: number;
  minTicketCount?: number;
  applicableCinemas?: string;
  isUsed?: boolean;
}

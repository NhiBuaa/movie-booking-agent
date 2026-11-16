import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTicketById } from '@/features/tickets/model/ticket-fixtures';
import { RefundStatusView } from '@/features/tickets/components/RefundStatusView';

export const metadata: Metadata = {
  title: 'Tiến độ hoàn tiền & Tra soát giao dịch | CinoraAgent',
  description: 'Theo dõi tiến độ đối soát hoàn tiền tự động 100% về tài khoản sau khi hủy vé.',
};

interface RefundStatusPageProps {
  params: Promise<{
    ticketId: string;
  }>;
}

export default async function RefundStatusPage({ params }: RefundStatusPageProps) {
  const { ticketId } = await params;
  const ticket = getTicketById(ticketId);

  if (!ticket) {
    notFound();
  }

  return <RefundStatusView ticket={ticket} />;
}

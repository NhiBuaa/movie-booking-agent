import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTicketById } from '@/features/tickets/model/ticket-fixtures';
import { TicketCancelView } from '@/features/tickets/components/TicketCancelView';

export const metadata: Metadata = {
  title: 'Hủy vé & Hoàn tiền tự động | CinoraAgent',
  description: 'Yêu cầu hủy vé xem phim và hoàn tiền 100% tự động trước giờ chiếu.',
};

interface TicketCancelPageProps {
  params: Promise<{
    ticketId: string;
  }>;
}

export default async function TicketCancelPage({ params }: TicketCancelPageProps) {
  const { ticketId } = await params;
  const ticket = getTicketById(ticketId);

  if (!ticket) {
    notFound();
  }

  return <TicketCancelView ticket={ticket} />;
}

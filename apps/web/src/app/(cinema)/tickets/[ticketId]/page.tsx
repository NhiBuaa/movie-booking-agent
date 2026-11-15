import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ETicketDetailView } from '@/features/tickets/components/ETicketDetailView.tsx';
import { TICKET_FIXTURES } from '@/features/tickets/model/ticket-fixtures.ts';

interface TicketDetailPageProps {
  params: Promise<{
    ticketId: string;
  }>;
}

export async function generateMetadata({ params }: TicketDetailPageProps): Promise<Metadata> {
  const { ticketId } = await params;
  const ticket = TICKET_FIXTURES[ticketId] || TICKET_FIXTURES['MB-2026-000128'];

  if (!ticket) {
    return {
      title: 'Không tìm thấy vé | CinoraAgent',
    };
  }

  return {
    title: `Vé điện tử ${ticket.id} — ${ticket.movieTitle} | CinoraAgent`,
    description: `Mã check-in soát vé xem phim ${ticket.movieTitle} tại ${ticket.cinemaName}.`,
  };
}

export default async function TicketDetailPage({ params }: TicketDetailPageProps) {
  const { ticketId } = await params;
  const ticket = TICKET_FIXTURES[ticketId] || TICKET_FIXTURES['MB-2026-000128'];

  if (!ticket) {
    notFound();
  }

  return <ETicketDetailView ticket={ticket} />;
}

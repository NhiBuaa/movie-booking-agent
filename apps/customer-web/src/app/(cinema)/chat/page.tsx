import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { AgentWorkspaceView } from '@/features/agent/components/AgentWorkspaceView.tsx';

export const metadata: Metadata = {
  title: 'Buaa AI · Movie Booking Agent Workspace | CINORAGENT',
  description: 'Trò chuyện tự nhiên với trợ lý Buaa AI, đặt vé xem phim end-to-end, chọn ghế trực tiếp và nhận vé QR tức thì trong chat.',
};

export default function AgentChatPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '80vh', backgroundColor: '#000000' }} />}>
      <AgentWorkspaceView />
    </Suspense>
  );
}

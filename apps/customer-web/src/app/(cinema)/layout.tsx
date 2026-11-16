import React from 'react';

/**
 * Route group layout for (cinema)
 * Header and FooterWrapper are now global at root layout (src/app/layout.tsx)
 */
export default function CinemaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

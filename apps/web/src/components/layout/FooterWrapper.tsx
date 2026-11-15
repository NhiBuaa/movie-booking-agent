'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Footer } from './Footer';
import { resolveFooterDisplayState, type FooterDisplayState } from './layout-utils';

export type { FooterDisplayState };
export { resolveFooterDisplayState };

export const FooterWrapper: React.FC = () => {
  const pathname = usePathname();
  const displayState = resolveFooterDisplayState(pathname);

  if (displayState === 'none') {
    return null;
  }

  return <Footer variant={displayState} />;
};

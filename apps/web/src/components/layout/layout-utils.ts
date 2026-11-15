export type HeaderTab = 'discovery' | 'agent' | 'cinemas' | 'tickets' | 'none';
export type FooterDisplayState = 'none' | 'minimal' | 'full';

export function resolveHeaderActiveTab(
  pathname: string | null | undefined,
  fallbackTab: HeaderTab = 'discovery'
): HeaderTab {
  if (!pathname) return fallbackTab;
  if (pathname.startsWith('/chat')) return 'agent';
  if (pathname.startsWith('/cinemas')) return 'cinemas';
  if (pathname.startsWith('/my-tickets') || pathname.startsWith('/tickets')) return 'tickets';
  if (
    pathname.startsWith('/profile') ||
    pathname.startsWith('/notifications') ||
    pathname.startsWith('/auth')
  ) {
    return 'none';
  }
  return 'discovery';
}

export function resolveFooterDisplayState(pathname: string | null | undefined): FooterDisplayState {
  if (!pathname) return 'full';

  // S03 Agent Workspace: Full viewport screen without footer
  if (pathname.startsWith('/chat')) {
    return 'none';
  }

  // Booking Funnel, Checkout Funnel, Seat Map, E-Ticket Detail, Auth Pages
  // (S08, S11, S12, S13, S14, S30, S31) use Minimal Footer as specified in Figma
  if (
    pathname.startsWith('/booking') ||
    pathname.startsWith('/checkout') ||
    pathname.startsWith('/showtimes') ||
    pathname.startsWith('/tickets') ||
    pathname.startsWith('/auth')
  ) {
    return 'minimal';
  }

  return 'full';
}

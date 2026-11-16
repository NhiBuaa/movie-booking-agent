import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  resolveHeaderActiveTab,
  resolveFooterDisplayState,
} from '../src/components/layout/layout-utils.ts';

describe('Global Layout Navigation & Footer Synchronization', () => {
  describe('Header Active Tab Resolution (resolveHeaderActiveTab)', () => {
    it('should map root URL "/" to "discovery"', () => {
      assert.strictEqual(resolveHeaderActiveTab('/'), 'discovery');
    });

    it('should map movie detail routes to "discovery"', () => {
      assert.strictEqual(resolveHeaderActiveTab('/movies/chuyen-tau-cuoi-he'), 'discovery');
      assert.strictEqual(resolveHeaderActiveTab('/movies/chuyen-tau-cuoi-he/trailers'), 'discovery');
      assert.strictEqual(resolveHeaderActiveTab('/movies/chuyen-tau-cuoi-he/gallery'), 'discovery');
    });

    it('should map search and vouchers to "discovery"', () => {
      assert.strictEqual(resolveHeaderActiveTab('/search'), 'discovery');
      assert.strictEqual(resolveHeaderActiveTab('/vouchers'), 'discovery');
    });

    it('should map /chat to "agent" tab', () => {
      assert.strictEqual(resolveHeaderActiveTab('/chat'), 'agent');
    });

    it('should map cinema directory routes to "cinemas" tab', () => {
      assert.strictEqual(resolveHeaderActiveTab('/cinemas'), 'cinemas');
      assert.strictEqual(resolveHeaderActiveTab('/cinemas/c-1'), 'cinemas');
    });

    it('should map my-tickets and ticket detail routes to "tickets" tab', () => {
      assert.strictEqual(resolveHeaderActiveTab('/my-tickets'), 'tickets');
      assert.strictEqual(resolveHeaderActiveTab('/tickets/TKT-8892-VN'), 'tickets');
    });

    it('should return "none" for profile, notifications, and auth to avoid collision with discovery', () => {
      assert.strictEqual(resolveHeaderActiveTab('/profile'), 'none');
      assert.strictEqual(resolveHeaderActiveTab('/notifications'), 'none');
      assert.strictEqual(resolveHeaderActiveTab('/auth/login'), 'none');
    });

    it('should fallback gracefully when pathname is null or empty', () => {
      assert.strictEqual(resolveHeaderActiveTab(null), 'discovery');
      assert.strictEqual(resolveHeaderActiveTab(undefined, 'agent'), 'agent');
    });
  });

  describe('Footer Display State Resolution (resolveFooterDisplayState)', () => {
    it('should hide footer ("none") in Agent Workspace (/chat)', () => {
      assert.strictEqual(resolveFooterDisplayState('/chat'), 'none');
    });

    it('should render "full" footer for discovery, cinemas, movie details, profile, etc.', () => {
      assert.strictEqual(resolveFooterDisplayState('/'), 'full');
      assert.strictEqual(resolveFooterDisplayState('/cinemas'), 'full');
      assert.strictEqual(resolveFooterDisplayState('/movies/chuyen-tau-cuoi-he'), 'full');
      assert.strictEqual(resolveFooterDisplayState('/profile'), 'full');
      assert.strictEqual(resolveFooterDisplayState('/my-tickets'), 'full');
      assert.strictEqual(resolveFooterDisplayState('/vouchers'), 'full');
    });

    it('should render "minimal" footer for checkout, booking, seat selection, and e-ticket detail', () => {
      assert.strictEqual(resolveFooterDisplayState('/showtimes/st-3/seats'), 'minimal');
      assert.strictEqual(resolveFooterDisplayState('/booking/mv-1/seats'), 'minimal');
      assert.strictEqual(resolveFooterDisplayState('/booking/mv-1/combo'), 'minimal');
      assert.strictEqual(resolveFooterDisplayState('/checkout/bk-101'), 'minimal');
      assert.strictEqual(resolveFooterDisplayState('/tickets/TKT-8892-VN'), 'minimal');
      assert.strictEqual(resolveFooterDisplayState('/auth/login'), 'minimal');
    });

    it('should fallback to "full" when pathname is null', () => {
      assert.strictEqual(resolveFooterDisplayState(null), 'full');
    });
  });
});

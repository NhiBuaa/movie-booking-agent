import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { CINEMA_DIRECTORY_FIXTURES, getCinemaById } from '../src/features/cinemas/model/cinema-fixtures.ts';
import { ALL_TICKETS, getTicketById } from '../src/features/tickets/model/ticket-fixtures.ts';
import { VOUCHER_FIXTURES } from '../src/features/vouchers/model/voucher-fixtures.ts';
import { NOTIFICATION_FIXTURES } from '../src/features/notifications/model/notification-fixtures.ts';

describe('Cinema Domain Features (S17 & S18)', () => {
  it('should list all partner cinema locations', () => {
    assert.ok(CINEMA_DIRECTORY_FIXTURES.length >= 3);
    const dongKhoiSummary = CINEMA_DIRECTORY_FIXTURES.find((c) => c.id === 'cgv-vincom-dong-khoi');
    assert.ok(dongKhoiSummary);
    assert.ok(dongKhoiSummary?.name.includes('CGV Vincom Đồng Khởi'));
    assert.ok(dongKhoiSummary?.formats.some((f) => f.includes('IMAX')));

    const dongKhoiDetail = getCinemaById('cgv-vincom-dong-khoi');
    assert.ok(dongKhoiDetail);
    assert.strictEqual(dongKhoiDetail?.id, 'cgv-vincom-dong-khoi');
  });

  it('should have valid showtimes for movies at CGV Vincom Đồng Khởi', () => {
    const dongKhoi = getCinemaById('cgv-vincom-dong-khoi');
    assert.ok((dongKhoi?.movies.length ?? 0) > 0);
    const dune = dongKhoi?.movies.find((m) => m.title === 'Dune: Part Two');
    assert.ok(dune);
    assert.ok((dune?.formats.length ?? 0) > 0);
    assert.ok((dune?.formats[0].slots.length ?? 0) > 0);
  });
});

describe('Tickets Domain Features (S16, S20, S24, S26)', () => {
  it('should contain hero ticket with valid status and seats', () => {
    assert.ok(ALL_TICKETS.length >= 2);
    const hero = getTicketById('MB-2026-000128');
    assert.ok(hero);
    assert.strictEqual(hero?.status, 'upcoming');
    assert.deepStrictEqual(hero?.seats, ['G7', 'G8']);
    assert.strictEqual(hero?.totalPaid, 279000);
  });

  it('should retrieve e-ticket by ID accurately', () => {
    const ticket = getTicketById('MB-2026-000128');
    assert.strictEqual(ticket?.movieTitle, 'Dune: Part Two');
    assert.ok(ticket?.cinemaName.includes('CGV Vincom Đồng Khởi'));
  });
});

describe('Vouchers & Notifications Domain (S21 & S29)', () => {
  it('should list active promotional vouchers', () => {
    assert.ok(VOUCHER_FIXTURES.length >= 3);
  });

  it('should have notifications including showtime alert', () => {
    assert.ok(NOTIFICATION_FIXTURES.length >= 3);
    const showtimeNotif = NOTIFICATION_FIXTURES.find((n) => n.category === 'showtime');
    assert.ok(showtimeNotif);
    assert.ok(showtimeNotif?.title.includes('Dune: Part Two'));
  });
});

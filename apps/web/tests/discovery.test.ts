import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MOVIES_FIXTURE,
  CINEMAS_FIXTURE,
  VOUCHERS_FIXTURE,
  REVIEWS_FIXTURE,
  QUICK_BOOKING_OPTIONS,
} from '../src/features/discovery/model/discovery-fixtures.ts';

test('Discovery fixtures: Movie catalog integrity', () => {
  assert.ok(MOVIES_FIXTURE.length >= 4, 'Must have at least 4 movies for the gallery');
  const hero = MOVIES_FIXTURE.find((m) => m.isHero);
  assert.ok(hero, 'Must have a designated hero movie');
  assert.equal(hero.title, 'Chuyến tàu cuối hè');
  assert.equal(hero.format, 'IMAX 2D');

  const showing = MOVIES_FIXTURE.filter((m) => m.status === 'showing');
  const upcoming = MOVIES_FIXTURE.filter((m) => m.status === 'upcoming');
  assert.ok(showing.length >= 4, 'Must have at least 4 currently showing movies');
  assert.ok(upcoming.length >= 2, 'Must have at least 2 upcoming movies');
});

test('Discovery fixtures: Featured Cinemas coverage', () => {
  assert.equal(CINEMAS_FIXTURE.length, 3, 'Must have exactly 3 featured cinemas in S01');
  const landmark = CINEMAS_FIXTURE.find((c) => c.id === 'cinema-landmark-81');
  assert.ok(landmark, 'Landmark 81 must be present');
  assert.equal(landmark.badge, 'IMAX');
  assert.ok(landmark.todayShowtimesCount > 0);
});

test('Discovery fixtures: Vouchers and Promo codes', () => {
  assert.equal(VOUCHERS_FIXTURE.length, 3, 'Must have 3 exclusive vouchers in S01');
  const wednesday = VOUCHERS_FIXTURE.find((v) => v.code === 'HAPPYWED');
  assert.ok(wednesday, 'Wednesday promo must be HAPPYWED');
});

test('Discovery fixtures: Community Reviews CineScore', () => {
  assert.equal(REVIEWS_FIXTURE.length, 2, 'Must have 2 featured community reviews');
  assert.ok(REVIEWS_FIXTURE[0].quote.includes('Chuyến tàu cuối hè'));
});

test('Quick Booking: Options cascading structure', () => {
  assert.ok(QUICK_BOOKING_OPTIONS.cinemas.length >= 3);
  assert.ok(QUICK_BOOKING_OPTIONS.movies.length >= 3);
  assert.ok(QUICK_BOOKING_OPTIONS.dates.length >= 3);
  assert.ok(QUICK_BOOKING_OPTIONS.showtimes.length >= 3);
});

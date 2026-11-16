import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CHUYEN_TAU_CUOI_HE_FIXTURE,
  getMovieByIdOrSlug,
  filterShowtimes,
} from '../src/features/movie-details/model/movie-fixtures.ts';

test('S06 Movie Details: Chuyến tàu cuối hè metadata integrity', () => {
  const movie = CHUYEN_TAU_CUOI_HE_FIXTURE;

  assert.equal(movie.title, 'Chuyến tàu cuối hè');
  assert.equal(movie.slug, 'chuyen-tau-cuoi-he');
  assert.equal(movie.director, 'MINH AN');
  assert.ok(movie.ageRating === 'T18' || movie.ageRating === 'T16');
  assert.equal(movie.durationMinutes, 115);
  assert.equal(movie.durationFormatted, '115 PHÚT (1H 55M)');
  assert.ok(movie.cineScore >= 4.8);
  assert.ok(movie.reviewsCount >= 1000);
  assert.ok(movie.trailerUrl.length > 0);
  assert.equal(movie.trailerDuration, '02:15');

  // Verify cast
  const castNames = movie.cast.map((c) => c.name);
  assert.ok(castNames.includes('AN NHIÊN'));
  assert.ok(castNames.includes('HOÀNG NAM'));
  assert.ok(castNames.includes('THANH VY'));

  // Verify synopsis
  assert.ok(movie.synopsis.includes('chuyến tàu'));
});

test('S06 Movie Details: Schedule coverage for 04/11 & 05/11 at CGV Đồng Khởi & Landmark', () => {
  const schedule = CHUYEN_TAU_CUOI_HE_FIXTURE.schedule;

  assert.equal(schedule.length, 2, 'Must have schedule for 2 dates: 04/11 and 05/11');

  const day04 = schedule.find((s) => s.date === '04/11');
  const day05 = schedule.find((s) => s.date === '05/11');

  assert.ok(day04, 'Schedule for 04/11 must exist');
  assert.ok(day05, 'Schedule for 05/11 must exist');

  // Check cinemas on 04/11
  assert.ok(day04.cinemas.some((c) => c.cinemaSlug === 'dong-khoi'), 'Must include CGV Đồng Khởi');
  assert.ok(day04.cinemas.some((c) => c.cinemaSlug === 'landmark'), 'Must include CGV Landmark');

  // Check showtime slots: 18:15, 19:30, 20:45, 21:30
  const dongKhoiSlots = day04.cinemas.find((c) => c.cinemaSlug === 'dong-khoi')?.slots || [];
  const times = dongKhoiSlots.map((s) => s.time);

  assert.ok(times.includes('18:15'), 'Must include showtime 18:15');
  assert.ok(times.includes('19:30'), 'Must include showtime 19:30');
  assert.ok(times.includes('20:45'), 'Must include showtime 20:45');
  assert.ok(times.includes('21:30'), 'Must include showtime 21:30');

  // Check formats: 2D and IMAX
  const formats = dongKhoiSlots.map((s) => s.format);
  assert.ok(formats.includes('2D'));
  assert.ok(formats.includes('IMAX'));
});

test('S06 Movie Details: filterShowtimes logic', () => {
  const daySchedule = CHUYEN_TAU_CUOI_HE_FIXTURE.schedule[0];

  // ALL formats
  const allFiltered = filterShowtimes(daySchedule, 'ALL');
  assert.equal(allFiltered.cinemas.length, daySchedule.cinemas.length);

  // 2D only
  const twoDFiltered = filterShowtimes(daySchedule, '2D');
  for (const cinema of twoDFiltered.cinemas) {
    for (const slot of cinema.slots) {
      assert.equal(slot.format, '2D');
    }
  }

  // IMAX only
  const imaxFiltered = filterShowtimes(daySchedule, 'IMAX');
  for (const cinema of imaxFiltered.cinemas) {
    for (const slot of cinema.slots) {
      assert.equal(slot.format, 'IMAX');
    }
  }
});

test('S06 Movie Details: getMovieByIdOrSlug resolution', () => {
  const m1 = getMovieByIdOrSlug('chuyen-tau-cuoi-he');
  assert.equal(m1.title, 'Chuyến tàu cuối hè');

  const m2 = getMovieByIdOrSlug('movie-1');
  assert.equal(m2.title, 'Chuyến tàu cuối hè');

  const mCase = getMovieByIdOrSlug('CHUYEN-TAU-CUOI-HE');
  assert.equal(mCase.title, 'Chuyến tàu cuối hè');

  const mFallback = getMovieByIdOrSlug('non-existent-movie-slug');
  assert.ok(mFallback, 'Fallback should provide default movie');
  assert.equal(mFallback.title, 'Chuyến tàu cuối hè');
});

test('S06 Movie Details: Related movies and CineScore community reviews', () => {
  const movie = CHUYEN_TAU_CUOI_HE_FIXTURE;

  assert.ok(movie.relatedMovies.length >= 4, 'Must have at least 4 related movies for carousel');
  assert.ok(movie.relatedMovies.some((m) => m.title === 'Một ngày ở Đà Lạt'));

  assert.ok(movie.reviews.length >= 3, 'Must have community reviews');
  for (const rev of movie.reviews) {
    assert.ok(rev.rating >= 4.5);
    assert.ok(rev.author.length > 0);
    assert.ok(rev.comment.length > 0);
  }
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_PERSONAL_INFO,
  DEFAULT_CINE_PREFERENCES,
  CINEMA_OPTIONS,
  GENRE_OPTIONS,
  SHOWTIME_SLOT_OPTIONS,
  FORMAT_OPTIONS,
  SEAT_POSITION_OPTIONS,
} from '../src/features/profile/model/profile-types.ts';

test('S27 Profile: Personal information defaults integrity', () => {
  const info = DEFAULT_PERSONAL_INFO;
  assert.equal(info.fullName, 'Nguyễn Minh An');
  assert.equal(info.phone, '0908 123 890');
  assert.ok(info.isPhoneVerified);
  assert.equal(info.email, 'nhibuaa@cinora.vn');
  assert.equal(info.gender, 'male');
  assert.ok(info.twoFactorAuth);
  assert.equal(info.passwordLastChangedDays, 45);
});

test('S27 CinePreferences: Defaults match Figma specs for Buaa AI context', () => {
  const prefs = DEFAULT_CINE_PREFERENCES;
  assert.equal(prefs.defaultCinemaId, 'cgv-dong-khoi');
  assert.ok(prefs.autoPreferredCinema);

  // Default preferred genres: Tâm lý, Tình cảm (tam-ly), Sci-fi (sci-fi), Hành động (hanh-dong)
  assert.ok(prefs.preferredGenres.includes('tam-ly'));
  assert.ok(prefs.preferredGenres.includes('sci-fi'));
  assert.ok(prefs.preferredGenres.includes('hanh-dong'));
  assert.equal(prefs.preferredGenres.length, 3);

  // Default showtime: Evening (slot-evening)
  assert.ok(prefs.preferredShowtimeSlots.includes('slot-evening'));

  // Default formats: IMAX Laser (imax-laser) and Standard 2D (standard-2d)
  assert.ok(prefs.preferredFormats.includes('imax-laser'));
  assert.ok(prefs.preferredFormats.includes('standard-2d'));

  // Default seat habit: center_vip
  assert.equal(prefs.preferredSeatPosition, 'center_vip');

  // AI Learning and Reminders
  assert.ok(prefs.learnFromTicketHistory);
  assert.ok(prefs.showtimeReminders);
});

test('S27 Options: Coverage for Cinemas, Genres, Formats, and Seats', () => {
  assert.equal(CINEMA_OPTIONS.length, 5, 'Must have 5 partner cinemas');
  assert.equal(GENRE_OPTIONS.length, 8, 'Must have 8 movie genres in 4-column grid');
  assert.equal(SHOWTIME_SLOT_OPTIONS.length, 4, 'Must have 4 time slots');
  assert.equal(FORMAT_OPTIONS.length, 4, 'Must have 4 theater formats');
  assert.equal(SEAT_POSITION_OPTIONS.length, 3, 'Must have 3 seat preference zones (Front, Center VIP, Rear)');
});

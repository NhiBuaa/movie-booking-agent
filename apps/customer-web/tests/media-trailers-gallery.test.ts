import test from 'node:test';
import assert from 'node:assert/strict';
import {
  S22A_VIDEO_PLAYLIST,
  S22B_PHOTO_GALLERY,
} from '../src/features/movie-details/model/media-fixtures.ts';
import { getMovieByIdOrSlug } from '../src/features/movie-details/model/movie-fixtures.ts';

test('S22A Movie Trailers: Playlist coverage and metadata integrity', () => {
  assert.equal(S22A_VIDEO_PLAYLIST.length, 4, 'Must have exactly 4 video playlist items per Figma');

  const [trailer1, teaser, bts, interview] = S22A_VIDEO_PLAYLIST;

  // Video 1: Trailer chính thức
  assert.equal(trailer1.title, 'Trailer chính thức');
  assert.equal(trailer1.category, 'trailer');
  assert.equal(trailer1.duration, '02:18');
  assert.equal(trailer1.durationSeconds, 138);
  assert.ok(trailer1.officialTitle.includes('OFFICIAL TRAILER'));
  assert.ok(trailer1.hasCaptions);

  // Video 2: Teaser Trailer
  assert.equal(teaser.title, 'Teaser Trailer');
  assert.equal(teaser.category, 'teaser');
  assert.equal(teaser.duration, '01:05');
  assert.equal(teaser.durationSeconds, 65);

  // Video 3: Hậu trường sản xuất (BTS)
  assert.equal(bts.title, 'Hậu trường sản xuất (BTS)');
  assert.equal(bts.category, 'bts');
  assert.equal(bts.duration, '04:42');

  // Video 4: Phỏng vấn dàn diễn viên
  assert.equal(interview.title, 'Phỏng vấn dàn diễn viên');
  assert.equal(interview.category, 'interview');
  assert.equal(interview.duration, '03:15');
});

test('S22B Movie Gallery: 5-column mosaic and category distribution', () => {
  assert.equal(S22B_PHOTO_GALLERY.length, 15, 'Must have 15 mosaic photo tiles per Figma Node 580:954');

  // Check 5 columns distribution (3 items per column in Figma 15-tile mosaic)
  for (let col = 1; col <= 5; col++) {
    const colPhotos = S22B_PHOTO_GALLERY.filter((p) => p.column === col);
    assert.equal(colPhotos.length, 3, `Column ${col} must contain exactly 3 tiles`);
  }

  // Check hero tile (Tile 183 in Column 3)
  const heroTile = S22B_PHOTO_GALLERY.find((p) => p.isHero);
  assert.ok(heroTile, 'Must have a hero key still tile');
  assert.equal(heroTile.column, 3);
  assert.equal(heroTile.height, 270);

  // Check categories exist
  const stills = S22B_PHOTO_GALLERY.filter((p) => p.category === 'stills');
  const bts = S22B_PHOTO_GALLERY.filter((p) => p.category === 'bts');
  const posters = S22B_PHOTO_GALLERY.filter((p) => p.category === 'posters');

  assert.ok(stills.length > 0, 'Must have still photos');
  assert.ok(bts.length > 0, 'Must have behind the scenes photos');
  assert.ok(posters.length > 0, 'Must have poster art photos');
});

test('Movie Details navigation routes resolution', () => {
  const movie = getMovieByIdOrSlug('chuyen-tau-cuoi-he');
  assert.ok(movie, 'Movie chuyen-tau-cuoi-he must resolve');
  assert.equal(movie.galleryCount, 24);
});

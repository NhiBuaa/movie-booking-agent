import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  filterMovies,
  isFilterActive,
  isOnlyFacetFilterActive,
  getFilterSummaryText,
  getDefaultFilterState,
} from '../src/features/search/model/search-logic.ts';
import { SEARCH_MOVIES_FIXTURE } from '../src/features/search/model/search-fixtures.ts';

describe('S02 Search & Filters Logic', () => {
  test('returns all 4 fixture movies on default filter state', () => {
    const defaultState = getDefaultFilterState();
    const results = filterMovies(SEARCH_MOVIES_FIXTURE, defaultState);
    assert.equal(results.length, 4);
    assert.equal(isFilterActive(defaultState), false);
    assert.equal(getFilterSummaryText(results.length, defaultState), '4 phim · Chưa áp dụng bộ lọc');
  });

  test('filters movies by text query', () => {
    const state = { ...getDefaultFilterState(), query: 'Chuyến tàu' };
    const results = filterMovies(SEARCH_MOVIES_FIXTURE, state);
    assert.equal(results.length, 1);
    assert.equal(results[0].id, 'chuyen-tau-cuoi-he');
    assert.equal(isFilterActive(state), true);
    assert.equal(getFilterSummaryText(results.length, state), '1 phim · Từ khóa "Chuyến tàu"');
  });

  test('filters movies by genre facet', () => {
    const state = { ...getDefaultFilterState(), genre: 'Khoa học viễn tưởng' };
    const results = filterMovies(SEARCH_MOVIES_FIXTURE, state);
    assert.equal(results.length, 1);
    assert.equal(results[0].id, 'ben-kia-bau-troi');
    assert.equal(isFilterActive(state), true);
    assert.equal(isOnlyFacetFilterActive(state), true);
    assert.equal(getFilterSummaryText(results.length, state), '1 phim · Khoa học viễn tưởng');
  });

  test('filters movies by cinema facet', () => {
    const state = { ...getDefaultFilterState(), cinema: 'CINORA Landmark' };
    const results = filterMovies(SEARCH_MOVIES_FIXTURE, state);
    // Landmark has: Chuyến tàu, Bên kia bầu trời, Một ngày ở Đà Lạt
    assert.equal(results.length, 3);
    assert.ok(results.every((m) => m.cinemas.includes('CINORA Landmark')));
  });

  test('filters movies by format facet', () => {
    const state = { ...getDefaultFilterState(), format: 'IMAX' };
    const results = filterMovies(SEARCH_MOVIES_FIXTURE, state);
    // IMAX has: Chuyến tàu, Thành phố không ngủ, Bên kia bầu trời
    assert.equal(results.length, 3);
    assert.ok(results.every((m) => m.formats.includes('IMAX')));
  });

  test('filters movies by date facet', () => {
    const state = { ...getDefaultFilterState(), date: '05/11' };
    const results = filterMovies(SEARCH_MOVIES_FIXTURE, state);
    // 05/11 has: Chuyến tàu, Bên kia bầu trời, Một ngày ở Đà Lạt
    assert.equal(results.length, 3);
    assert.ok(results.every((m) => m.dates.includes('05/11')));
  });

  test('returns empty array when no movies match compound filters', () => {
    const state = {
      ...getDefaultFilterState(),
      genre: 'Khoa học viễn tưởng',
      cinema: 'CINORA Đồng Khởi', // Bên kia bầu trời is only at Landmark
    };
    const results = filterMovies(SEARCH_MOVIES_FIXTURE, state);
    assert.equal(results.length, 0);
  });
});

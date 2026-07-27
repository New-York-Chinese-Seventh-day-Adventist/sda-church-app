import assert from 'node:assert/strict';
import test from 'node:test';
import {
  DEFAULT_TEXT_SCALE,
  isTextScale,
  normalizeTextScale,
  parseStoredTextScale,
  scaleTypographyMetric,
  scaleTypographyRecord,
  serializeTextScale,
  TEXT_SCALE_MAX,
  TEXT_SCALE_MIN,
  TEXT_SCALE_STEP,
} from './AppPreferences.mjs';

test('accepts every 100%-200% value in exact 5% steps', () => {
  for (let index = 0; index <= 20; index += 1) {
    const value = Number((TEXT_SCALE_MIN + index * TEXT_SCALE_STEP).toFixed(2));
    assert.equal(isTextScale(value), true);
    assert.equal(Number(serializeTextScale(value)), value);
  }
  assert.equal(TEXT_SCALE_MAX, 2);
});

test('normalizes native floating-point step noise', () => {
  assert.equal(normalizeTextScale(1.0499999523162842), 1.05);
  assert.equal(normalizeTextScale(1.9500000476837158), 1.95);
});

test('rejects non-finite, out-of-range, and off-step values', () => {
  for (const value of [Number.NaN, Number.POSITIVE_INFINITY, 0.95, 2.05, 1.01]) {
    assert.equal(isTextScale(value), false);
  }
  assert.throws(() => serializeTextScale(1.01), /100% and 200%/);
});

test('stored values fail safely to 100%', () => {
  assert.equal(parseStoredTextScale(null), DEFAULT_TEXT_SCALE);
  assert.equal(parseStoredTextScale(''), DEFAULT_TEXT_SCALE);
  assert.equal(parseStoredTextScale('not-a-number'), DEFAULT_TEXT_SCALE);
  assert.equal(parseStoredTextScale('1.75'), 1.75);
});

test('typography scaling preserves input objects', () => {
  const variants = {
    body: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 16, lineHeight: 24 },
  };
  const scaled = scaleTypographyRecord(variants, 1.5);
  assert.deepEqual(scaled.body, {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 24,
    lineHeight: 36,
  });
  assert.equal(variants.body.fontSize, 16);
  assert.equal(scaleTypographyMetric(13, 1.25), 16.25);
});

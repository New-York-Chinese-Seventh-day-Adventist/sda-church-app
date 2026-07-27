import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getBottomTabContentHeight,
  getGlobalHeaderContentHeight,
} from './Layout.ts';

test('shared navigation heights grow with effective text size', () => {
  assert.equal(getGlobalHeaderContentHeight(1), 64);
  assert.equal(getGlobalHeaderContentHeight(1.5), 76);
  assert.equal(getGlobalHeaderContentHeight(2), 88);
  assert.equal(getGlobalHeaderContentHeight(Number.NaN), 64);
  assert.ok(getBottomTabContentHeight(2) > getBottomTabContentHeight(1));
  assert.equal(getBottomTabContentHeight(2), 104);
});

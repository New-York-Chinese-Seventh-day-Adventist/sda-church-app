import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createSabbathCountdownViewModel,
  formatCountdownForAccessibility,
} from './SabbathCountdownViewModel.ts';

const labels = {
  starts: 'Sabbath starts in',
  ends: 'Sabbath ends in',
  loading: 'Loading verified sunset times…',
  unavailable: 'Sunset times are unavailable',
  openDetailsHint: 'Opens sunset details',
};

test('ready summaries preserve the compact countdown and expose one-minute accessibility copy', () => {
  const model = createSabbathCountdownViewModel({
    status: 'ready',
    isSabbath: false,
    countdown: '2d 04:03:59',
    dateLabel: 'Friday, July 31st',
    locationLabel: 'Elmhurst, NY',
    labels,
  });

  assert.equal(model.title, 'Sabbath starts in');
  assert.equal(model.countdownText, '2d 04:03:59');
  assert.equal(model.secondaryText, 'Friday, July 31st · Elmhurst, NY');
  assert.match(model.accessibilityLabel, /2 days, 4 hours, 3 minutes remaining/);
  assert.doesNotMatch(model.accessibilityLabel, /59/);
  assert.equal(model.accessibilityHint, 'Opens sunset details');
  assert.equal(model.canRetryProvider, false);
});

test('active Sabbath uses the verified end label without changing the data model', () => {
  const model = createSabbathCountdownViewModel({
    status: 'ready',
    isSabbath: true,
    countdown: '03:12:10',
    dateLabel: 'Saturday, August 1st',
    locationLabel: 'Your location',
    labels,
  });

  assert.equal(model.title, 'Sabbath ends in');
  assert.match(model.accessibilityLabel, /3 hours, 12 minutes remaining/);
});

test('loading and unavailable states never display an authoritative countdown', () => {
  const loading = createSabbathCountdownViewModel({
    status: 'loading',
    isSabbath: false,
    countdown: '12:00:00',
    dateLabel: null,
    locationLabel: 'Elmhurst, NY',
    labels,
  });
  const unavailable = createSabbathCountdownViewModel({
    status: 'unavailable',
    isSabbath: false,
    countdown: '12:00:00',
    dateLabel: null,
    locationLabel: 'Elmhurst, NY',
    labels,
  });

  assert.equal(loading.countdownText, '—');
  assert.equal(loading.canRetryProvider, false);
  assert.equal(unavailable.countdownText, '—');
  assert.equal(unavailable.canRetryProvider, true);
  assert.doesNotMatch(unavailable.accessibilityLabel, /12:00:00/);
});

test('accessibility formatting rejects malformed values and suppresses seconds', () => {
  assert.equal(formatCountdownForAccessibility('00:00:59'), 'Less than one minute remaining');
  assert.equal(formatCountdownForAccessibility('00:01:59'), '1 minute remaining');
  assert.equal(formatCountdownForAccessibility('99:00:00'), 'Countdown unavailable');
  assert.equal(formatCountdownForAccessibility('not-a-countdown'), 'Countdown unavailable');
});

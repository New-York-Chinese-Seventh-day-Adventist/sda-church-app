import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

import {
  calculateSabbathWindow,
  createSunsetRangeRequest,
  getSunsetApiRangeUrl,
  isSameSunsetLocation,
  normalizeSunsetCoordinates,
  parseSunsetV2Range,
  selectNextSunsetPair,
  selectSunsetLocation,
  SUNSET_COORDINATE_ECHO_TOLERANCE,
  SUNSET_LOCATION_PRIVACY_COPY,
  SUNSET_LOCATION_PROVIDER_HOST,
  SUNSET_PROVIDER_ATTRIBUTION_URL,
} from './SunsetLocationPolicy.ts';

const elmhurst = Object.freeze({ lat: 40.74546, lng: -73.88914 });
const request = createSunsetRangeRequest(new Date('2030-01-05T23:30:00Z'));

function createValidRangeResponse() {
  return {
    tzid: 'America/New_York',
    lat: 40.7455,
    lng: -73.8891,
    days: request.expectedDates.map((date) => ({
      date,
      sunset: `${date}T17:00:00-05:00`,
    })),
  };
}

test('Elmhurst remains selected until consented device coordinates exist', () => {
  const defaultLocation = selectSunsetLocation(elmhurst, null);
  const deviceCoordinates = normalizeSunsetCoordinates(40.7128, -74.006);
  assert.deepEqual(defaultLocation, {
    coordinates: elmhurst,
    source: 'elmhurst',
  });
  assert.ok(deviceCoordinates);
  assert.deepEqual(selectSunsetLocation(elmhurst, deviceCoordinates), {
    coordinates: deviceCoordinates,
    source: 'device',
  });
  assert.equal(
    isSameSunsetLocation(
      defaultLocation,
      selectSunsetLocation(elmhurst, null),
    ),
    true,
  );
  assert.equal(
    isSameSunsetLocation(
      defaultLocation,
      selectSunsetLocation(elmhurst, deviceCoordinates),
    ),
    false,
  );
});

test('invalid browser coordinates cannot displace the default', () => {
  assert.equal(normalizeSunsetCoordinates(Number.NaN, -73), null);
  assert.equal(normalizeSunsetCoordinates(91, -73), null);
  assert.equal(normalizeSunsetCoordinates(40, -181), null);
  assert.equal(normalizeSunsetCoordinates('40', -73), null);
});

test('the v2 request bounds two future Fri/Sat pairs across timezone skew', () => {
  assert.equal(request.dateStart, '2030-01-03');
  assert.equal(request.dateEnd, '2030-01-19');
  assert.equal(request.expectedDates.length, 17);
  assert.equal(
    getSunsetApiRangeUrl(elmhurst.lat, elmhurst.lng, request.dateStart, request.dateEnd),
    'https://api.sunrise-sunset.org/v2?lat=40.74546&lng=-73.88914&date_start=2030-01-03&date_end=2030-01-19',
  );
  assert.throws(() => createSunsetRangeRequest(new Date(Number.NaN)), /invalid/);
});

test('v2 validation binds every day to the expected coordinates and timezone', () => {
  const valid = createValidRangeResponse();
  const parsed = parseSunsetV2Range(valid, elmhurst, request.expectedDates);
  assert.ok(parsed);
  assert.equal(parsed.tzid, 'America/New_York');
  assert.deepEqual(
    parsed.days.map(({ date }) => date),
    request.expectedDates,
  );

  assert.equal(
    parseSunsetV2Range(
      { ...valid, lat: elmhurst.lat + SUNSET_COORDINATE_ECHO_TOLERANCE + 0.00001 },
      elmhurst,
      request.expectedDates,
    ),
    null,
  );
  assert.equal(
    parseSunsetV2Range({ ...valid, tzid: '../New_York' }, elmhurst, request.expectedDates),
    null,
  );
  assert.equal(
    parseSunsetV2Range(
      { ...valid, days: valid.days.slice(0, -1) },
      elmhurst,
      request.expectedDates,
    ),
    null,
  );

  const wrongTimestampDate = structuredClone(valid);
  wrongTimestampDate.days[0].sunset = '2030-01-04T17:00:00-05:00';
  assert.equal(
    parseSunsetV2Range(wrongTimestampDate, elmhurst, request.expectedDates),
    null,
  );
});

test('selection uses adjacent verified pairs and advances without approximation', () => {
  const parsed = parseSunsetV2Range(
    createValidRangeResponse(),
    elmhurst,
    request.expectedDates,
  );
  assert.ok(parsed);

  const firstPair = selectNextSunsetPair(parsed, new Date('2030-01-04T20:00:00Z'));
  assert.ok(firstPair);
  assert.equal(firstPair.fridayDate, '2030-01-04');
  assert.equal(firstPair.saturdayDate, '2030-01-05');
  assert.equal(
    calculateSabbathWindow(
      new Date('2030-01-04T20:00:00Z'),
      firstPair.fri,
      firstPair.sat,
    )?.millisecondsRemaining,
    2 * 60 * 60 * 1_000,
  );

  const nextPair = selectNextSunsetPair(parsed, new Date('2030-01-05T23:00:00Z'));
  assert.ok(nextPair);
  assert.equal(nextPair.fridayDate, '2030-01-11');
  assert.equal(nextPair.saturdayDate, '2030-01-12');
  assert.equal(
    calculateSabbathWindow(
      new Date('2030-01-05T23:00:00Z'),
      firstPair.fri,
      firstPair.sat,
    ),
    null,
  );
});

test('missing or implausible sunsets fail closed', () => {
  const response = createValidRangeResponse();
  const firstFridayIndex = response.days.findIndex(
    ({ date }) => new Date(`${date}T12:00:00Z`).getUTCDay() === 5,
  );
  response.days[firstFridayIndex].sunset = null;
  const parsed = parseSunsetV2Range(response, elmhurst, request.expectedDates);
  assert.ok(parsed);
  assert.equal(
    selectNextSunsetPair(parsed, new Date('2030-01-04T20:00:00Z'))?.fridayDate,
    '2030-01-11',
  );

  const invalid = createValidRangeResponse();
  invalid.days[firstFridayIndex + 1].sunset =
    `${invalid.days[firstFridayIndex + 1].date}T02:00:00-05:00`;
  const parsedInvalid = parseSunsetV2Range(invalid, elmhurst, request.expectedDates);
  assert.ok(parsedInvalid);
  assert.equal(
    selectNextSunsetPair(parsedInvalid, new Date('2030-01-04T20:00:00Z'))?.fridayDate,
    '2030-01-11',
  );
});

test('privacy copy discloses provider transfer, retention, and fallback', () => {
  assert.match(SUNSET_LOCATION_PRIVACY_COPY.disclosure, /latitude and longitude/i);
  assert.match(
    SUNSET_LOCATION_PRIVACY_COPY.disclosure,
    new RegExp(SUNSET_LOCATION_PROVIDER_HOST),
  );
  assert.match(SUNSET_LOCATION_PRIVACY_COPY.disclosure, /does not save or log/i);
  assert.match(SUNSET_LOCATION_PRIVACY_COPY.disclosure, /Elmhurst/i);
});

test('Home keeps consent explicit, offers provider retry, and never synthesizes 6 PM', () => {
  const source = fs.readFileSync(
    new URL('../app/(tabs)/index.tsx', import.meta.url),
    'utf8',
  );
  const requestFunctionStart = source.indexOf('const requestCurrentLocation');
  const permissionCall = source.indexOf('navigator.geolocation.getCurrentPosition');

  assert.notEqual(requestFunctionStart, -1);
  assert.ok(permissionCall > requestFunctionStart);
  assert.equal(source.match(/navigator\.geolocation\.getCurrentPosition/g)?.length, 1);
  assert.match(source, /modalState === 'location-disclosure'/);
  assert.match(source, /location\.source === 'device'[\s\S]*cache: 'no-store'/);
  assert.match(source, /SUNSET_REQUEST_TIMEOUT_MS/);
  assert.match(source, /getSunsetApiRangeUrl/);
  assert.match(source, /selectNextSunsetPair\(sunsetState\.range, now\)/);
  assert.match(source, /retrySunsetData[\s\S]*setSunsetRefreshNonce/);
  assert.match(source, /SUNSET_PROVIDER_ATTRIBUTION_URL/);
  assert.doesNotMatch(source, /setHours\(18,/);
  assert.equal(SUNSET_PROVIDER_ATTRIBUTION_URL, 'https://sunrise-sunset.org/');
});

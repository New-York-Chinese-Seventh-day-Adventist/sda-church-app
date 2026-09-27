import { getSunsetApiUrl } from '@/constants/ExternalLinks';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type SunTimes = {
  sunrise: Date;
  sunset: Date;
};

type StoredSunTimes = {
  sunrise: string;
  sunset: string;
};

const SUN_TIMES_CACHE_PREFIX = 'sun-times-v1:';
// Cached days are tiny, but pruning keeps the store from growing forever.
const SUN_TIMES_RETENTION_DAYS = 14;

// Sunrise-Sunset asks clients to cache: "the times for a given date never
// change". One request per place and date also shares a single in-flight
// fetch between the home countdown and the sunset theme.
const pendingRequests = new Map<string, Promise<SunTimes | null>>();

/** Local calendar date as YYYY-MM-DD. */
export const toLocalIsoDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getCacheKey = (lat: number, lng: number, date: string) =>
  `${SUN_TIMES_CACHE_PREFIX}${lat},${lng}:${date}`;

const parseSunTimes = (value: unknown): SunTimes | null => {
  if (!value || typeof value !== 'object') return null;
  const { sunrise, sunset } = value as Partial<StoredSunTimes>;
  if (typeof sunrise !== 'string' || typeof sunset !== 'string') return null;

  const parsed = { sunrise: new Date(sunrise), sunset: new Date(sunset) };
  return Number.isNaN(parsed.sunrise.getTime()) || Number.isNaN(parsed.sunset.getTime())
    ? null
    : parsed;
};

const pruneOldSunTimes = async (now: Date) => {
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - SUN_TIMES_RETENTION_DAYS);
  const cutoffDate = toLocalIsoDate(cutoff);

  const keys = await AsyncStorage.getAllKeys();
  const expired = keys.filter(
    (key) =>
      key.startsWith(SUN_TIMES_CACHE_PREFIX) && key.slice(-10) < cutoffDate,
  );
  if (expired.length) await AsyncStorage.multiRemove(expired);
};

const fetchSunTimes = async (
  lat: number,
  lng: number,
  date: string,
  now: Date,
): Promise<SunTimes | null> => {
  const key = getCacheKey(lat, lng, date);
  try {
    const stored = await AsyncStorage.getItem(key);
    const cached = stored ? parseSunTimes(JSON.parse(stored)) : null;
    if (cached) return cached;
  } catch {
    // A damaged entry is replaced by the fresh response below.
  }

  const response = await fetch(getSunsetApiUrl(lat, lng, date));
  const data = await response.json();
  const times = data?.status === 'OK' ? parseSunTimes(data.results) : null;
  if (!times) return null;

  await AsyncStorage.setItem(
    key,
    JSON.stringify({
      sunrise: times.sunrise.toISOString(),
      sunset: times.sunset.toISOString(),
    } satisfies StoredSunTimes),
  ).catch(() => undefined);
  await pruneOldSunTimes(now).catch(() => undefined);
  return times;
};

/**
 * Returns sunrise and sunset for a place and local date, from the device cache
 * when possible. Resolves to null when the provider has no usable answer and
 * throws on network errors, so callers can keep their own fallback times.
 */
export const getSunTimes = (
  lat: number,
  lng: number,
  date: string,
  now = new Date(),
): Promise<SunTimes | null> => {
  const key = getCacheKey(lat, lng, date);
  const pending = pendingRequests.get(key);
  if (pending) return pending;

  const request = fetchSunTimes(lat, lng, date, now).finally(() => {
    pendingRequests.delete(key);
  });
  pendingRequests.set(key, request);
  return request;
};

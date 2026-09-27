import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSunTimes, toLocalIsoDate } from '@/services/SunTimesService';

const okResponse = (date: string) =>
  ({
    json: async () => ({
      status: 'OK',
      results: {
        sunrise: `${date}T10:52:01+00:00`,
        sunset: `${date}T22:37:37+00:00`,
      },
    }),
  }) as Response;

describe('sun times service', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('formats the local calendar date', () => {
    expect(toLocalIsoDate(new Date(2026, 9, 2, 23, 30))).toBe('2026-10-02');
  });

  it('fetches a date once, then answers from the device cache', async () => {
    const fetchMock = jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(okResponse('2026-10-02'));

    const first = await getSunTimes(40.7, -73.8, '2026-10-02', new Date(2026, 9, 1));
    const second = await getSunTimes(40.7, -73.8, '2026-10-02', new Date(2026, 9, 1));

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(first?.sunset.toISOString()).toBe('2026-10-02T22:37:37.000Z');
    expect(second?.sunrise.toISOString()).toBe('2026-10-02T10:52:01.000Z');
  });

  it('shares one request between simultaneous callers', async () => {
    const fetchMock = jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(okResponse('2026-10-03'));

    await Promise.all([
      getSunTimes(40.7, -73.8, '2026-10-03'),
      getSunTimes(40.7, -73.8, '2026-10-03'),
    ]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('does not cache an unusable response', async () => {
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({
      json: async () => ({ status: 'INVALID_REQUEST' }),
    } as Response);

    expect(await getSunTimes(40.7, -73.8, '2026-10-04')).toBeNull();
    expect(await getSunTimes(40.7, -73.8, '2026-10-04')).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('prunes dates older than two weeks', async () => {
    await AsyncStorage.setItem('sun-times-v1:40.7,-73.8:2026-09-01', '{}');
    jest.spyOn(global, 'fetch').mockResolvedValue(okResponse('2026-10-02'));

    await getSunTimes(40.7, -73.8, '2026-10-02', new Date(2026, 9, 1));

    expect(await AsyncStorage.getAllKeys()).toEqual([
      'sun-times-v1:40.7,-73.8:2026-10-02',
    ]);
  });
});

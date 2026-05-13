import { Alert, Linking } from 'react-native';

/**
 * Church Identity & Branding Constants
 * Hardcoding these directly satisfies Tenet 5 (Simplicity) by removing
 * dependency on .env for static branding information.
 */
export const CHURCH_NAME = 'New York Chinese SDA Church';
export const CHURCH_PHONE = '(718) 205-8618';
export const CHURCH_EMAIL = 'nycsdac@gmail.com';
export const CHURCH_BUILDING_IMAGE_URL =
  'https://lh3.googleusercontent.com/nK9F_oIMAeFUg3zR4Zp7Qp-r0ywqGwZ6RN5TtSh8otJbUBqoTqdMdCUzAULPqnPM1slZdSeOqaLNtvnz=w1626';

/**
 * Centralized hub for external destinations.
 * Consolidating these here satisfies Tenet 5 (Simplicity) by providing
 * a single source of truth for the app's external touchpoints.
 */

export const openURL = async (
  url: string,
  errorTitle = 'Error',
  errorMessage = 'Could not open the link.',
) => {
  try {
    await Linking.openURL(url);
  } catch (error) {
    Alert.alert(errorTitle, errorMessage);
    console.error('Linking error:', error);
  }
};

export const openOnlineGiving = async () => {
  return openURL(
    'https://adventistgiving.org/donate/AN48CO',
    'Error',
    'Could not open the online giving link.',
  );
};

export const openSpotifyPodcast = async () => {
  return openURL(
    'https://open.spotify.com/show/6Ig7RqU3A5vivl4x3FJFLV',
    'Error',
    'Could not open the Spotify podcast.',
  );
};

export const openSabbathStream = async () => {
  return openURL(
    'https://www.youtube.com/@newyorkchinesesdachurch1334/streams',
    'Error',
    'Could not open the YouTube livestream.',
  );
};

/**
 * Opens a given address in the Google Maps app or browser.
 * @param address The formatted address string to search for.
 */
export const openInMaps = async (address: string) => {
  if (!address) return;
  const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    address,
  )}`;
  return openURL(url, 'Error', 'Could not open Google Maps.');
};

export const openBeliefs = () =>
  openURL('https://adventist.org/beliefs#official-beliefs');
export const openGNYC = () => openURL('https://gnyc.org/');
export const openAtlanticUnion = () => openURL('https://atlantic-union.org/');
export const openHymnal = () => openURL('https://www.sdahymnal.org/');

export const openPhone = (phone: string) => {
  const cleanedPhone = phone.replace(/[^\d+]/g, '');
  return openURL(
    `tel:${cleanedPhone}`,
    'Error',
    'Phone calls are not supported on this device or emulator.',
  );
};

export const openEmail = (email: string) =>
  openURL(
    `mailto:${email}`,
    'Error',
    'Email is not configured on this device or emulator.',
  );

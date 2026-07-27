/**
 * The only storage keys eligible for the local-settings backup.
 *
 * Bible state, saved verses, content caches, and any future personal data must remain
 * outside this list unless a later schema and privacy review explicitly add them.
 */
export const LANGUAGE_STORAGE_KEY = 'user-language';
export const THEME_STORAGE_KEY = 'user-theme';
export const SETUP_STORAGE_KEY = 'has-completed-setup';
export const TEXT_SCALE_STORAGE_KEY = 'user-text-scale';

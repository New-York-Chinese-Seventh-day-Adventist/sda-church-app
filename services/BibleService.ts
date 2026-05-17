/**
 * Service for interacting with the Bible.helloao.org API.
 * Follows the design specs for multi-language, native-first rendering.
 *
 * Note: The `SupportedLanguage` type is imported from the global LanguageContext
 * to ensure consistency in language code mapping.
 *
 * Architectural Design: ../docs/feature_designs/bible_integration_design.md
 * API Reference: https://bible.helloao.org/docs/reference/
 */

export const API_BASE = 'https://bible.helloao.org/api';

import { SupportedLanguage } from '@/constants/LanguageContext';

export const SUPPORTED_TRANSLATIONS = [
  { id: 'BSB', name: 'BSB', lang: 'English' },
  { id: 'eng_kjv', name: 'KJV', lang: 'English' },
  { id: 'cmn_cuv', name: '和合本 (繁體)', lang: 'Chinese' },
  { id: 'cmn_cu1', name: '和合本 (简体)', lang: 'Chinese' },
  { id: 'spa_r09', name: 'RVR09', lang: 'Spanish' },
];

/**
 * Maps application language codes to their default Bible translation IDs.
 */
export const DEFAULT_TRANSLATION_MAP: Record<SupportedLanguage, string> = {
  en: 'BSB',
  zh: 'cmn_cuv',
  'zh-cn': 'cmn_cu1',
  es: 'spa_r09',
};

export interface Translation {
  id: string;
  name: string;
  englishName: string;
  language: string;
  languageName?: string;
  textDirection: 'ltr' | 'rtl';
  attribution?: string;
}

export interface TranslationBook {
  id: string;
  name: string;
  commonName: string;
  title: string | null;
  numberOfChapters: number;
  totalNumberOfVerses: number;
}

/**
 * Complex Chapter Content Types
 * These allow us to handle headings, footnotes, and poetry correctly in the UI.
 */
export type ChapterContent =
  | ChapterHeading
  | ChapterLineBreak
  | ChapterVerse
  | ChapterHebrewSubtitle;

export interface ChapterHeading {
  type: 'heading';
  content: string[];
}

export interface ChapterLineBreak {
  type: 'line_break';
}

export interface ChapterHebrewSubtitle {
  type: 'hebrew_subtitle';
  content: (string | FormattedText | VerseFootnoteReference)[];
}

export interface ChapterVerse {
  type: 'verse';
  number: number;
  content: (
    | string
    | FormattedText
    | InlineHeading
    | InlineLineBreak
    | VerseFootnoteReference
  )[];
}

export interface FormattedText {
  text: string;
  poem?: number;
  wordsOfJesus?: boolean;
}

export interface InlineHeading {
  heading: string;
}

export interface InlineLineBreak {
  lineBreak: true;
}

export interface VerseFootnoteReference {
  noteId: number;
}

export interface ChapterFootnote {
  noteId: number;
  text: string;
  caller: '+' | string | null;
  reference?: {
    chapter: number;
    verse: number;
  };
}

export interface ChapterData {
  number: number;
  content: ChapterContent[];
  footnotes: ChapterFootnote[];
}

/**
 * The audio links for a book chapter.
 * Maps reader names to their respective audio file URLs.
 */
export interface TranslationBookChapterAudioLinks {
  [reader: string]: string;
}

export interface TranslationBookChapter {
  translation: Translation;
  book: TranslationBook;
  thisChapterLink: string;
  thisChapterAudioLinks: TranslationBookChapterAudioLinks;
  nextChapterApiLink: string | null;
  nextChapterAudioLinks: TranslationBookChapterAudioLinks | null;
  previousChapterApiLink: string | null;
  previousChapterAudioLinks: TranslationBookChapterAudioLinks | null;
  numberOfVerses: number;
  chapter: ChapterData;
}

/**
 * Dataset (Cross-Reference) Types
 */
export interface DatasetReference {
  book: string;
  chapter: number;
  verse: number;
  endVerse?: number;
  score?: number;
}

export interface DatasetVerse {
  verse: number;
  references: DatasetReference[];
}

/**
 * Fetches all available translations.
 *
 * @returns {Promise<Translation[]>} A list of available Bible translations.
 */
export async function fetchAvailableTranslations() {
  try {
    const res = await fetch(`${API_BASE}/available_translations.json`);
    if (!res.ok) {
      throw new Error(`Failed to fetch translations: ${res.status}`);
    }
    const data = await res.json();
    return data.translations;
  } catch (e) {
    console.error('Failed to load available translations', e);
    throw e;
  }
}

/**
 * Fetches the list of books available for a specific translation.
 *
 * @param {string} translation - The ID of the translation. Standard: Uppercase ID.
 * @example fetchBooks('BSB')
 * @returns {Promise<TranslationBook[]>}
 */
export async function fetchBooks(translation: string) {
  try {
    const res = await fetch(`${API_BASE}/${translation}/books.json`);
    if (!res.ok) {
      throw new Error(`Failed to fetch books for ${translation}: ${res.status}`);
    }
    const data = await res.json();
    return data.books;
  } catch (e) {
    console.error(`Failed to load Bible books for ${translation}`, e);
    throw e;
  }
}

/**
 * Fetches the verses for a specific chapter in a specific translation and book.
 *
 * @param {string} translation - The ID of the translation. Standard: Uppercase ID.
 * @param {string} book - The ID of the book. Standard: USFM 3-letter ID (e.g., 'GEN').
 * @param {number} chapter - The numerical chapter. Standard: 1-based integer.
 * @example fetchChapter('BSB', 'GEN', 1)
 * @returns {Promise<TranslationBookChapter>}
 */
export async function fetchChapter(
  translation: string,
  book: string,
  chapter: number,
): Promise<TranslationBookChapter> {
  try {
    const res = await fetch(`${API_BASE}/${translation}/${book}/${chapter}.json`);
    if (!res.ok) {
      throw new Error(`Failed to fetch chapter: ${res.status}`);
    }
    return await res.json();
  } catch (e) {
    console.error(`Failed to load chapter ${book} ${chapter}`, e);
    throw e;
  }
}

/**
 * Fetches the entire translation (Large Payload).
 *
 * @param {string} translation - The ID of the translation. Standard: Uppercase ID.
 * @example fetchCompleteTranslation('BSB')
 * @returns {Promise<TranslationComplete>}
 */
export async function fetchCompleteTranslation(translation: string) {
  try {
    // TODO: Implement "Download Feature" logic.
    // 1. Fetch this large JSON.
    // 2. Normalize and split into individual chapters.
    // 3. Store in local storage for full offline availability.

    // TODO: Implement offline fallback logic.
    // 1. Check local storage (IndexedDB/LocalForage) for cached chapter data.
    // 2. If found, return cached data immediately to fulfill "Frictionless Access".

    // TODO: Implement fallback even in weak wifi situations where network is up but times out
    // This is notable for situations like underground subway or parking where TCP ACK is received
    // but data transfer is very slow. We can set a reasonable timeout (e.g., 5 seconds) and fallback
    // to cached data if the fetch doesn't complete in time.

    const res = await fetch(`${API_BASE}/${translation}/complete.json`);
    return await res.json();
  } catch (e) {
    console.error(`Failed to load complete translation for ${translation}`, e);
    throw e;
  }
}

/**
 * COMMENTARY APIS
 */

export async function fetchAvailableCommentaries() {
  try {
    const res = await fetch(`${API_BASE}/available_commentaries.json`);
    const data = await res.json();
    return data.commentaries;
  } catch (e) {
    console.error('Failed to load available commentaries', e);
    throw e;
  }
}

/**
 * Fetches the list of books available for a specific commentary.
 *
 * @param {string} commentary - The ID of the commentary. Standard: kebab-case.
 * @example fetchCommentaryBooks('adam-clarke')
 */
export async function fetchCommentaryBooks(commentary: string) {
  try {
    const res = await fetch(`${API_BASE}/c/${commentary}/books.json`);
    const data = await res.json();
    return data.books;
  } catch (e) {
    console.error(`Failed to load commentary books for ${commentary}`, e);
    throw e;
  }
}

/**
 * Fetches the content of a single chapter for a given book and commentary.
 *
 * @param {string} commentary - The ID of the commentary.
 * @param {string} book - The USFM book ID.
 * @param {number} chapter - The 1-based chapter number.
 * @example fetchCommentaryChapter('adam-clarke', 'GEN', 1)
 */
export async function fetchCommentaryChapter(
  commentary: string,
  book: string,
  chapter: number,
) {
  try {
    const res = await fetch(`${API_BASE}/c/${commentary}/${book}/${chapter}.json`);
    const data = await res.json();
    return data.chapter;
  } catch (e) {
    console.error(
      `Failed to load commentary chapter for ${commentary} ${book} ${chapter}`,
      e,
    );
    throw e;
  }
}

/**
 * Gets the list of profiles (overviews of people/groups) for a given commentary.
 *
 * @param {string} commentary - The ID of the commentary (e.g., 'tyndale').
 * @example fetchCommentaryProfiles('tyndale')
 */
export async function fetchCommentaryProfiles(commentary: string) {
  try {
    const res = await fetch(`${API_BASE}/c/${commentary}/profiles.json`);
    const data = await res.json();
    return data.profiles;
  } catch (e) {
    console.error(`Failed to load commentary profiles for ${commentary}`, e);
    throw e;
  }
}

/**
 * Gets a specific profile from a commentary.
 *
 * @param {string} commentary - The ID of the commentary.
 * @param {string} profile - The ID of the profile. Standard: lowercase name/id.
 * @example fetchCommentaryProfileContent('tyndale', 'aaron')
 */
export async function fetchCommentaryProfileContent(commentary: string, profile: string) {
  try {
    const res = await fetch(`${API_BASE}/c/${commentary}/profiles/${profile}.json`);
    return await res.json();
  } catch (e) {
    console.error(`Failed to load profile content for ${profile} in ${commentary}`, e);
    throw e;
  }
}

/**
 * DATASET APIS (e.g., Cross-References)
 */

/** Fetches all available Bible datasets. */
export async function fetchAvailableDatasets() {
  try {
    const res = await fetch(`${API_BASE}/available_datasets.json`);
    const data = await res.json();
    return data.datasets;
  } catch (e) {
    console.error('Failed to load available datasets', e);
    throw e;
  }
}

/**
 * Gets the list of books available for a given dataset.
 *
 * @param {string} dataset - The ID of the dataset (e.g., 'open-cross-ref').
 */
export async function fetchDatasetBooks(dataset: string) {
  try {
    const res = await fetch(`${API_BASE}/d/${dataset}/books.json`);
    const data = await res.json();
    return data.books;
  } catch (e) {
    console.error(`Failed to load dataset books for ${dataset}`, e);
    throw e;
  }
}

/**
 * Fetches a specific chapter from a dataset (e.g., open-cross-ref).
 *
 * @param {string} dataset - The ID of the dataset.
 * @param {string} book - The USFM book ID.
 * @param {number} chapter - The 1-based chapter number.
 * @example fetchDatasetChapter('open-cross-ref', 'GEN', 1)
 * @returns {Promise<DatasetChapterData>}
 */
export async function fetchDatasetChapter(
  dataset: string,
  book: string,
  chapter: number,
) {
  try {
    const res = await fetch(`${API_BASE}/d/${dataset}/${book}/${chapter}.json`);
    const data = await res.json();
    return data.chapter;
  } catch (e) {
    console.error(`Failed to load dataset chapter for ${dataset} ${book} ${chapter}`, e);
    throw e;
  }
}

/**
 * Service for interacting with the Bible.helloao.org API.
 * Follows the design specs for multi-language, native-first rendering.
 *
 * Documentation: docs/feature_designs/bible_integration_design.md
 * API Reference: https://bible.helloao.org/docs/reference/
 */

export const API_BASE = "https://bible.helloao.org/api";

export const TRANSLATIONS = [
  { id: "BSB", name: "Berean Standard Bible", lang: "English" },
  { id: "KJV", name: "King James Version", lang: "English" },
  { id: "CUV", name: "和合本 (繁體)", lang: "Chinese Traditional" },
  { id: "CUVS", name: "和合本 (简体)", lang: "Chinese Simplified" },
  { id: "RVR09", name: "Reina Valera 1909", lang: "Spanish" },
  { id: "SSE", name: "Spanish Modern (SSE)", lang: "Spanish" },
];

/**
 * Fetches the list of books available for a specific translation.
 */
export async function fetchBooks(translationId: string) {
  try {
    const res = await fetch(`${API_BASE}/${translationId}/books.json`);
    const data = await res.json();
    return data.books;
  } catch (e) {
    console.error(`Failed to load Bible books for ${translationId}`, e);
    throw e;
  }
}

/**
 * Fetches the verses for a specific chapter in a specific translation and book.
 */
export async function fetchChapter(
  translationId: string,
  bookId: string,
  chapter: number,
) {
  try {
    const res = await fetch(
      `${API_BASE}/${translationId}/${bookId}/${chapter}.json`,
    );
    const data = await res.json();
    return data.chapter.verses;
  } catch (e) {
    console.error(`Failed to load chapter content for ${bookId} ${chapter}`, e);
    throw e;
  }
}

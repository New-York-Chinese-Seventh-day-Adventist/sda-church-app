import { existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  getLibraryItemShelf,
  getLibraryItemsForLanguage,
  LIBRARY_CATALOG,
} from '@/features/library/LibraryCatalog';

describe('library catalog', () => {
  it('ties public-domain works to explicit Gutenberg or Internet Archive records', () => {
    expect(LIBRARY_CATALOG.publicDomainWorks.length).toBeGreaterThan(0);

    for (const work of LIBRARY_CATALOG.publicDomainWorks) {
      expect(work.rights).toBe('public-domain-us');
      expect(work.publicationYear).toBeLessThan(1928);
      if (work.sourceName === 'Internet Archive') {
        // A scan's own edition must be public domain, not just the original work.
        expect(work.editionYear).toBeLessThan(1928);
        expect(work.sourceUrl).toMatch(/^https:\/\/archive\.org\/details\/[A-Za-z0-9._-]+$/);
      } else {
        expect(work.sourceName).toBe('Project Gutenberg');
        expect(work.sourceUrl).toMatch(/^https:\/\/(www\.)?gutenberg\.org\/ebooks\/\d+$/);
      }
    }
  });

  it('uses EGW Writings reading links for books not on Project Gutenberg', () => {
    expect(
      LIBRARY_CATALOG.officialCollections.map(({ collection }) => collection).sort(),
    ).toEqual(['adventist-pioneers', 'children']);
    for (const work of LIBRARY_CATALOG.officialCollections) {
      expect(work.rights).toBe('official-external');
      expect(work.sourceName).toBe('EGW Writings');
      expect(work.sourceUrl).toMatch(/^https:\/\/text\.egwwritings\.org\/read\/\d+\.\d+$/);
    }
  });

  it('separates Adventist pioneers from broader Christian classics', () => {
    expect(
      LIBRARY_CATALOG.publicDomainWorks.filter(
        ({ collection }) => collection === 'adventist-pioneers',
      ),
    ).toHaveLength(3);
    expect(
      LIBRARY_CATALOG.publicDomainWorks.filter(
        ({ collection }) => collection === 'christian-classics',
      ),
    ).toHaveLength(4);
  });

  it('puts every book on a shelf the library screens can open', () => {
    const shelves = [
      ...LIBRARY_CATALOG.publicDomainWorks,
      ...LIBRARY_CATALOG.officialCollections,
      ...LIBRARY_CATALOG.churchDocuments,
    ].map((work) => [work.id, getLibraryItemShelf(work)]);

    for (const [, shelf] of shelves) {
      expect(['egw', 'bates', 'andrews', 'smith', 'classics', 'children']).toContain(shelf);
    }
    expect(Object.fromEntries(shelves)).toMatchObject({
      'bates-seventh-day-sabbath': 'bates',
      'andrews-history-sabbath': 'andrews',
      'smith-state-dead-destiny-wicked': 'smith',
      'smith-daniel-revelation': 'smith',
      'murray-humility': 'classics',
      'sibbes-bruised-reed': 'classics',
      'story-of-jesus': 'children',
      'sabbath-encouragement': 'egw',
    });
  });

  it('serves each church document from the web app and ships its file', () => {
    expect(LIBRARY_CATALOG.churchDocuments.length).toBeGreaterThan(0);
    for (const work of LIBRARY_CATALOG.churchDocuments) {
      const url = new URL(work.sourceUrl);
      expect(work.rights).toBe('church-hosted');
      expect(url.origin).toBe('https://app.nyccsda.org');
      // Files in public/ deploy at the web app's root.
      expect(existsSync(join(process.cwd(), 'public', url.pathname))).toBe(true);
    }
  });

  it('prioritizes Chinese sources for Chinese readers without hiding English works', () => {
    const catalog = getLibraryItemsForLanguage('zh');

    expect(catalog.officialCollections).toHaveLength(
      LIBRARY_CATALOG.officialCollections.length,
    );
    expect(catalog.publicDomainWorks).toHaveLength(
      LIBRARY_CATALOG.publicDomainWorks.length,
    );
  });
});

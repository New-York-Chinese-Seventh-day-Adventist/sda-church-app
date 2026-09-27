import type { SupportedLanguage } from '@/constants/LanguageContext';

export type LibraryRights = 'public-domain-us' | 'official-external' | 'church-hosted';
export type LibraryCollection =
  | 'adventist-pioneers'
  | 'christian-classics'
  | 'youth'
  | 'children';

export type LibraryItem = Readonly<{
  id: string;
  title: string;
  author: string;
  collection: LibraryCollection;
  description: string;
  language: 'en' | 'zh';
  rights: LibraryRights;
  sourceName: string;
  sourceUrl: string;
  publicationYear?: number;
  simplifiedChinese?: Readonly<{
    author: string;
    description: string;
    title: string;
  }>;
}>;

const publicDomainWorks: readonly LibraryItem[] = [
  {
    id: 'bates-seventh-day-sabbath',
    title: 'The Seventh Day Sabbath, a Perpetual Sign',
    author: 'Joseph Bates',
    collection: 'adventist-pioneers',
    description:
      'An 1847 Adventist pioneer work defending the continuing seventh-day Sabbath.',
    language: 'en',
    rights: 'public-domain-us',
    sourceName: 'Project Gutenberg',
    sourceUrl: 'https://www.gutenberg.org/ebooks/27266',
    publicationYear: 1847,
  },
  {
    id: 'andrews-history-sabbath',
    title: 'History of the Sabbath and First Day of the Week',
    author: 'J. N. Andrews',
    collection: 'adventist-pioneers',
    description:
      'The 1873 edition of an Adventist pioneer study of the Sabbath in Scripture and history.',
    language: 'en',
    rights: 'public-domain-us',
    sourceName: 'Project Gutenberg',
    sourceUrl: 'https://www.gutenberg.org/ebooks/68714',
    publicationYear: 1873,
  },
  {
    id: 'smith-state-dead-destiny-wicked',
    title: 'The State of the Dead and the Destiny of the Wicked',
    author: 'Uriah Smith',
    collection: 'adventist-pioneers',
    description:
      'An 1873 Adventist pioneer study of the Bible teaching on death and the final destiny of the wicked.',
    language: 'en',
    rights: 'public-domain-us',
    sourceName: 'Project Gutenberg',
    sourceUrl: 'https://www.gutenberg.org/ebooks/54373',
    publicationYear: 1873,
  },
  {
    id: 'bunyan-pilgrims-progress',
    title: "The Pilgrim's Progress",
    author: 'John Bunyan',
    collection: 'christian-classics',
    description:
      'A classic Protestant allegory about perseverance, faith, and the Christian journey.',
    language: 'en',
    rights: 'public-domain-us',
    sourceName: 'Project Gutenberg',
    sourceUrl: 'https://www.gutenberg.org/ebooks/131',
    publicationYear: 1678,
  },
  {
    id: 'murray-humility',
    title: 'Humility: The Beauty of Holiness',
    author: 'Andrew Murray',
    collection: 'christian-classics',
    description:
      'A classic devotional on humility as the root of holiness, drawn from the life and teaching of Jesus.',
    language: 'en',
    rights: 'public-domain-us',
    sourceName: 'Project Gutenberg',
    sourceUrl: 'https://www.gutenberg.org/ebooks/57121',
    publicationYear: 1895,
  },
  {
    // Gutenberg's only Foxe record is an abridged nineteenth-century American
    // edition, not Foxe's full text, so the description says so.
    id: 'foxe-book-of-martyrs',
    title: "Foxe's Book of Martyrs",
    author: 'John Foxe',
    collection: 'christian-classics',
    description:
      'An abridged nineteenth-century edition of the Protestant history of Christian martyrs, with added accounts of persecution up to 1830.',
    language: 'en',
    rights: 'public-domain-us',
    sourceName: 'Project Gutenberg',
    sourceUrl: 'https://www.gutenberg.org/ebooks/22400',
    publicationYear: 1563,
  },
  {
    id: 'chiniquy-fifty-years-church-rome',
    title: 'Fifty Years in the Church of Rome',
    author: 'Charles Chiniquy',
    collection: 'christian-classics',
    description:
      'The 1886 memoir of a former Roman Catholic priest in Quebec and Illinois, written as a Protestant critique of the Catholic Church.',
    language: 'en',
    rights: 'public-domain-us',
    sourceName: 'Project Gutenberg',
    sourceUrl: 'https://www.gutenberg.org/ebooks/51634',
    publicationYear: 1886,
  },
];

const officialCollections: readonly LibraryItem[] = [
  {
    id: 'story-of-jesus',
    title: 'The Story of Jesus',
    author: 'Ellen G. White',
    collection: 'children',
    description: 'A concise, child-friendly account of the life and ministry of Jesus.',
    language: 'en',
    rights: 'official-external',
    sourceName: 'EGW Writings',
    sourceUrl: 'https://text.egwwritings.org/read/144.1',
  },
  {
    // Not on Project Gutenberg. EGW Writings hosts the public-domain 1897
    // edition; later revisions such as the 1944 edition are still copyrighted.
    id: 'smith-daniel-revelation',
    title: 'Daniel and the Revelation',
    author: 'Uriah Smith',
    collection: 'adventist-pioneers',
    description:
      "The 1897 edition of Uriah Smith's verse-by-verse Adventist commentary on the prophecies of Daniel and Revelation.",
    language: 'en',
    rights: 'official-external',
    sourceName: 'EGW Writings',
    sourceUrl: 'https://text.egwwritings.org/read/12861.1',
    publicationYear: 1897,
  },
];

// Documents the church publishes itself, served with the web app from
// `public/library/`.
const churchDocuments: readonly LibraryItem[] = [
  {
    // Also the backup of the Drive file the Brooklyn bulletin reads its weekly
    // Sabbath Encouragement page from (SABBATH_ENCOURAGEMENT_SOURCE_FILE_ID in
    // google-apps-script/SabbathEncouragement.gs). Keep the Drive file name.
    id: 'sabbath-encouragement',
    title: 'Sabbath Encouragement (安息日勉言)',
    author: 'Bible and Ellen G. White quotations',
    collection: 'adventist-pioneers',
    description:
      'Fifty-two readings of Bible verses and Ellen G. White quotations on the Sabbath, compiled by churches in China. The Brooklyn bulletin prints one each week.',
    language: 'zh',
    rights: 'church-hosted',
    sourceName: 'New York Chinese SDA Church',
    sourceUrl: 'https://app.nyccsda.org/library/sabbath_encouragement.pdf',
    simplifiedChinese: {
      title: '安息日勉言',
      author: '圣经与怀爱伦著作摘录',
      description:
        '五十二篇关于安息日的圣经经文与怀爱伦著作摘录，由中国教会编辑。布鲁克林周报每周刊登一篇。',
    },
  },
];

// TODO: Add only verified, handpicked Chinese Adventist books and replace the
// generated English covers with verified official covers. Track both in:
// https://github.com/New-York-Chinese-Seventh-day-Adventist/sda-church-app/issues/176

export const LIBRARY_CATALOG = Object.freeze({
  publicDomainWorks,
  officialCollections,
  churchDocuments,
});

// Each Adventist pioneer has a shelf of their own in the library, and the
// Sabbath Encouragement quotations sit with Ellen G. White's books. Other works
// are shelved by collection.
const ITEM_SHELVES: Readonly<Record<string, string>> = {
  'bates-seventh-day-sabbath': 'bates',
  'andrews-history-sabbath': 'andrews',
  'smith-state-dead-destiny-wicked': 'smith',
  'smith-daniel-revelation': 'smith',
  'sabbath-encouragement': 'egw',
};

/** The library shelf (the `[collection]` route) that lists this work. */
export const getLibraryItemShelf = (item: LibraryItem) =>
  ITEM_SHELVES[item.id] ??
  (item.collection === 'christian-classics' ? 'classics' : item.collection);

export const getLibraryItemsForLanguage = (language: SupportedLanguage) => {
  const preferredLanguage = language === 'zh' || language === 'zh-cn' ? 'zh' : 'en';
  const rank = (item: LibraryItem) => (item.language === preferredLanguage ? 0 : 1);

  return {
    publicDomainWorks: [...publicDomainWorks].sort((a, b) => rank(a) - rank(b)),
    officialCollections: [...officialCollections].sort((a, b) => rank(a) - rank(b)),
    churchDocuments: [...churchDocuments].sort((a, b) => rank(a) - rank(b)),
  };
};

export const getLibraryItemDisplayText = (
  item: LibraryItem,
  language: SupportedLanguage,
) =>
  language === 'zh-cn' && item.simplifiedChinese
    ? item.simplifiedChinese
    : {
        author: item.author,
        description: item.description,
        title: item.title,
      };

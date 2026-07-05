import { BIBLE_TEXT_DATA, Verse, getChapterText as getCuvChapterText, searchVerses as searchCuvVerses, hasChapterData as hasCuvChapterData } from './bibleText';
import { RCUV_TEXT_DATA } from './bibleTextRCUV';

export type BibleVersion = 'cuv' | 'rcuv';

export const VERSION_LABELS: Record<BibleVersion, string> = {
  cuv: '和合本',
  rcuv: '和修版',
};

const DATA_MAP: Record<BibleVersion, Record<string, Record<number, Verse[]>>> = {
  cuv: BIBLE_TEXT_DATA,
  rcuv: RCUV_TEXT_DATA,
};

export function getChapterText(bookId: string, chapter: number, version: BibleVersion = 'cuv'): Verse[] | null {
  return DATA_MAP[version]?.[bookId]?.[chapter] ?? null;
}

export function hasChapterData(bookId: string, chapter: number, version: BibleVersion = 'cuv'): boolean {
  return !!(DATA_MAP[version]?.[bookId]?.[chapter]);
}

export function searchVerses(query: string, version: BibleVersion = 'cuv'): Array<{ bookId: string; chapter: number; verse: Verse }> {
  const results: Array<{ bookId: string; chapter: number; verse: Verse }> = [];
  const data = DATA_MAP[version];
  if (!data) return results;
  const q = query.toLowerCase();
  for (const bookId of Object.keys(data)) {
    const chapters = data[bookId];
    for (const chStr of Object.keys(chapters)) {
      const chapter = parseInt(chStr, 10);
      const verses = chapters[chapter];
      for (const verse of verses) {
        if (verse.text.toLowerCase().includes(q)) {
          results.push({ bookId, chapter, verse });
        }
        if (results.length >= 100) return results;
      }
    }
  }
  return results;
}

export type { Verse };

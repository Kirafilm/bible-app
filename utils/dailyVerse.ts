import { BIBLE_TEXT_DATA } from '../data/bibleText';
import { BIBLE_BOOKS } from '../data/bibleStructure';

export interface DailyVerse {
  text: string;
  ref: string;
}

interface VerseEntry {
  text: string;
  bookName: string;
  chapter: number;
  verse: number;
}

let _versePool: VerseEntry[] | null = null;

function buildVersePool(): VerseEntry[] {
  const pool: VerseEntry[] = [];
  for (const book of BIBLE_BOOKS) {
    const chapters = BIBLE_TEXT_DATA[book.id];
    if (!chapters) continue;
    for (let ch = 1; ch <= book.chapters; ch++) {
      const verses = chapters[ch];
      if (!verses) continue;
      for (const v of verses) {
        // 跳過太短的經節（通常不完整）
        if (v.text.length >= 10) {
          pool.push({
            text: v.text,
            bookName: book.name,
            chapter: ch,
            verse: v.number,
          });
        }
      }
    }
  }
  return pool;
}

function getPool(): VerseEntry[] {
  if (!_versePool) {
    _versePool = buildVersePool();
  }
  return _versePool;
}

/**
 * 簡單字串哈希（32-bit）
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

/**
 * 獲取今日經文
 * 根據當前日期（YYYY-MM-DD）哈希，每天固定輸出一節不重複（概率上）的經文。
 * 同一天內多次打開 App 顯示同一節。
 */
export function getDailyVerse(): DailyVerse {
  const today = new Date();
  const dateKey = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ].join('-');

  const pool = getPool();
  const index = hashString(dateKey) % pool.length;
  const chosen = pool[index];

  return {
    text: chosen.text,
    ref: `${chosen.bookName} ${chosen.chapter}:${chosen.verse}`,
  };
}

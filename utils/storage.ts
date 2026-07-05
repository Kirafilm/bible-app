import AsyncStorage from '@react-native-async-storage/async-storage';
import { BibleVersion } from '../data/bibleVersions';

const KEYS = {
  LAST_READ: 'last_read',
  BOOKMARKS: 'bookmarks',
  FONT_SIZE: 'font_size',
  BIBLE_VERSION: 'bible_version',
  READING_COUNTS: 'reading_counts',
};

export interface ReadingPosition {
  bookId: string;
  chapter: number;
  scrollOffset?: number;
}

export interface Bookmark {
  id: string;
  bookId: string;
  chapter: number;
  verse: number;
  note?: string;
  createdAt: number;
}

// 讀取進度
export async function getLastRead(): Promise<ReadingPosition | null> {
  try {
    const val = await AsyncStorage.getItem(KEYS.LAST_READ);
    return val ? JSON.parse(val) : null;
  } catch {
    return null;
  }
}

export async function saveLastRead(pos: ReadingPosition): Promise<void> {
  await AsyncStorage.setItem(KEYS.LAST_READ, JSON.stringify(pos));
}

// 書籤
export async function getBookmarks(): Promise<Bookmark[]> {
  try {
    const val = await AsyncStorage.getItem(KEYS.BOOKMARKS);
    return val ? JSON.parse(val) : [];
  } catch {
    return [];
  }
}

export async function addBookmark(bookmark: Bookmark): Promise<void> {
  const bookmarks = await getBookmarks();
  bookmarks.unshift(bookmark);
  await AsyncStorage.setItem(KEYS.BOOKMARKS, JSON.stringify(bookmarks));
}

export async function removeBookmark(id: string): Promise<void> {
  const bookmarks = await getBookmarks();
  const filtered = bookmarks.filter(b => b.id !== id);
  await AsyncStorage.setItem(KEYS.BOOKMARKS, JSON.stringify(filtered));
}

// 字體大小
export async function getFontSize(): Promise<number> {
  try {
    const val = await AsyncStorage.getItem(KEYS.FONT_SIZE);
    return val ? parseInt(val) : 18;
  } catch {
    return 18;
  }
}

export async function saveFontSize(size: number): Promise<void> {
  await AsyncStorage.setItem(KEYS.FONT_SIZE, size.toString());
}

// 聖經版本偏好
export async function getBibleVersion(): Promise<BibleVersion> {
  try {
    const val = await AsyncStorage.getItem(KEYS.BIBLE_VERSION);
    return val === 'cuv' ? 'cuv' : 'rcuv';
  } catch {
    return 'rcuv';
  }
}

export async function saveBibleVersion(version: BibleVersion): Promise<void> {
  await AsyncStorage.setItem(KEYS.BIBLE_VERSION, version);
}

// 閱讀次數統計（常用書卷排序依據）
export type ReadingCounts = Record<string, number>;

export async function getReadingCounts(): Promise<ReadingCounts> {
  try {
    const val = await AsyncStorage.getItem(KEYS.READING_COUNTS);
    return val ? JSON.parse(val) : {};
  } catch {
    return {};
  }
}

export async function incrementReadingCount(bookId: string): Promise<void> {
  const counts = await getReadingCounts();
  counts[bookId] = (counts[bookId] || 0) + 1;
  await AsyncStorage.setItem(KEYS.READING_COUNTS, JSON.stringify(counts));
}

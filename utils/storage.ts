import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  LAST_READ: 'last_read',
  BOOKMARKS: 'bookmarks',
  FONT_SIZE: 'font_size',
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

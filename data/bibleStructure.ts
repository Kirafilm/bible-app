// 聖經書卷結構 - 中文和合本
export type Testament = 'old' | 'new';

export interface BibleBook {
  id: string;
  name: string;
  shortName: string;
  testament: Testament;
  chapters: number;
}

export const BIBLE_BOOKS: BibleBook[] = [
  // 舊約
  { id: 'gen', name: '創世記', shortName: '創', testament: 'old', chapters: 50 },
  { id: 'exo', name: '出埃及記', shortName: '出', testament: 'old', chapters: 40 },
  { id: 'lev', name: '利未記', shortName: '利', testament: 'old', chapters: 27 },
  { id: 'num', name: '民數記', shortName: '民', testament: 'old', chapters: 36 },
  { id: 'deut', name: '申命記', shortName: '申', testament: 'old', chapters: 34 },
  { id: 'josh', name: '約書亞記', shortName: '書', testament: 'old', chapters: 24 },
  { id: 'judg', name: '士師記', shortName: '士', testament: 'old', chapters: 21 },
  { id: 'ruth', name: '路得記', shortName: '得', testament: 'old', chapters: 4 },
  { id: '1sam', name: '撒母耳記上', shortName: '撒上', testament: 'old', chapters: 31 },
  { id: '2sam', name: '撒母耳記下', shortName: '撒下', testament: 'old', chapters: 24 },
  { id: '1kgs', name: '列王紀上', shortName: '王上', testament: 'old', chapters: 22 },
  { id: '2kgs', name: '列王紀下', shortName: '王下', testament: 'old', chapters: 25 },
  { id: '1chr', name: '歷代志上', shortName: '代上', testament: 'old', chapters: 29 },
  { id: '2chr', name: '歷代志下', shortName: '代下', testament: 'old', chapters: 36 },
  { id: 'ezra', name: '以斯拉記', shortName: '拉', testament: 'old', chapters: 10 },
  { id: 'neh', name: '尼希米記', shortName: '尼', testament: 'old', chapters: 13 },
  { id: 'esth', name: '以斯帖記', shortName: '斯', testament: 'old', chapters: 10 },
  { id: 'job', name: '約伯記', shortName: '伯', testament: 'old', chapters: 42 },
  { id: 'psa', name: '詩篇', shortName: '詩', testament: 'old', chapters: 150 },
  { id: 'prov', name: '箴言', shortName: '箴', testament: 'old', chapters: 31 },
  { id: 'eccl', name: '傳道書', shortName: '傳', testament: 'old', chapters: 12 },
  { id: 'song', name: '雅歌', shortName: '歌', testament: 'old', chapters: 8 },
  { id: 'isa', name: '以賽亞書', shortName: '賽', testament: 'old', chapters: 66 },
  { id: 'jer', name: '耶利米書', shortName: '耶', testament: 'old', chapters: 52 },
  { id: 'lam', name: '耶利米哀歌', shortName: '哀', testament: 'old', chapters: 5 },
  { id: 'ezek', name: '以西結書', shortName: '結', testament: 'old', chapters: 48 },
  { id: 'dan', name: '但以理書', shortName: '但', testament: 'old', chapters: 12 },
  { id: 'hos', name: '何西阿書', shortName: '何', testament: 'old', chapters: 14 },
  { id: 'joel', name: '約珥書', shortName: '珥', testament: 'old', chapters: 3 },
  { id: 'amos', name: '阿摩司書', shortName: '摩', testament: 'old', chapters: 9 },
  { id: 'obad', name: '俄巴底亞書', shortName: '俄', testament: 'old', chapters: 1 },
  { id: 'jonah', name: '約拿書', shortName: '拿', testament: 'old', chapters: 4 },
  { id: 'mic', name: '彌迦書', shortName: '彌', testament: 'old', chapters: 7 },
  { id: 'nah', name: '那鴻書', shortName: '鴻', testament: 'old', chapters: 3 },
  { id: 'hab', name: '哈巴谷書', shortName: '哈', testament: 'old', chapters: 3 },
  { id: 'zeph', name: '西番雅書', shortName: '番', testament: 'old', chapters: 3 },
  { id: 'hag', name: '哈該書', shortName: '該', testament: 'old', chapters: 2 },
  { id: 'zech', name: '撒迦利亞書', shortName: '亞', testament: 'old', chapters: 14 },
  { id: 'mal', name: '瑪拉基書', shortName: '瑪', testament: 'old', chapters: 4 },

  // 新約
  { id: 'matt', name: '馬太福音', shortName: '太', testament: 'new', chapters: 28 },
  { id: 'mark', name: '馬可福音', shortName: '可', testament: 'new', chapters: 16 },
  { id: 'luke', name: '路加福音', shortName: '路', testament: 'new', chapters: 24 },
  { id: 'john', name: '約翰福音', shortName: '約', testament: 'new', chapters: 21 },
  { id: 'acts', name: '使徒行傳', shortName: '徒', testament: 'new', chapters: 28 },
  { id: 'rom', name: '羅馬書', shortName: '羅', testament: 'new', chapters: 16 },
  { id: '1cor', name: '哥林多前書', shortName: '林前', testament: 'new', chapters: 16 },
  { id: '2cor', name: '哥林多後書', shortName: '林後', testament: 'new', chapters: 13 },
  { id: 'gal', name: '加拉太書', shortName: '加', testament: 'new', chapters: 6 },
  { id: 'eph', name: '以弗所書', shortName: '弗', testament: 'new', chapters: 6 },
  { id: 'phil', name: '腓立比書', shortName: '腓', testament: 'new', chapters: 4 },
  { id: 'col', name: '歌羅西書', shortName: '西', testament: 'new', chapters: 4 },
  { id: '1thess', name: '帖撒羅尼迦前書', shortName: '帖前', testament: 'new', chapters: 5 },
  { id: '2thess', name: '帖撒羅尼迦後書', shortName: '帖後', testament: 'new', chapters: 3 },
  { id: '1tim', name: '提摩太前書', shortName: '提前', testament: 'new', chapters: 6 },
  { id: '2tim', name: '提摩太後書', shortName: '提後', testament: 'new', chapters: 4 },
  { id: 'titus', name: '提多書', shortName: '多', testament: 'new', chapters: 3 },
  { id: 'philem', name: '腓利門書', shortName: '門', testament: 'new', chapters: 1 },
  { id: 'heb', name: '希伯來書', shortName: '來', testament: 'new', chapters: 13 },
  { id: 'jas', name: '雅各書', shortName: '雅', testament: 'new', chapters: 5 },
  { id: '1pet', name: '彼得前書', shortName: '彼前', testament: 'new', chapters: 5 },
  { id: '2pet', name: '彼得後書', shortName: '彼後', testament: 'new', chapters: 3 },
  { id: '1john', name: '約翰一書', shortName: '約一', testament: 'new', chapters: 5 },
  { id: '2john', name: '約翰二書', shortName: '約二', testament: 'new', chapters: 1 },
  { id: '3john', name: '約翰三書', shortName: '約三', testament: 'new', chapters: 1 },
  { id: 'jude', name: '猶大書', shortName: '猶', testament: 'new', chapters: 1 },
  { id: 'rev', name: '啟示錄', shortName: '啟', testament: 'new', chapters: 22 },
];

export const OLD_TESTAMENT_BOOKS = BIBLE_BOOKS.filter(b => b.testament === 'old');
export const NEW_TESTAMENT_BOOKS = BIBLE_BOOKS.filter(b => b.testament === 'new');

export function getBookById(id: string): BibleBook | undefined {
  return BIBLE_BOOKS.find(b => b.id === id);
}

export function getBookByShortName(shortName: string): BibleBook | undefined {
  return BIBLE_BOOKS.find(b => b.shortName === shortName || b.name === shortName);
}

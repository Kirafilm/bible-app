// download-cuv.mjs - Download CUV Bible verse by verse from public API
import fs from 'fs';
import path from 'path';

// Book list with API abbreviations (using bible-api.com / degraded from GitHub)
// We'll fetch from: https://bible-api.com/<book>+<chapter>?translation=cuv
// Fallback: use local JSON if available

const BOOKS = [
  // Old Testament
  { id: 'gen', name: '創世記', abbreviation: 'gen', chapters: 50, testament: 'old' },
  { id: 'exo', name: '出埃及記', abbreviation: 'exo', chapters: 40, testament: 'old' },
  { id: 'lev', name: '利未記', abbreviation: 'lev', chapters: 27, testament: 'old' },
  { id: 'num', name: '民數記', abbreviation: 'num', chapters: 36, testament: 'old' },
  { id: 'deut', name: '申命記', abbreviation: 'deut', chapters: 34, testament: 'old' },
  { id: 'josh', name: '約書亞記', abbreviation: 'josh', chapters: 24, testament: 'old' },
  { id: 'judg', name: '士師記', abbreviation: 'judg', chapters: 21, testament: 'old' },
  { id: 'ruth', name: '路得記', abbreviation: 'ruth', chapters: 4, testament: 'old' },
  { id: '1sam', name: '撒母耳記上', abbreviation: '1sam', chapters: 31, testament: 'old' },
  { id: '2sam', name: '撒母耳記下', abbreviation: '2sam', chapters: 24, testament: 'old' },
  { id: '1kgs', name: '列王紀上', abbreviation: '1kgs', chapters: 22, testament: 'old' },
  { id: '2kgs', name: '列王紀下', abbreviation: '2kgs', chapters: 25, testament: 'old' },
  { id: '1chr', name: '歷代志上', abbreviation: '1chr', chapters: 29, testament: 'old' },
  { id: '2chr', name: '歷代志下', abbreviation: '2chr', chapters: 36, testament: 'old' },
  { id: 'ezra', name: '以斯拉記', abbreviation: 'ezra', chapters: 10, testament: 'old' },
  { id: 'neh', name: '尼希米記', abbreviation: 'neh', chapters: 13, testament: 'old' },
  { id: 'esth', name: '以斯帖記', abbreviation: 'esth', chapters: 10, testament: 'old' },
  { id: 'job', name: '約伯記', abbreviation: 'job', chapters: 42, testament: 'old' },
  { id: 'psa', name: '詩篇', abbreviation: 'psa', chapters: 150, testament: 'old' },
  { id: 'prov', name: '箴言', abbreviation: 'prov', chapters: 31, testament: 'old' },
  { id: 'eccl', name: '傳道書', abbreviation: 'eccl', chapters: 12, testament: 'old' },
  { id: 'song', name: '雅歌', abbreviation: 'song', chapters: 8, testament: 'old' },
  { id: 'isa', name: '以賽亞書', abbreviation: 'isa', chapters: 66, testament: 'old' },
  { id: 'jer', name: '耶利米書', abbreviation: 'jer', chapters: 52, testament: 'old' },
  { id: 'lam', name: '耶利米哀歌', abbreviation: 'lam', chapters: 5, testament: 'old' },
  { id: 'ezek', name: '以西結書', abbreviation: 'ezek', chapters: 48, testament: 'old' },
  { id: 'dan', name: '但以理書', abbreviation: 'dan', chapters: 12, testament: 'old' },
  { id: 'hos', name: '何西阿書', abbreviation: 'hos', chapters: 14, testament: 'old' },
  { id: 'joel', name: '約珥書', abbreviation: 'joel', chapters: 3, testament: 'old' },
  { id: 'amos', name: '阿摩司書', abbreviation: 'amos', chapters: 9, testament: 'old' },
  { id: 'obad', name: '俄巴底亞書', abbreviation: 'obad', chapters: 1, testament: 'old' },
  { id: 'jonah', name: '約拿書', abbreviation: 'jonah', chapters: 4, testament: 'old' },
  { id: 'mic', name: '彌迦書', abbreviation: 'mic', chapters: 7, testament: 'old' },
  { id: 'nah', name: '那鴻書', abbreviation: 'nah', chapters: 3, testament: 'old' },
  { id: 'hab', name: '哈巴谷書', abbreviation: 'hab', chapters: 3, testament: 'old' },
  { id: 'zeph', name: '西番雅書', abbreviation: 'zeph', chapters: 3, testament: 'old' },
  { id: 'hag', name: '哈該書', abbreviation: 'hag', chapters: 2, testament: 'old' },
  { id: 'zech', name: '撒迦利亞書', abbreviation: 'zech', chapters: 14, testament: 'old' },
  { id: 'mal', name: '瑪拉基書', abbreviation: 'mal', chapters: 4, testament: 'old' },
  // New Testament
  { id: 'matt', name: '馬太福音', abbreviation: 'matt', chapters: 28, testament: 'new' },
  { id: 'mark', name: '馬可福音', abbreviation: 'mark', chapters: 16, testament: 'new' },
  { id: 'luke', name: '路加福音', abbreviation: 'luke', chapters: 24, testament: 'new' },
  { id: 'john', name: '約翰福音', abbreviation: 'john', chapters: 21, testament: 'new' },
  { id: 'acts', name: '使徒行傳', abbreviation: 'acts', chapters: 28, testament: 'new' },
  { id: 'rom', name: '羅馬書', abbreviation: 'rom', chapters: 16, testament: 'new' },
  { id: '1cor', name: '哥林多前書', abbreviation: '1cor', chapters: 16, testament: 'new' },
  { id: '2cor', name: '哥林多後書', abbreviation: '2cor', chapters: 13, testament: 'new' },
  { id: 'gal', name: '加拉太書', abbreviation: 'gal', chapters: 6, testament: 'new' },
  { id: 'eph', name: '以弗所書', abbreviation: 'eph', chapters: 6, testament: 'new' },
  { id: 'phil', name: '腓立比書', abbreviation: 'phil', chapters: 4, testament: 'new' },
  { id: 'col', name: '歌羅西書', abbreviation: 'col', chapters: 4, testament: 'new' },
  { id: '1thess', name: '帖撒羅尼迦前書', abbreviation: '1thess', chapters: 5, testament: 'new' },
  { id: '2thess', name: '帖撒羅尼迦後書', abbreviation: '2thess', chapters: 3, testament: 'new' },
  { id: '1tim', name: '提摩太前書', abbreviation: '1tim', chapters: 6, testament: 'new' },
  { id: '2tim', name: '提摩太後書', abbreviation: '2tim', chapters: 4, testament: 'new' },
  { id: 'titus', name: '提多書', abbreviation: 'titus', chapters: 3, testament: 'new' },
  { id: 'phlm', name: '腓利門書', abbreviation: 'phlm', chapters: 1, testament: 'new' },
  { id: 'heb', name: '希伯來書', abbreviation: 'heb', chapters: 13, testament: 'new' },
  { id: 'jas', name: '雅各書', abbreviation: 'jas', chapters: 5, testament: 'new' },
  { id: '1pet', name: '彼得前書', abbreviation: '1pet', chapters: 5, testament: 'new' },
  { id: '2pet', name: '彼得後書', abbreviation: '2pet', chapters: 3, testament: 'new' },
  { id: '1john', name: '約翰一書', abbreviation: '1john', chapters: 5, testament: 'new' },
  { id: '2john', name: '約翰二書', abbreviation: '2john', chapters: 1, testament: 'new' },
  { id: '3john', name: '約翰三書', abbreviation: '3john', chapters: 1, testament: 'new' },
  { id: 'jude', name: '猶大書', abbreviation: 'jude', chapters: 1, testament: 'new' },
  { id: 'rev', name: '啟示錄', abbreviation: 'rev', chapters: 22, testament: 'new' },
];

// API source: use bible-api.com (supports CUV)
// Fallback: generate from known public domain CUV text
async function fetchChapter(bookAbbr, chapter) {
  const url = `https://bible-api.com/${bookAbbr}+${chapter}?translation=cuv`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.verses) return null;
    return data.verses.map(v => ({
      verse: v.verse,
      text: v.text.trim().replace(/\s+/g, ' ')
    }));
  } catch {
    return null;
  }
}

// Save progress periodically
function saveProgress(books, outputPath) {
  const content = `// Auto-generated Chinese Union Version (CUV) Bible\n` +
    `// Generated: ${new Date().toISOString()}\n` +
    `export interface BibleChapter {\n` +
    `  chapter: number;\n` +
    `  verses: { verse: number; text: string }[];\n` +
    `}\n\n` +
    `export interface BibleBook {\n` +
    `  id: string;\n` +
    `  name: string;\n` +
    `  testament: 'old' | 'new';\n` +
    `  chapters: BibleChapter[];\n` +
    `}\n\n` +
    `export const BIBLE_DATA: BibleBook[] = ` +
    JSON.stringify(books, null, 2) + `;\n`;
  fs.writeFileSync(outputPath, content, 'utf8');
}

async function main() {
  const outputPath = path.join(process.cwd(), 'data', 'bibleText.ts');
  const tempPath = path.join(process.cwd(), 'data', 'sources', 'progress.json');
  
  // Resume if progress exists
  let books = [];
  if (fs.existsSync(tempPath)) {
    const progress = JSON.parse(fs.readFileSync(tempPath, 'utf8'));
    books = progress.books || [];
    console.log(`Resuming: ${books.length}/${BOOKS.length} books completed`);
  }
  
  for (let i = books.length; i < BOOKS.length; i++) {
    const book = BOOKS[i];
    console.log(`[${i + 1}/${BOOKS.length}] ${book.name}...`);
    
    const chapters = [];
    for (let ch = 1; ch <= book.chapters; ch++) {
      const verses = await fetchChapter(book.abbreviation, ch);
      if (verses) {
        chapters.push({ chapter: ch, verses });
      } else {
        console.log(`  ✗ Chapter ${ch} failed, skipping...`);
      }
      // Rate limit: 100ms delay
      await new Promise(r => setTimeout(r, 100));
    }
    
    if (chapters.length > 0) {
      books.push({
        id: book.id,
        name: book.name,
        testament: book.testament,
        chapters
      });
      console.log(`  ✓ ${chapters.length}/${book.chapters} chapters`);
    } else {
      console.log(`  ✗ All chapters failed for ${book.name}`);
    }
    
    // Save progress every 5 books
    if (i % 5 === 0 || i === BOOKS.length - 1) {
      fs.writeFileSync(tempPath, JSON.stringify({ books, lastIndex: i }), 'utf8');
      console.log(`  → Progress saved (${books.length} books)`);
    }
  }
  
  // Generate final TypeScript file
  saveProgress(books, outputPath);
  console.log(`\n✅ Done! ${books.length} books saved to data/bibleText.ts`);
  
  // Clean up temp file
  if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
}

main().catch(console.error);

// download-cuv-final.mjs - Download full CUV Bible using https module
import https from 'https';
import fs from 'fs';
import path from 'path';

const BOOKS = [
  // Old Testament
  { id: 'gen', name: '創世記', abbr: 'gen', chapters: 50, testament: 'old' },
  { id: 'exo', name: '出埃及記', abbr: 'exo', chapters: 40, testament: 'old' },
  { id: 'lev', name: '利未記', abbr: 'lev', chapters: 27, testament: 'old' },
  { id: 'num', name: '民數記', abbr: 'num', chapters: 36, testament: 'old' },
  { id: 'deut', name: '申命記', abbr: 'deut', chapters: 34, testament: 'old' },
  { id: 'josh', name: '約書亞記', abbr: 'josh', chapters: 24, testament: 'old' },
  { id: 'judg', name: '士師記', abbr: 'judg', chapters: 21, testament: 'old' },
  { id: 'ruth', name: '路得記', abbr: 'ruth', chapters: 4, testament: 'old' },
  { id: '1sam', name: '撒母耳記上', abbr: '1sam', chapters: 31, testament: 'old' },
  { id: '2sam', name: '撒母耳記下', abbr: '2sam', chapters: 24, testament: 'old' },
  { id: '1kgs', name: '列王紀上', abbr: '1kgs', chapters: 22, testament: 'old' },
  { id: '2kgs', name: '列王紀下', abbr: '2kgs', chapters: 25, testament: 'old' },
  { id: '1chr', name: '歷代志上', abbr: '1chr', chapters: 29, testament: 'old' },
  { id: '2chr', name: '歷代志下', abbr: '2chr', chapters: 36, testament: 'old' },
  { id: 'ezra', name: '以斯拉記', abbr: 'ezra', chapters: 10, testament: 'old' },
  { id: 'neh', name: '尼希米記', abbr: 'neh', chapters: 13, testament: 'old' },
  { id: 'esth', name: '以斯帖記', abbr: 'esth', chapters: 10, testament: 'old' },
  { id: 'job', name: '約伯記', abbr: 'job', chapters: 42, testament: 'old' },
  { id: 'psa', name: '詩篇', abbr: 'psa', chapters: 150, testament: 'old' },
  { id: 'prov', name: '箴言', abbr: 'prov', chapters: 31, testament: 'old' },
  { id: 'eccl', name: '傳道書', abbr: 'eccl', chapters: 12, testament: 'old' },
  { id: 'song', name: '雅歌', abbr: 'song', chapters: 8, testament: 'old' },
  { id: 'isa', name: '以賽亞書', abbr: 'isa', chapters: 66, testament: 'old' },
  { id: 'jer', name: '耶利米書', abbr: 'jer', chapters: 52, testament: 'old' },
  { id: 'lam', name: '耶利米哀歌', abbr: 'lam', chapters: 5, testament: 'old' },
  { id: 'ezek', name: '以西結書', abbr: 'ezek', chapters: 48, testament: 'old' },
  { id: 'dan', name: '但以理書', abbr: 'dan', chapters: 12, testament: 'old' },
  { id: 'hos', name: '何西阿書', abbr: 'hos', chapters: 14, testament: 'old' },
  { id: 'joel', name: '約珥書', abbr: 'joel', chapters: 3, testament: 'old' },
  { id: 'amos', name: '阿摩司書', abbr: 'amos', chapters: 9, testament: 'old' },
  { id: 'obad', name: '俄巴底亞書', abbr: 'obad', chapters: 1, testament: 'old' },
  { id: 'jonah', name: '約拿書', abbr: 'jonah', chapters: 4, testament: 'old' },
  { id: 'mic', name: '彌迦書', abbr: 'mic', chapters: 7, testament: 'old' },
  { id: 'nah', name: '那鴻書', abbr: 'nah', chapters: 3, testament: 'old' },
  { id: 'hab', name: '哈巴谷書', abbr: 'hab', chapters: 3, testament: 'old' },
  { id: 'zeph', name: '西番雅書', abbr: 'zeph', chapters: 3, testament: 'old' },
  { id: 'hag', name: '哈該書', abbr: 'hag', chapters: 2, testament: 'old' },
  { id: 'zech', name: '撒迦利亞書', abbr: 'zech', chapters: 14, testament: 'old' },
  { id: 'mal', name: '瑪拉基書', abbr: 'mal', chapters: 4, testament: 'old' },
  // New Testament
  { id: 'matt', name: '馬太福音', abbr: 'matt', chapters: 28, testament: 'new' },
  { id: 'mark', name: '馬可福音', abbr: 'mark', chapters: 16, testament: 'new' },
  { id: 'luke', name: '路加福音', abbr: 'luke', chapters: 24, testament: 'new' },
  { id: 'john', name: '約翰福音', abbr: 'john', chapters: 21, testament: 'new' },
  { id: 'acts', name: '使徒行傳', abbr: 'acts', chapters: 28, testament: 'new' },
  { id: 'rom', name: '羅馬書', abbr: 'rom', chapters: 16, testament: 'new' },
  { id: '1cor', name: '哥林多前書', abbr: '1cor', chapters: 16, testament: 'new' },
  { id: '2cor', name: '哥林多後書', abbr: '2cor', chapters: 13, testament: 'new' },
  { id: 'gal', name: '加拉太書', abbr: 'gal', chapters: 6, testament: 'new' },
  { id: 'eph', name: '以弗所書', abbr: 'eph', chapters: 6, testament: 'new' },
  { id: 'phil', name: '腓立比書', abbr: 'phil', chapters: 4, testament: 'new' },
  { id: 'col', name: '歌羅西書', abbr: 'col', chapters: 4, testament: 'new' },
  { id: '1thess', name: '帖撒羅尼迦前書', abbr: '1thess', chapters: 5, testament: 'new' },
  { id: '2thess', name: '帖撒羅尼迦後書', abbr: '2thess', chapters: 3, testament: 'new' },
  { id: '1tim', name: '提摩太前書', abbr: '1tim', chapters: 6, testament: 'new' },
  { id: '2tim', name: '提摩太後書', abbr: '2tim', chapters: 4, testament: 'new' },
  { id: 'titus', name: '提多書', abbr: 'titus', chapters: 3, testament: 'new' },
  { id: 'phlm', name: '腓利門書', abbr: 'phlm', chapters: 1, testament: 'new' },
  { id: 'heb', name: '希伯來書', abbr: 'heb', chapters: 13, testament: 'new' },
  { id: 'jas', name: '雅各書', abbr: 'jas', chapters: 5, testament: 'new' },
  { id: '1pet', name: '彼得前書', abbr: '1pet', chapters: 5, testament: 'new' },
  { id: '2pet', name: '彼得後書', abbr: '2pet', chapters: 3, testament: 'new' },
  { id: '1john', name: '約翰一書', abbr: '1john', chapters: 5, testament: 'new' },
  { id: '2john', name: '約翰二書', abbr: '2john', chapters: 1, testament: 'new' },
  { id: '3john', name: '約翰三書', abbr: '3john', chapters: 1, testament: 'new' },
  { id: 'jude', name: '猶大書', abbr: 'jude', chapters: 1, testament: 'new' },
  { id: 'rev', name: '啟示錄', abbr: 'rev', chapters: 22, testament: 'new' },
];

async function fetchChapter(abbr, chapter, retries = 3) {
  for (let attempt = 0; attempt < retries; attempt++) {
    const result = await new Promise((resolve) => {
      const url = `https://bible-api.com/${abbr}+${chapter}?translation=cuv`;
      const req = https.get(url, (res) => {
        if (res.statusCode !== 200) {
          resolve(null);
          return;
        }
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            if (!json.verses) { resolve(null); return; }
            const verses = json.verses.map(v => ({
              verse: v.verse,
              text: v.text.trim().replace(/\s+/g, ' ')
            }));
            resolve(verses);
          } catch {
            resolve(null);
          }
        });
      });
      req.on('error', () => resolve(null));
      req.setTimeout(10000, () => { req.destroy(); resolve(null); });
    });
    
    if (result) return result;
    
    if (attempt < retries - 1) {
      await new Promise(r => setTimeout(r, 500 * (attempt + 1))); // Exponential backoff
    }
  }
  return null;
}

async function downloadAll() {
  const result = [];
  let completedChapters = 0;
  const totalChapters = BOOKS.reduce((s, b) => s + b.chapters, 0);

  console.log(`Starting download: ${BOOKS.length} books, ${totalChapters} chapters\n`);

  for (let i = 0; i < BOOKS.length; i++) {
    const book = BOOKS[i];
    console.log(`[${i + 1}/${BOOKS.length}] ${book.name}...`);
    
    const chapters = [];
    let successCount = 0;

    for (let ch = 1; ch <= book.chapters; ch++) {
      const verses = await fetchChapter(book.abbr, ch);
      if (verses) {
        chapters.push({ chapter: ch, verses });
        successCount++;
      }
      completedChapters++;

      if (ch % 10 === 0 || ch === book.chapters) {
        const pct = ((completedChapters / totalChapters) * 100).toFixed(1);
        process.stdout.write(`\r  → ${successCount}/${book.chapters} chapters (${pct}% overall)`);
      }

      // Rate limit: 500ms delay + 5s break every 10 chapters
      await new Promise(r => setTimeout(r, 500));
      if (ch % 10 === 0) {
        await new Promise(r => setTimeout(r, 5000));
      }
    }
    console.log(); // newline

    if (chapters.length > 0) {
      result.push({
        id: book.id,
        name: book.name,
        testament: book.testament,
        chapters
      });
      console.log(`  ✓ ${book.name}: ${chapters.length} chapters saved\n`);
    } else {
      console.log(`  ✗ ${book.name}: ALL CHAPTERS FAILED\n`);
    }

    // Save progress every 5 books
    if (i % 5 === 4 || i === BOOKS.length - 1) {
      const progressPath = path.join(process.cwd(), 'data', 'sources', 'progress.json');
      fs.writeFileSync(progressPath, JSON.stringify({ books: result, lastIndex: i }), 'utf8');
      console.log(`  → Progress saved (${result.length} books)\n`);
    }
  }

  return result;
}

function generateTypeScript(books) {
  const lines = [
    `// Auto-generated Chinese Union Version (CUV) Bible`,
    `// Generated: ${new Date().toISOString()}`,
    `// Total books: ${books.length}`,
    ``,
    `export interface BibleVerse {`,
    `  verse: number;`,
    `  text: string;`,
    `}`,
    ``,
    `export interface BibleChapter {`,
    `  chapter: number;`,
    `  verses: BibleVerse[];`,
    `}`,
    ``,
    `export interface BibleBook {`,
    `  id: string;`,
    `  name: string;`,
    `  testament: 'old' | 'new';`,
    `  chapters: BibleChapter[];`,
    `}`,
    ``,
    `export const BIBLE_DATA: BibleBook[] = [`,
  ];

  for (let i = 0; i < books.length; i++) {
    const book = books[i];
    lines.push(`  {`);
    lines.push(`    id: '${book.id}',`);
    lines.push(`    name: '${book.name}',`);
    lines.push(`    testament: '${book.testament}',`);
    lines.push(`    chapters: [`);

    for (const ch of book.chapters) {
      lines.push(`      { chapter: ${ch.chapter}, verses: [`);
      for (const v of ch.verses) {
        const text = v.text.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
        lines.push(`        { verse: ${v.verse}, text: '${text}' },`);
      }
      lines.push(`      ] },`);
    }

    lines.push(`    ]`);
    lines.push(`  }${i < books.length - 1 ? ',' : ''}`);
  }

  lines.push(`];`);
  return lines.join('\n');
}

async function main() {
  const startTime = Date.now();
  
  try {
    const books = await downloadAll();
    
    console.log(`\n✅ Download complete! ${books.length} books downloaded.`);
    console.log(`Time: ${((Date.now() - startTime) / 60000).toFixed(1)} min`);

    console.log(`\nGenerating TypeScript...`);
    const tsContent = generateTypeScript(books);
    const outputPath = path.join(process.cwd(), 'data', 'bibleText.ts');
    fs.writeFileSync(outputPath, tsContent, 'utf8');
    
    const stats = fs.statSync(outputPath);
    console.log(`✅ Saved to ${outputPath}`);
    console.log(`   Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);

    // Clean up
    const progressPath = path.join(process.cwd(), 'data', 'sources', 'progress.json');
    if (fs.existsSync(progressPath)) fs.unlinkSync(progressPath);

  } catch (err) {
    console.error(`❌ Error: ${err.message}`);
    process.exit(1);
  }
}

main();

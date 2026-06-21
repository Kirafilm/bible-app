// download-new-testament.mjs - Download New Testament only (faster)
import https from 'https';
import fs from 'fs';
import path from 'path';

const NEW_TESTAMENT = [
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
        if (res.statusCode !== 200) { resolve(null); return; }
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            if (!json.verses) { resolve(null); return; }
            resolve(json.verses.map(v => ({
              verse: v.verse,
              text: v.text.trim().replace(/\s+/g, ' ')
            })));
          } catch { resolve(null); }
        });
      });
      req.on('error', () => resolve(null));
      req.setTimeout(10000, () => { req.destroy(); resolve(null); });
    });
    
    if (result) return result;
    if (attempt < retries - 1) await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
  }
  return null;
}

async function main() {
  const result = [];
  const totalChapters = NEW_TESTAMENT.reduce((s, b) => s + b.chapters, 0);
  let completed = 0;

  console.log(`Starting New Testament download: ${NEW_TESTAMENT.length} books, ${totalChapters} chapters\n`);

  for (let i = 0; i < NEW_TESTAMENT.length; i++) {
    const book = NEW_TESTAMENT[i];
    console.log(`[${i + 1}/${NEW_TESTAMENT.length}] ${book.name}...`);
    
    const chapters = [];
    for (let ch = 1; ch <= book.chapters; ch++) {
      const verses = await fetchChapter(book.abbr, ch);
      if (verses) chapters.push({ chapter: ch, verses });
      completed++;
      
      if (ch % 5 === 0 || ch === book.chapters) {
        process.stdout.write(`\r  → ${chapters.length}/${book.chapters} chapters `);
      }
      
      await new Promise(r => setTimeout(r, 300));
    }
    console.log();

    if (chapters.length > 0) {
      result.push({ id: book.id, name: book.name, testament: book.testament, chapters });
      console.log(`  ✓ ${book.name}: ${chapters.length} chapters\n`);
    } else {
      console.log(`  ✗ ${book.name}: FAILED\n`);
    }
  }

  // Save as JSON first (more reliable than generating TypeScript)
  const jsonPath = path.join(process.cwd(), 'data', 'bibleData.json');
  fs.writeFileSync(jsonPath, JSON.stringify(result, null, 2), 'utf8');
  console.log(`\n✅ New Testament saved to data/bibleData.json`);
  console.log(`   Size: ${(fs.statSync(jsonPath).size / 1024 / 1024).toFixed(2)} MB`);
}

main().catch(console.error);

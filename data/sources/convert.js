// convert.js - Convert raw Chinese Bible data to app format
const fs = require('fs');

// Map Chinese abbreviations to book IDs
const abbrToId = {
  '創': 'gen', '出': 'exo', '利': 'lev', '民': 'num', '申': 'deut',
  '書': 'josh', '士': 'judg', '得': 'ruth',
  '撒上': '1sam', '撒下': '2sam',
  '王上': '1kgs', '王下': '2kgs',
  '代上': '1chr', '代下': '2chr',
  '拉': 'ezra', '尼': 'neh', '斯': 'esth',
  '伯': 'job', '詩': 'psa', '箴': 'prov', '傳': 'eccl', '歌': 'song',
  '賽': 'isa', '耶': 'jer', '哀': 'lam', '結': 'ezek', '但': 'dan',
  '何': 'hos', '珥': 'joel', '摩': 'amos', '俄': 'obad', '拿': 'jonah',
  '彌': 'mic', '鴻': 'nah', '哈': 'hab', '番': 'zeph', '該': 'hag', '亞': 'zech', '瑪': 'mal',
  '太': 'matt', '可': 'mark', '路': 'luke', '約': 'john', '徒': 'acts',
  '羅': 'rom', '林前': '1cor', '林後': '2cor', '加': 'gal', '弗': 'eph',
  '腓': 'phil', '西': 'col', '帖前': '1thess', '帖後': '2thess',
  '提前': '1tim', '提後': '2tim', '多': 'titus', '門': 'philem',
  '來': 'heb', '雅': 'jas', '彼前': '1pet', '彼後': '2pet',
  '約一': '1john', '約二': '2john', '約三': '3john', '猶': 'jude', '啟': 'rev',
};

console.log('Reading raw data...');
const raw = fs.readFileSync('data/sources/bibleText-raw.js', 'utf8');

// Extract all verse strings
const versePattern = /'([^']+)'/g;
const verses = [];
let match;
while ((match = versePattern.exec(raw)) !== null) {
  verses.push(match[1]);
}

console.log(`Found ${verses.length} verse entries`);

// Parse each verse: format is "書卷縮寫 章:節 經文"
// Example: "創1:1 起初，神創造天地。"
const data = {}; // { bookId: { chapterNum: [{number, text}] } }

for (const verse of verses) {
  // Skip non-verse entries
  if (!/^[\u4e00-\u9fff]+\d+:\d+ /.test(verse)) continue;

  const parsed = verse.match(/^([^\d]+)(\d+):(\d+) (.+)$/);
  if (!parsed) continue;

  const [, abbr, chap, vnum, text] = parsed;
  const bookId = abbrToId[abbr];
  if (!bookId) {
    if (abbr !== 'function' && abbr !== 'object') {
      console.log('Unknown abbreviation:', abbr);
    }
    continue;
  }

  const chapter = parseInt(chap, 10);
  const number = parseInt(vnum, 10);

  if (!data[bookId]) data[bookId] = {};
  if (!data[bookId][chapter]) data[bookId][chapter] = [];
  data[bookId][chapter].push({ number, text });
}

// Count stats
let totalBooks = 0, totalChapters = 0, totalVerses = 0;
for (const bookId of Object.keys(data)) {
  totalBooks++;
  for (const ch of Object.keys(data[bookId])) {
    totalChapters++;
    totalVerses += data[bookId][ch].length;
  }
}
console.log(`Parsed: ${totalBooks} books, ${totalChapters} chapters, ${totalVerses} verses`);

// Sort book order to match bibleStructure
const bookOrder = [
  'gen','exo','lev','num','deut','josh','judg','ruth',
  '1sam','2sam','1kgs','2kgs','1chr','2chr','ezra','neh','esth',
  'job','psa','prov','eccl','song','isa','jer','lam','ezek','dan',
  'hos','joel','amos','obad','jonah','mic','nah','hab','zeph','hag','zech','mal',
  'matt','mark','luke','john','acts','rom',
  '1cor','2cor','gal','eph','phil','col','1thess','2thess',
  '1tim','2tim','titus','philem','heb','jas','1pet','2pet',
  '1john','2john','3john','jude','rev',
];

// Generate TypeScript
console.log('Generating TypeScript...');
const lines = [];

lines.push('// Auto-generated full Chinese Union Version (CUV) Bible text');
lines.push('// Source: xuan9/ChineseBibleSearchJS on GitHub');
lines.push('// Generated: ' + new Date().toISOString());
lines.push('');
lines.push('export interface Verse {');
lines.push('  number: number;');
lines.push('  text: string;');
lines.push('}');
lines.push('');
lines.push('function v(n: number, t: string): Verse {');
lines.push('  return { number: n, text: t };');
lines.push('}');
lines.push('');
lines.push('export const BIBLE_TEXT_DATA: Record<string, Record<number, Verse[]>> = {');

function q(k) { return /^\d/.test(k) ? `'${k}'` : k; }

for (let i = 0; i < bookOrder.length; i++) {
  const bookId = bookOrder[i];
  const chapters = data[bookId];
  if (!chapters) continue;

  const isLast = i === bookOrder.length - 1;
  lines.push(`  ${q(bookId)}: {`);

  const chapterNums = Object.keys(chapters).map(Number).sort((a, b) => a - b);
  for (let j = 0; j < chapterNums.length; j++) {
    const ch = chapterNums[j];
    const vs = chapters[ch];
    const isLastCh = j === chapterNums.length - 1;

    // Generate verse array compactly
    const verseParts = vs.map(v => `v(${v.number},${JSON.stringify(v.text)})`).join(',');
    const comma = isLastCh ? '' : ',';
    lines.push(`    ${ch}: [${verseParts}]${comma}`);
  }

  lines.push(`  }${isLast ? '' : ','}`);
}

lines.push('};');
lines.push('');

// Helper functions
lines.push('/**');
lines.push(' * 获取指定书卷章节的经文');
lines.push(' */');
lines.push('export function getChapterText(bookId: string, chapter: number): Verse[] | null {');
lines.push('  return BIBLE_TEXT_DATA[bookId]?.[chapter] ?? null;');
lines.push('}');
lines.push('');
lines.push('/**');
lines.push(' * 判断某书卷章节是否有数据');
lines.push(' */');
lines.push('export function hasChapterData(bookId: string, chapter: number): boolean {');
lines.push('  return !!(BIBLE_TEXT_DATA[bookId]?.[chapter]);');
lines.push('}');
lines.push('');
lines.push('/**');
lines.push(' * 搜索经文（按关键词匹配，最多返回100条）');
lines.push(' */');
lines.push('export function searchVerses(query: string): Array<{ bookId: string; chapter: number; verse: Verse }> {');
lines.push('  const results: Array<{ bookId: string; chapter: number; verse: Verse }> = [];');
lines.push('  const q = query.toLowerCase();');
lines.push('  for (const bookId of Object.keys(BIBLE_TEXT_DATA)) {');
lines.push('    const chapters = BIBLE_TEXT_DATA[bookId];');
lines.push('    for (const chStr of Object.keys(chapters)) {');
lines.push('      const chapter = parseInt(chStr, 10);');
lines.push('      const verses = chapters[chapter];');
lines.push('      for (const verse of verses) {');
lines.push('        if (verse.text.toLowerCase().includes(q)) {');
lines.push('          results.push({ bookId, chapter, verse });');
lines.push('        }');
lines.push('        if (results.length >= 100) return results;');
lines.push('      }');
lines.push('    }');
lines.push('  }');
lines.push('  return results;');
lines.push('}');
lines.push('');

const output = lines.join('\n');

// Write output
const outputPath = 'data/bibleText.ts';
fs.writeFileSync(outputPath, output, 'utf8');

const stats = fs.statSync(outputPath);
console.log(`✅ Written to ${outputPath}`);
console.log(`   File size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);

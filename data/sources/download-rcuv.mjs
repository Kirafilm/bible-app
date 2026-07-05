// download-rcuv.mjs - Download and parse RCUV (和合本修订版) Bible text
// Source: resurgo-cn/bible-mp3-cn on GitHub (GBK encoded, simplified Chinese, 上帝版)
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Book ID mapping: order matches the files in old/new testament directories
const BOOKS = {
  old: [
    { id: 'gen',  file: '01%20%E5%88%9B%E4%B8%96%E8%AE%B0.txt' },
    { id: 'exo',  file: '02%20%E5%87%BA%E5%9F%83%E5%8F%8A%E8%AE%B0.txt' },
    { id: 'lev',  file: '03%20%E5%88%A9%E6%9C%AA%E8%AE%B0.txt' },
    { id: 'num',  file: '04%20%E6%B0%91%E6%95%B0%E8%AE%B0.txt' },
    { id: 'deut', file: '05%20%E7%94%B3%E5%91%BD%E8%AE%B0.txt' },
    { id: 'josh', file: '06%20%E7%BA%A6%E4%B9%A6%E4%BA%9A%E8%AE%B0.txt' },
    { id: 'judg', file: '07%20%E5%A3%AB%E5%B8%88%E8%AE%B0.txt' },
    { id: 'ruth', file: '08%20%E8%B7%AF%E5%BE%97%E8%AE%B0.txt' },
    { id: '1sam', file: '09%20%E6%92%92%E6%AF%8D%E8%80%B3%E8%AE%B0%E4%B8%8A.txt' },
    { id: '2sam', file: '10%20%E6%92%92%E6%AF%8D%E8%80%B3%E8%AE%B0%E4%B8%8B.txt' },
    { id: '1kgs', file: '11%20%E5%88%97%E7%8E%8B%E7%BA%AA%E4%B8%8A.txt' },
    { id: '2kgs', file: '12%20%E5%88%97%E7%8E%8B%E7%BA%AA%E4%B8%8B.txt' },
    { id: '1chr', file: '13%20%E5%8E%86%E4%BB%A3%E5%BF%97%E4%B8%8A.txt' },
    { id: '2chr', file: '14%20%E5%8E%86%E4%BB%A3%E5%BF%97%E4%B8%8B.txt' },
    { id: 'ezra', file: '15%20%E4%BB%A5%E6%96%AF%E6%8B%89%E8%AE%B0.txt' },
    { id: 'neh',  file: '16%20%E5%B0%BC%E5%B8%8C%E7%B1%B3%E8%AE%B0.txt' },
    { id: 'esth', file: '17%20%E4%BB%A5%E6%96%AF%E5%B8%96%E8%AE%B0.txt' },
    { id: 'job',  file: '18%20%E7%BA%A6%E4%BC%AF%E8%AE%B0.txt' },
    { id: 'psa',  file: '19%20%E8%AF%97%E7%AF%87.txt' },
    { id: 'prov', file: '20%20%E7%AE%B4%E8%A8%80.txt' },
    { id: 'eccl', file: '21%20%E4%BC%A0%E9%81%93%E4%B9%A6.txt' },
    { id: 'song', file: '22%20%E9%9B%85%E6%AD%8C.txt' },
    { id: 'isa',  file: '23%20%E4%BB%A5%E8%B5%9B%E4%BA%9A%E4%B9%A6.txt' },
    { id: 'jer',  file: '24%20%E8%80%B6%E5%88%A9%E7%B1%B3%E4%B9%A6.txt' },
    { id: 'lam',  file: '25%20%E8%80%B6%E5%88%A9%E7%B1%B3%E5%93%80%E6%AD%8C.txt' },
    { id: 'ezek', file: '26%20%E4%BB%A5%E8%A5%BF%E7%BB%93%E4%B9%A6.txt' },
    { id: 'dan',  file: '27%20%E4%BD%86%E4%BB%A5%E7%90%86%E4%B9%A6.txt' },
    { id: 'hos',  file: '28%20%E4%BD%95%E8%A5%BF%E9%98%BF%E4%B9%A6.txt' },
    { id: 'joel', file: '29%20%E7%BA%A6%E7%8F%88%E4%B9%A6.txt' },
    { id: 'amos', file: '30%20%E9%98%BF%E6%91%A9%E5%8F%B8%E4%B9%A6.txt' },
    { id: 'obad', file: '31%20%E4%BF%84%E5%B7%B4%E5%BA%95%E4%BA%9A%E4%B9%A6.txt' },
    { id: 'jonah',file: '32%20%E7%BA%A6%E6%8B%BF%E4%B9%A6.txt' },
    { id: 'mic',  file: '33%20%E5%BC%A5%E8%BF%A6%E4%B9%A6.txt' },
    { id: 'nah',  file: '34%20%E9%82%A3%E9%B8%BF%E4%B9%A6.txt' },
    { id: 'hab',  file: '35%20%E5%93%88%E5%B7%B4%E8%B0%B7%E4%B9%A6.txt' },
    { id: 'zeph', file: '36%20%E8%A5%BF%E7%95%AA%E9%9B%85%E4%B9%A6.txt' },
    { id: 'hag',  file: '37%20%E5%93%88%E8%AF%A5%E4%B9%A6.txt' },
    { id: 'zech', file: '38%20%E6%92%92%E8%BF%A6%E5%88%A9%E4%BA%9A%E4%B9%A6.txt' },
    { id: 'mal',  file: '39%20%E7%8E%9B%E6%8B%89%E5%9F%BA%E4%B9%A6.txt' },
  ],
  new: [
    { id: 'matt', file: '01%20%E9%A9%AC%E5%A4%AA%E7%A6%8F%E9%9F%B3.txt' },
    { id: 'mark', file: '02%20%E9%A9%AC%E5%8F%AF%E7%A6%8F%E9%9F%B3.txt' },
    { id: 'luke', file: '03%20%E8%B7%AF%E5%8A%A0%E7%A6%8F%E9%9F%B3.txt' },
    { id: 'john', file: '04%20%E7%BA%A6%E7%BF%B0%E7%A6%8F%E9%9F%B3.txt' },
    { id: 'acts', file: '05%20%E4%BD%BF%E5%BE%92%E8%A1%8C%E4%BC%A0.txt' },
    { id: 'rom',  file: '06%20%E7%BD%97%E9%A9%AC%E4%B9%A6.txt' },
    { id: '1cor', file: '07%20%E5%93%A5%E6%9E%97%E5%A4%9A%E5%89%8D%E4%B9%A6.txt' },
    { id: '2cor', file: '08%20%E5%93%A5%E6%9E%97%E5%A4%9A%E5%90%8E%E4%B9%A6.txt' },
    { id: 'gal',  file: '09%20%E5%8A%A0%E6%8B%89%E5%A4%AA%E4%B9%A6.txt' },
    { id: 'eph',  file: '10%20%E4%BB%A5%E5%BC%97%E6%89%80%E4%B9%A6.txt' },
    { id: 'phil', file: '11%20%E8%85%93%E7%AB%8B%E6%AF%94%E4%B9%A6.txt' },
    { id: 'col',  file: '12%20%E6%AD%8C%E7%BD%97%E8%A5%BF%E4%B9%A6.txt' },
    { id: '1thess',file:'13%20%E5%B8%96%E6%92%92%E7%BD%97%E5%B0%BC%E8%BF%A6%E5%89%8D%E4%B9%A6.txt' },
    { id: '2thess',file:'14%20%E5%B8%96%E6%92%92%E7%BD%97%E5%B0%BC%E8%BF%A6%E5%90%8E%E4%B9%A6.txt' },
    { id: '1tim', file: '15%20%E6%8F%90%E6%91%A9%E5%A4%AA%E5%89%8D%E4%B9%A6.txt' },
    { id: '2tim', file: '16%20%E6%8F%90%E6%91%A9%E5%A4%AA%E5%90%8E%E4%B9%A6.txt' },
    { id: 'titus',file: '17%20%E6%8F%90%E5%A4%9A%E4%B9%A6.txt' },
    { id: 'philem',file:'18%20%E8%85%93%E5%88%A9%E9%97%A8%E4%B9%A6.txt' },
    { id: 'heb',  file: '19%20%E5%B8%8C%E4%BC%AF%E6%9D%A5%E4%B9%A6.txt' },
    { id: 'jas',  file: '20%20%E9%9B%85%E5%90%84%E4%B9%A6.txt' },
    { id: '1pet', file: '21%20%E5%BD%BC%E5%BE%97%E5%89%8D%E4%B9%A6.txt' },
    { id: '2pet', file: '22%20%E5%BD%BC%E5%BE%97%E5%90%8E%E4%B9%A6.txt' },
    { id: '1john',file: '23%20%E7%BA%A6%E7%BF%B0%E4%B8%80%E4%B9%A6.txt' },
    { id: '2john',file: '24%20%E7%BA%A6%E7%BF%B0%E4%BA%8C%E4%B9%A6.txt' },
    { id: '3john',file: '25%20%E7%BA%A6%E7%BF%B0%E4%B8%89%E4%B9%A6.txt' },
    { id: 'jude', file: '26%20%E7%8A%B9%E5%A4%A7%E4%B9%A6.txt' },
    { id: 'rev',  file: '27%20%E5%90%AF%E7%A4%BA%E5%BD%95.txt' },
  ]
};

const BASE_URL = 'https://raw.githubusercontent.com/resurgo-cn/bible-mp3-cn/master/%E5%92%8C%E5%90%88%E6%9C%AC%E4%BF%AE%E8%AE%A2%E7%89%88-txt';
const OT_URL = `${BASE_URL}/%E6%97%A7%E7%BA%A6`;
const NT_URL = `${BASE_URL}/%E6%96%B0%E7%BA%A6`;

async function downloadFile(url) {
  return new Promise((resolve) => {
    const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        https.get(res.headers.location, (r2) => {
          const chunks = [];
          r2.on('data', c => chunks.push(c));
          r2.on('end', () => resolve(Buffer.concat(chunks)));
        }).on('error', () => resolve(null));
        return;
      }
      if (res.statusCode !== 200) { resolve(null); return; }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    });
    req.on('error', () => resolve(null));
    req.setTimeout(30000, () => { req.destroy(); resolve(null); });
  });
}

function cleanFootnotes(text) {
  let t = text;
  // Remove ' t ' patterns
  t = t.replace(/\s+t\s+/g, ' ');
  // Remove 't' between CJK char and punctuation/end/space
  t = t.replace(/(?<=[\u4e00-\u9fff])t(?=\s|$|[\u3000-\u303f\uff00-\uffef\。\,\;\:\?\!\…\—\-"\'\）\]\》\」\』])/g, '');
  // Remove leading 't ' on lines
  t = t.replace(/^t\s+/gm, '');
  // Remove trailing ' t' on lines
  t = t.replace(/\s+t$/gm, '');
  return t;
}

function parseVerses(chapterText) {
  const cleaned = cleanFootnotes(chapterText).trim();
  if (!cleaned) return [];

  const nonWord = '[^\\d\\w\\u4e00-\\u9fff\\u3400-\\u4dbf\\uf900-\\ufaff]';
  const regex = new RegExp(`(?<=^|${nonWord})\\s*(\\d{1,3})\\s`, 'gm');
  
  const allMatches = [];
  let m;
  while ((m = regex.exec(cleaned)) !== null) {
    const vn = parseInt(m[1]);
    if (vn >= 1 && vn <= 200) {
      allMatches.push({
        number: vn,
        matchIndex: m.index,
        textStart: m.index + m[0].length,
      });
    }
  }

  // Longest sequential chain from verse 1
  const sequential = [];
  for (const m of allMatches) {
    if (sequential.length === 0) {
      if (m.number === 1) sequential.push(m);
    } else if (m.number === sequential[sequential.length - 1].number + 1) {
      sequential.push(m);
    }
  }

  if (sequential.length === 0) return [];

  const verses = [];
  for (let i = 0; i < sequential.length; i++) {
    const startPos = sequential[i].textStart;
    const endPos = i + 1 < sequential.length 
      ? sequential[i + 1].matchIndex 
      : cleaned.length;
    
    let verseText = cleaned.substring(startPos, endPos).trim();
    verseText = verseText.replace(/\s{2,}/g, ' ').trim();
    
    if (verseText) {
      verses.push({ number: sequential[i].number, text: verseText });
    }
  }
  
  return verses;
}

function parseBookContent(text) {
  const lines = text.split(/\r?\n/);
  const result = {};
  let currentChapter = null;
  let chapterText = '';

  for (const line of lines) {
    // Chapter header: "书卷名 数字" (e.g., "创世记 1")
    const cm = line.trim().match(/^[\u4e00-\u9fff]+ (\d+)$/);
    if (cm) {
      if (currentChapter !== null && chapterText.trim()) {
        const verses = parseVerses(chapterText.trim());
        if (verses.length > 0) result[currentChapter] = verses;
      }
      currentChapter = parseInt(cm[1], 10);
      chapterText = '';
      continue;
    }
    if (currentChapter !== null) {
      chapterText += (chapterText ? ' ' : '') + line.trim();
    }
  }

  // Last chapter
  if (currentChapter !== null && chapterText.trim()) {
    const verses = parseVerses(chapterText.trim());
    if (verses.length > 0) result[currentChapter] = verses;
  }

  return result;
}

function generateTypeScript(data) {
  const lines = [
    '// Auto-generated Revised Chinese Union Version (RCUV) Bible text',
    '// 和合本修订版 (上帝版, 简体)',
    '// Source: resurgo-cn/bible-mp3-cn on GitHub',
    `// Generated: ${new Date().toISOString()}`,
    '',
    'export interface Verse {',
    '  number: number;',
    '  text: string;',
    '}',
    '',
    'function v(n: number, t: string): Verse {',
    '  return { number: n, text: t };',
    '}',
    '',
    'export const RCUV_TEXT_DATA: Record<string, Record<number, Verse[]>> = {',
  ];

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

  function q(k) { return /^\d/.test(k) ? `'${k}'` : k; }

  for (let i = 0; i < bookOrder.length; i++) {
    const bookId = bookOrder[i];
    const chapters = data[bookId];
    if (!chapters) {
      console.log(`  ⚠ Missing: ${bookId}`);
      continue;
    }

    const isLast = i === bookOrder.length - 1;
    lines.push(`  ${q(bookId)}: {`);

    const chapterNums = Object.keys(chapters).map(Number).sort((a, b) => a - b);
    for (let j = 0; j < chapterNums.length; j++) {
      const ch = chapterNums[j];
      const vs = chapters[ch];
      const isLastCh = j === chapterNums.length - 1;

      const verseParts = vs.map(v => `v(${v.number},${JSON.stringify(v.text)})`).join(',');
      const comma = isLastCh ? '' : ',';
      lines.push(`    ${ch}: [${verseParts}]${comma}`);
    }

    lines.push(`  }${isLast ? '' : ','}`);
  }

  lines.push('};');
  return lines.join('\n');
}

async function main() {
  const allBooks = [
    ...BOOKS.old.map(b => ({ ...b, url: `${OT_URL}/${b.file}` })),
    ...BOOKS.new.map(b => ({ ...b, url: `${NT_URL}/${b.file}` })),
  ];

  console.log(`Downloading ${allBooks.length} books (66 expected)...\n`);

  const data = {};
  let totalChapters = 0;
  let totalVerses = 0;

  for (let i = 0; i < allBooks.length; i++) {
    const book = allBooks[i];
    console.log(`[${i + 1}/${allBooks.length}] ${book.id}...`);

    const buffer = await downloadFile(book.url);
    if (!buffer) {
      console.log(`  ✗ Failed to download`);
      continue;
    }

    let text;
    try {
      text = new TextDecoder('gbk').decode(buffer);
    } catch {
      console.log(`  ✗ Failed to decode GBK`);
      continue;
    }

    const chapters = parseBookContent(text);
    const chCount = Object.keys(chapters).length;
    if (chCount === 0) {
      console.log(`  ✗ Failed to parse (0 chapters)`);
      continue;
    }

    let vCount = 0;
    for (const vs of Object.values(chapters)) vCount += vs.length;

    data[book.id] = chapters;
    totalChapters += chCount;
    totalVerses += vCount;
    console.log(`  ✓ ${chCount} chapters, ${vCount} verses`);

    // Rate limiting
    await new Promise(r => setTimeout(r, 300));
  }

  const bookCount = Object.keys(data).length;
  console.log(`\n✅ Downloaded ${bookCount}/66 books`);
  console.log(`   ${totalChapters} chapters, ${totalVerses} verses`);

  if (bookCount < 50) {
    console.log('⚠ Not enough books downloaded. Aborting.');
    process.exit(1);
  }

  // Generate TypeScript
  console.log('\nGenerating TypeScript...');
  const tsContent = generateTypeScript(data);
  const outputPath = path.join(__dirname, '..', 'bibleTextRCUV.ts');
  fs.writeFileSync(outputPath, tsContent, 'utf8');

  const stats = fs.statSync(outputPath);
  console.log(`✅ Saved to ${outputPath}`);
  console.log(`   Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);

  // Clean up temp files
  const tempDir = path.join(__dirname, 'rcuv-temp');
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true });
  }
}

main().catch(err => {
  console.error(`❌ Error: ${err.message}`);
  process.exit(1);
});

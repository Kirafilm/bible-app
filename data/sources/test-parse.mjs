import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const buf = fs.readFileSync(path.join(__dirname, 'rcuv-temp', 'gen.txt'));
const text = new TextDecoder('gbk').decode(buf);

// Correct verse counts for Genesis
const GENESIS_VERSE_COUNTS = [
  0, 31,25,24,26,32,22,24,22,29,
  32,32,20,18,24,21,16,27,33,38,
  18,34,24,20,67,34,35,46,22,35,
  43,55,32,20,31,29,43,36,30,23,
  23,57,38,34,34,28,34,31,22,33, 26
];

function cleanFootnotes(text) {
  let t = text;
  // Remove ' t ' patterns
  t = t.replace(/\s+t\s+/g, ' ');
  // Remove 't' between CJK char and punctuation
  t = t.replace(/(?<=[\u4e00-\u9fff])t(?=\s|$|[\。\,\;\:\?\!\…\—\-"\'\)\]\》\」\』])/g, '');
  // Remove leading 't '
  t = t.replace(/^t\s+/gm, '');
  // Remove trailing ' t'
  t = t.replace(/\s+t$/gm, '');
  return t;
}

function parseVerses(chapterText) {
  const cleaned = cleanFootnotes(chapterText).trim();
  if (!cleaned) return [];

  // Use lookbehind so delimiter character is NOT consumed
  // Verse number starts after: start of string OR any non-digit, non-letter, non-CJK char
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
        matchLen: m[0].length,
        textStart: m.index + m[0].length,
      });
    }
  }

  // Longest sequential chain from 1
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
    
    // Final cleanup
    verseText = verseText.replace(/\s{2,}/g, ' ').trim();
    
    if (verseText) {
      verses.push({ number: sequential[i].number, text: verseText });
    }
  }
  
  return verses;
}

// Parse
const lines = text.split(/\r?\n/);
let chapterText = '';
let currentChapter = null;
const chapters = {};

for (const line of lines) {
  const cm = line.trim().match(/^[\u4e00-\u9fff]+ (\d+)$/);
  if (cm) {
    if (currentChapter !== null && chapterText.trim()) {
      chapters[currentChapter] = parseVerses(chapterText.trim());
    }
    currentChapter = parseInt(cm[1], 10);
    chapterText = '';
    continue;
  }
  if (currentChapter !== null) {
    chapterText += (chapterText ? ' ' : '') + line.trim();
  }
}
if (currentChapter !== null && chapterText.trim()) {
  chapters[currentChapter] = parseVerses(chapterText.trim());
}

// Validate
let totalVerses = 0;
let allCorrect = true;
for (let ch = 1; ch <= 50; ch++) {
  const vs = chapters[ch] || [];
  totalVerses += vs.length;
  const expected = GENESIS_VERSE_COUNTS[ch];
  if (vs.length !== expected) {
    console.log(`Ch${ch}: got ${vs.length}, expected ${expected}  ⚠`);
    allCorrect = false;
  }
}
console.log(`Total: ${totalVerses} / 1533 ${totalVerses === 1533 ? '✅' : '❌'}`);
console.log(`All chapters correct: ${allCorrect ? '✅' : '❌'}\n`);

// Show Genesis 1
console.log('=== Genesis 1 ===');
(chapters[1] || []).forEach(v => console.log(`[${v.number}] ${v.text}`));

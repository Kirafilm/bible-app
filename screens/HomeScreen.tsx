import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { getLastRead, getFontSize } from '../utils/storage';
import { BIBLE_BOOKS, getBookById } from '../data/bibleStructure';
import { AppNavState } from '../App';

interface Props {
  onNavigate: (screen: 'home' | 'browse' | 'bookmarks' | 'search' | 'read', bookId?: string, chapter?: number) => void;
}

export default function HomeScreen({ onNavigate }: Props) {
  const [lastRead, setLastRead] = useState<{ bookId: string; chapter: number } | null>(null);
  const [fontSize, setFontSize] = useState(18);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const pos = await getLastRead();
    setLastRead(pos);
    const size = await getFontSize();
    setFontSize(size);
  }

  function handleContinue() {
    if (lastRead) {
      onNavigate('read', lastRead.bookId, lastRead.chapter);
    } else {
      onNavigate('read', 'john', 3);
    }
  }

  const lastBook = lastRead ? getBookById(lastRead.bookId) : null;
  const dailyVerse = { text: '神愛世人，甚至將他的獨生子賜給他們，叫一切信他的，不至滅亡，反得永生。', ref: '約翰福音 3:16' };

  return (
    <ScrollView style={styles.container}>
      {/* 每日經文 */}
      <View style={styles.verseCard}>
        <Text style={styles.verseLabel}>每日經文</Text>
        <Text style={styles.verseText}>「{dailyVerse.text}」</Text>
        <Text style={styles.verseRef}>{dailyVerse.ref}</Text>
      </View>

      {/* 繼續閱讀 */}
      <TouchableOpacity style={styles.continueCard} onPress={handleContinue}>
        <Text style={styles.continueLabel}>{lastBook ? '繼續閱讀' : '開始閱讀'}</Text>
        <Text style={styles.continueTitle}>
          {lastBook ? `${lastBook.name} 第${lastRead?.chapter}章` : '約翰福音 第3章'}
        </Text>
        <Text style={styles.continueHint}>點擊繼續 ›</Text>
      </TouchableOpacity>

      {/* 快捷書卷 */}
      <Text style={styles.sectionTitle}>常用書卷</Text>
      <View style={styles.quickGrid}>
        {['約翰福音', '馬太福音', '詩篇', '羅馬書', '創世記', '箴言'].map(name => {
          const book = BIBLE_BOOKS.find(b => b.name === name);
          return (
            <TouchableOpacity
              key={name}
              style={styles.quickItem}
              onPress={() => onNavigate('read', book?.id || 'john', 1)}
            >
              <Text style={styles.quickItemText}>{name}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  verseCard: { margin: 16, padding: 20, backgroundColor: '#c49a6c', borderRadius: 12 },
  verseLabel: { color: '#fff', fontSize: 13, opacity: 0.8, marginBottom: 8 },
  verseText: { color: '#fff', fontSize: 16, lineHeight: 26, marginBottom: 12 },
  verseRef: { color: '#fff', fontSize: 13, opacity: 0.7, textAlign: 'right' },
  continueCard: {
    marginHorizontal: 16, marginTop: 12, padding: 20, backgroundColor: '#fff', borderRadius: 12,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3,
  },
  continueLabel: { fontSize: 13, color: '#999', marginBottom: 4 },
  continueTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  continueHint: { fontSize: 14, color: '#c49a6c' },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#333', margin: 16, marginTop: 20 },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12 },
  quickItem: {
    width: '30%', margin: '1.5%', padding: 12, backgroundColor: '#fff', borderRadius: 8,
    alignItems: 'center', elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 2,
  },
  quickItemText: { fontSize: 13, color: '#555', textAlign: 'center' },
});

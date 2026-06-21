import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { searchVerses, Verse } from '../data/bibleText';
import { BIBLE_BOOKS, getBookById } from '../data/bibleStructure';
import { AppNavState } from '../App';

interface Props {
  onNavigate: (screen: 'home' | 'browse' | 'bookmarks' | 'search' | 'read', bookId?: string, chapter?: number) => void;
}

export default function SearchScreen({ onNavigate }: Props) {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<Array<{ bookId: string; chapter: number; verse: Verse }>>([]);
  const [searched, setSearched] = useState(false);

  function handleSearch() {
    if (!keyword.trim()) return;
    const r = searchVerses(keyword.trim());
    setResults(r);
    setSearched(true);
  }

  function handleResultPress(bookId: string, chapter: number) {
    onNavigate('read', bookId, chapter);
  }

  function getRefString(bookId: string, chapter: number, verse: number): string {
    const book = getBookById(bookId);
    return `${book ? book.name : bookId} ${chapter}:${verse}`;
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <TextInput
          style={styles.input}
          placeholder="搜尋經文關鍵字..."
          placeholderTextColor="#999"
          value={keyword}
          onChangeText={setKeyword}
          returnKeyType="search"
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
          <Text style={styles.searchBtnText}>搜尋</Text>
        </TouchableOpacity>
      </View>

      {searched && results.length === 0 && (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>找不到相關經文</Text>
          <Text style={styles.emptyHint}>包含全套聖經和合本（66卷）</Text>
        </View>
      )}

      <FlatList
        data={results}
        keyExtractor={(_, i) => i.toString()}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.resultItem}
            onPress={() => handleResultPress(item.bookId, item.chapter)}
          >
            <Text style={styles.resultRef}>
              {getRefString(item.bookId, item.chapter, item.verse.number)}
            </Text>
            <Text style={styles.resultText} numberOfLines={2}>
              {item.verse.text}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  searchBar: { flexDirection: 'row', padding: 12, gap: 8 },
  input: {
    flex: 1, backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10,
    fontSize: 15, borderWidth: 1, borderColor: '#e0e0e0',
  },
  searchBtn: { backgroundColor: '#c49a6c', borderRadius: 8, paddingHorizontal: 16, justifyContent: 'center' },
  searchBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  listContent: { padding: 12 },
  resultItem: {
    backgroundColor: '#fff', borderRadius: 8, padding: 14, marginBottom: 8,
    elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08, shadowRadius: 2,
  },
  resultRef: { fontSize: 13, color: '#c49a6c', fontWeight: '600', marginBottom: 4 },
  resultText: { fontSize: 14, color: '#333', lineHeight: 22 },
  empty: { flex: 1, alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 16, color: '#999', marginBottom: 8 },
  emptyHint: { fontSize: 12, color: '#bbb', textAlign: 'center', paddingHorizontal: 40 },
});

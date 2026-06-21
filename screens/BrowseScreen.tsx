import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { BIBLE_BOOKS, OLD_TESTAMENT_BOOKS, NEW_TESTAMENT_BOOKS, getBookById } from '../data/bibleStructure';
import { AppNavState } from '../App';

type TestAMent = 'all' | 'old' | 'new';

interface Props {
  onNavigate: (screen: 'home' | 'browse' | 'bookmarks' | 'search' | 'read', bookId?: string, chapter?: number) => void;
}

export default function BrowseScreen({ onNavigate }: Props) {
  const [filter, setFilter] = useState<TestAMent>('all');

  const filteredBooks = filter === 'old'
    ? OLD_TESTAMENT_BOOKS
    : filter === 'new'
    ? NEW_TESTAMENT_BOOKS
    : BIBLE_BOOKS;

  function handleBookPress(bookId: string) {
    onNavigate('read', bookId, 1);
  }

  return (
    <View style={styles.container}>
      <View style={styles.filterRow}>
        {(['all', 'old', 'new'] as TestAMent[]).map(key => (
          <TouchableOpacity
            key={key}
            style={[styles.filterBtn, filter === key && styles.filterBtnActive]}
            onPress={() => setFilter(key)}
          >
            <Text style={[styles.filterText, filter === key && styles.filterTextActive]}>
              {key === 'all' ? '全部' : key === 'old' ? '舊約' : '新約'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredBooks}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.bookItem} onPress={() => handleBookPress(item.id)}>
            <View style={styles.bookInfo}>
              <Text style={styles.bookName}>{item.name}</Text>
              <Text style={styles.bookMeta}>
                {item.testament === 'old' ? '舊約' : '新約'} · {item.chapters}章
              </Text>
            </View>
            <Text style={styles.bookArrow}>›</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  filterRow: { flexDirection: 'row', padding: 12, gap: 8 },
  filterBtn: {
    flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8,
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#e0e0e0',
  },
  filterBtnActive: { backgroundColor: '#c49a6c', borderColor: '#c49a6c' },
  filterText: { fontSize: 14, color: '#666' },
  filterTextActive: { color: '#fff', fontWeight: '600' },
  listContent: { paddingBottom: 20, paddingHorizontal: 12 },
  bookItem: {
    flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#fff',
    borderRadius: 8, marginBottom: 6, elevation: 1, shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 2,
  },
  bookInfo: { flex: 1 },
  bookName: { fontSize: 16, fontWeight: '500', color: '#333', marginBottom: 2 },
  bookMeta: { fontSize: 12, color: '#999' },
  bookArrow: { fontSize: 20, color: '#ccc' },
});

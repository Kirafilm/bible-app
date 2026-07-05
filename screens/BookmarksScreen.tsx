import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Pressable } from 'react-native';
import { getBookmarks, removeBookmark, Bookmark } from '../utils/storage';
import { getBookById } from '../data/bibleStructure';
import { getChapterText, BibleVersion } from '../data/bibleVersions';
import { getBibleVersion } from '../utils/storage';

interface Props {
  onNavigate: (screen: 'home' | 'browse' | 'bookmarks' | 'search' | 'read', bookId?: string, chapter?: number) => void;
}

export default function BookmarksScreen({ onNavigate }: Props) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [bibleVersion, setBibleVersion] = useState<BibleVersion>('rcuv');

  // 笔记查看弹窗
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [selectedBookmark, setSelectedBookmark] = useState<Bookmark | null>(null);
  const [noteVerseText, setNoteVerseText] = useState('');

  useEffect(() => { loadBookmarks(); }, []);
  useEffect(() => { getBibleVersion().then(setBibleVersion); }, []);

  async function loadBookmarks() {
    const data = await getBookmarks();
    setBookmarks(data);
  }

  function handlePress(bookmark: Bookmark) {
    setSelectedBookmark(bookmark);
    // 获取该节经文内容
    const chapterData = getChapterText(bookmark.bookId, bookmark.chapter, bibleVersion);
    if (chapterData) {
      const v = chapterData.find(vv => vv.number === bookmark.verse);
      setNoteVerseText(v ? v.text : '');
    } else {
      setNoteVerseText('');
    }
    setNoteModalVisible(true);
  }

  function handleGoToChapter(bookmark: Bookmark) {
    setNoteModalVisible(false);
    onNavigate('read', bookmark.bookId, bookmark.chapter);
  }

  function handleDelete(id: string) {
    setConfirmDeleteId(id);
  }

  async function confirmDelete() {
    if (confirmDeleteId) {
      await removeBookmark(confirmDeleteId);
      setConfirmDeleteId(null);
      loadBookmarks();
    }
  }

  function cancelDelete() {
    setConfirmDeleteId(null);
  }

  function getRefString(bookmark: Bookmark): string {
    const book = getBookById(bookmark.bookId);
    return `${book ? book.name : bookmark.bookId} ${bookmark.chapter}:${bookmark.verse}`;
  }

  if (bookmarks.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📖</Text>
        <Text style={styles.emptyTitle}>尚未有書籤</Text>
        <Text style={styles.emptyHint}>閱讀時長按經文可加入書籤及筆記</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={bookmarks}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <TouchableOpacity style={styles.itemPressArea} onPress={() => handlePress(item)} activeOpacity={0.7}>
              <View style={styles.itemContent}>
                <Text style={styles.itemRef}>{getRefString(item)}</Text>
                {item.note ? (
                  <Text style={styles.itemNote} numberOfLines={3}>{item.note}</Text>
                ) : null}
                <Text style={styles.itemDate}>
                  {new Date(item.createdAt).toLocaleDateString('zh-HK')}
                </Text>
              </View>
            </TouchableOpacity>
            {confirmDeleteId === item.id ? (
              <View style={styles.confirmRow}>
                <TouchableOpacity style={styles.confirmYesBtn} onPress={confirmDelete}>
                  <Text style={styles.confirmYesText}>刪除</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.confirmNoBtn} onPress={cancelDelete}>
                  <Text style={styles.confirmNoText}>取消</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Pressable
                style={({ pressed }) => [styles.deleteBtn, pressed && styles.deleteBtnPressed]}
                onPress={() => handleDelete(item.id)}
              >
                <Text style={styles.deleteText}>✕</Text>
              </Pressable>
            )}
          </View>
        )}
      />

      {/* 笔记查看弹窗 - 使用条件渲染重叠层，兼容 Web */}
      {noteModalVisible && (
        <View style={styles.noteOverlay}>
          <TouchableOpacity
            style={styles.noteOverlayBg}
            activeOpacity={1}
            onPress={() => setNoteModalVisible(false)}
          />
          <View style={styles.noteContent}>
            {/* 经文引用和经文内容 */}
            {selectedBookmark && (
              <View style={styles.noteRefBox}>
                <Text style={styles.noteRefText}>{getRefString(selectedBookmark)}</Text>
                {noteVerseText ? (
                  <Text style={styles.noteVerseText}>{noteVerseText}</Text>
                ) : null}
              </View>
            )}

            {/* 笔记内容 */}
            <Text style={styles.noteLabel}>你的筆記</Text>
            <View style={styles.noteBody}>
              <Text style={styles.noteBodyText}>
                {selectedBookmark?.note || '（無筆記內容）'}
              </Text>
            </View>

            {/* 按钮区 */}
            <View style={styles.noteBtnRow}>
              <TouchableOpacity
                style={styles.noteChapterBtn}
                onPress={() => selectedBookmark && handleGoToChapter(selectedBookmark)}
              >
                <Text style={styles.noteChapterBtnText}>跳至本章</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.noteCloseBtn}
                onPress={() => setNoteModalVisible(false)}
              >
                <Text style={styles.noteCloseBtnText}>關閉</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  listContent: { padding: 12 },
  item: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 8,
    marginBottom: 8, elevation: 1, shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 2,
  },
  itemPressArea: {
    flex: 1, padding: 14,
  },
  itemContent: { flex: 1 },
  itemRef: { fontSize: 15, fontWeight: '600', color: '#c49a6c', marginBottom: 2 },
  itemNote: { fontSize: 13, color: '#666', lineHeight: 19, marginTop: 4, marginBottom: 2 },
  itemDate: { fontSize: 11, color: '#999', marginTop: 4 },
  deleteBtn: { padding: 14, paddingLeft: 4 },
  deleteBtnPressed: { opacity: 0.5 },
  deleteText: { fontSize: 18, color: '#999' },
  confirmRow: { flexDirection: 'column', gap: 6, paddingRight: 10 },
  confirmYesBtn: {
    backgroundColor: '#e74c3c', paddingVertical: 6, paddingHorizontal: 14, borderRadius: 6,
  },
  confirmYesText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  confirmNoBtn: {
    backgroundColor: '#e0e0e0', paddingVertical: 6, paddingHorizontal: 14, borderRadius: 6,
  },
  confirmNoText: { color: '#666', fontSize: 13 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5' },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 8 },
  emptyHint: { fontSize: 14, color: '#999' },
  // 笔记查看弹窗
  noteOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center', justifyContent: 'center',
    zIndex: 100,
  },
  noteOverlayBg: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
  },
  noteContent: {
    backgroundColor: '#fff', borderRadius: 12,
    marginHorizontal: 24, padding: 20, width: '88%', maxWidth: 420,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 12, elevation: 8,
  },
  noteRefBox: {
    backgroundColor: '#f9f5f0', borderRadius: 8, padding: 14, marginBottom: 16,
    borderLeftWidth: 3, borderLeftColor: '#c49a6c',
  },
  noteRefText: { fontSize: 16, fontWeight: '600', color: '#c49a6c', marginBottom: 6 },
  noteVerseText: { fontSize: 14, color: '#555', lineHeight: 22 },
  noteLabel: { fontSize: 13, fontWeight: '600', color: '#999', marginBottom: 8 },
  noteBody: {
    backgroundColor: '#fafafa', borderRadius: 8, padding: 14,
    borderWidth: 1, borderColor: '#e8e8e8', marginBottom: 18,
  },
  noteBodyText: { fontSize: 15, color: '#333', lineHeight: 23 },
  noteBtnRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  noteChapterBtn: {
    flex: 1, backgroundColor: '#c49a6c', paddingVertical: 12, borderRadius: 8,
    alignItems: 'center',
  },
  noteChapterBtnText: { fontSize: 15, color: '#fff', fontWeight: '600' },
  noteCloseBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 8,
    alignItems: 'center', borderWidth: 1, borderColor: '#ddd',
  },
  noteCloseBtnText: { fontSize: 15, color: '#888' },
});

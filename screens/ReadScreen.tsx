import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Share, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { getBookById, BIBLE_BOOKS } from '../data/bibleStructure';
import { getChapterText, Verse } from '../data/bibleText';
import { saveLastRead, getFontSize, addBookmark, Bookmark } from '../utils/storage';
import { AppNavState } from '../App';

interface Props {
  bookId: string;
  chapter: number;
  onNavigate: (screen: 'home' | 'browse' | 'bookmarks' | 'search' | 'read', bookId?: string, chapter?: number) => void;
  onChapterChange: (bookId: string, chapter: number) => void;
}

export default function ReadScreen({ bookId, chapter, onNavigate, onChapterChange }: Props) {
  const [verses, setVerses] = useState<Verse[] | null>(null);
  const [fontSize, setFontSize] = useState(18);
  const [showChapterNav, setShowChapterNav] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  // 书签笔记弹窗
  const [bookmarkModalVisible, setBookmarkModalVisible] = useState(false);
  const [bookmarkVerse, setBookmarkVerse] = useState<Verse | null>(null);
  const [bookmarkNote, setBookmarkNote] = useState('');

  const book = getBookById(bookId);
  const totalChapters = book?.chapters || 1;

  useEffect(() => {
    loadFontAndChapter();
  }, [bookId, chapter]);

  async function loadFontAndChapter() {
    const size = await getFontSize();
    setFontSize(size);
    loadChapter();
  }

  function loadChapter() {
    const data = getChapterText(bookId, chapter);
    setVerses(data);
    saveLastRead({ bookId, chapter });
  }

  function goToChapter(newChapter: number) {
    if (newChapter < 1 || newChapter > totalChapters) return;
    onChapterChange(bookId, newChapter);
    onNavigate('read', bookId, newChapter);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }

  function goToPrev() {
    if (chapter > 1) {
      goToChapter(chapter - 1);
    } else {
      const idx = BIBLE_BOOKS.findIndex(b => b.id === bookId);
      if (idx > 0) {
        const prevBook = BIBLE_BOOKS[idx - 1];
        onNavigate('read', prevBook.id, prevBook.chapters);
      }
    }
  }

  function goToNext() {
    if (chapter < totalChapters) {
      goToChapter(chapter + 1);
    } else {
      const idx = BIBLE_BOOKS.findIndex(b => b.id === bookId);
      if (idx < BIBLE_BOOKS.length - 1) {
        const nextBook = BIBLE_BOOKS[idx + 1];
        onNavigate('read', nextBook.id, 1);
      }
    }
  }

  function handleBookmark(verse: Verse) {
    setBookmarkVerse(verse);
    setBookmarkNote('');
    setBookmarkModalVisible(true);
  }

  async function saveBookmark() {
    if (!bookmarkVerse) return;
    const bookmark: Bookmark = {
      id: `${bookId}-${chapter}-${bookmarkVerse.number}-${Date.now()}`,
      bookId,
      chapter,
      verse: bookmarkVerse.number,
      note: bookmarkNote.trim() || undefined,
      createdAt: Date.now(),
    };
    await addBookmark(bookmark);
    setBookmarkModalVisible(false);
    setBookmarkVerse(null);
    setBookmarkNote('');
    Alert.alert('已加入書籤', `${book?.name} ${chapter}:${bookmarkVerse.number}`);
  }

  function handleShare(verse: Verse) {
    const ref = `${book?.name || ''} ${chapter}:${verse.number}`;
    Share.share({ message: `「${verse.text}」\n${ref}` });
  }

  if (!book) {
    return (
      <View style={styles.center}>
        <Text>找不到該書卷</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 頂部標題列 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onNavigate('home')} style={styles.headerBtn}>
          <Text style={styles.headerBtnText}>‹ 返回</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{book.name} {chapter}</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => setFontSize(f => Math.min(f + 2, 28))}>
            <Text style={styles.headerBtnText}>A+</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setFontSize(f => Math.max(f - 2, 12))}>
            <Text style={styles.headerBtnText}>A-</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowChapterNav(!showChapterNav)}>
            <Text style={styles.headerBtnText}>☰</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 章數選擇 */}
      {showChapterNav && (
        <View style={styles.chapterNav}>
          <Text style={styles.chapterNavTitle}>{book.name} - 選擇章數</Text>
          <View style={styles.chapterGrid}>
            {Array.from({ length: totalChapters }, (_, i) => i + 1).map(p => (
              <TouchableOpacity
                key={p}
                style={[styles.chapterCell, p === chapter && styles.chapterCellActive]}
                onPress={() => { goToChapter(p); setShowChapterNav(false); }}
              >
                <Text style={[styles.chapterCellText, p === chapter && styles.chapterCellTextActive]}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* 經文內容 */}
      {!verses ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>此章節尚未收錄</Text>
          <TouchableOpacity
            style={styles.goDemoBtn}
            onPress={() => onNavigate('read', 'john', 3)}
          >
            <Text style={styles.goDemoText}>前往約翰福音 3章</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView ref={scrollRef} style={styles.scroll} contentContainerStyle={styles.content}>
            <Text style={styles.chapterHeader}>{book.name} 第{chapter}章</Text>
            {verses.map(verse => (
              <TouchableOpacity
                key={verse.number}
                style={styles.verseRow}
                onLongPress={() => handleBookmark(verse)}
                delayLongPress={500}
              >
                <Text style={[styles.verseNum, { fontSize: fontSize - 4 }]}>{verse.number}</Text>
                <Text style={[styles.verseText, { fontSize }]}>{verse.text}</Text>
                <TouchableOpacity style={styles.shareBtn} onPress={() => handleShare(verse)}>
                  <Text style={styles.shareText}>⇗</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
            <View style={{ height: 20 }} />
          </ScrollView>

          {/* 上下章按鈕 */}
          <View style={styles.navRow}>
            <TouchableOpacity style={styles.navBtn} onPress={goToPrev}>
              <Text style={styles.navBtnText}>‹ 上一章</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navBtn} onPress={goToNext}>
              <Text style={styles.navBtnText}>下一章 ›</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* 書籤筆記輸入彈窗 */}
      <Modal
        visible={bookmarkModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setBookmarkModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContent}
          >
            <Text style={styles.modalTitle}>加入書籤</Text>
            <View style={styles.modalRefBox}>
              <Text style={styles.modalRefText}>
                {book?.name} {chapter}:{bookmarkVerse?.number}
              </Text>
              <Text style={styles.modalVerseText} numberOfLines={3}>
                {bookmarkVerse?.text}
              </Text>
            </View>
            <TextInput
              style={styles.modalInput}
              placeholder="添加你的筆記或感想..."
              placeholderTextColor="#bbb"
              value={bookmarkNote}
              onChangeText={setBookmarkNote}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              autoFocus
            />
            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setBookmarkModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSaveBtn} onPress={saveBookmark}>
                <Text style={styles.modalSaveText}>儲存</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  header: {
    flexDirection: 'row', alignItems: 'center', padding: 12,
    borderBottomWidth: 1, borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  headerBtn: { padding: 4 },
  headerBtnText: { fontSize: 16, color: '#c49a6c', fontWeight: '500' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '600', color: '#333' },
  headerRight: { flexDirection: 'row', gap: 12 },
  chapterNav: {
    padding: 16, backgroundColor: '#f9f9f9',
    borderBottomWidth: 1, borderBottomColor: '#e0e0e0', maxHeight: 300,
  },
  chapterNavTitle: { fontSize: 14, color: '#666', marginBottom: 12 },
  chapterGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chapterCell: {
    width: 44, height: 44, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#e0e0e0',
  },
  chapterCellActive: { backgroundColor: '#c49a6c', borderColor: '#c49a6c' },
  chapterCellText: { fontSize: 14, color: '#333' },
  chapterCellTextActive: { color: '#fff', fontWeight: '600' },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 20 },
  chapterHeader: { fontSize: 22, fontWeight: 'bold', color: '#c49a6c', marginBottom: 20, textAlign: 'center' },
  verseRow: { flexDirection: 'row', marginBottom: 10, paddingVertical: 4, paddingHorizontal: 4, borderRadius: 4 },
  verseNum: { color: '#c49a6c', fontWeight: '600', marginRight: 8, minWidth: 24, textAlign: 'right', marginTop: 2 },
  verseText: { flex: 1, color: '#333', lineHeight: 28 },
  shareBtn: { padding: 4, marginLeft: 4 },
  shareText: { fontSize: 14, color: '#ccc' },
  navRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  navBtn: { flex: 1, padding: 14, alignItems: 'center' },
  navBtnText: { fontSize: 15, color: '#c49a6c', fontWeight: '500' },
  emptyText: { fontSize: 15, color: '#999', textAlign: 'center', lineHeight: 24, marginBottom: 20 },
  goDemoBtn: { backgroundColor: '#c49a6c', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  goDemoText: { color: '#fff', fontWeight: '500' },
  // 书签笔记弹窗
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center', justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: '#fff', borderRadius: 12,
    marginHorizontal: 24, padding: 20, width: '85%', maxWidth: 400,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 12, elevation: 8,
  },
  modalTitle: { fontSize: 18, fontWeight: '600', color: '#333', textAlign: 'center', marginBottom: 14 },
  modalRefBox: {
    backgroundColor: '#f9f5f0', borderRadius: 8, padding: 12, marginBottom: 14,
    borderLeftWidth: 3, borderLeftColor: '#c49a6c',
  },
  modalRefText: { fontSize: 15, fontWeight: '600', color: '#c49a6c', marginBottom: 4 },
  modalVerseText: { fontSize: 14, color: '#555', lineHeight: 21 },
  modalInput: {
    borderWidth: 1, borderColor: '#e0d5c7', borderRadius: 8,
    padding: 12, fontSize: 14, color: '#333', minHeight: 80,
    backgroundColor: '#fafafa', marginBottom: 16,
  },
  modalBtnRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  modalCancelBtn: {
    paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8,
    borderWidth: 1, borderColor: '#ddd',
  },
  modalCancelText: { fontSize: 14, color: '#888' },
  modalSaveBtn: {
    paddingVertical: 10, paddingHorizontal: 24, borderRadius: 8,
    backgroundColor: '#c49a6c',
  },
  modalSaveText: { fontSize: 14, color: '#fff', fontWeight: '600' },
});

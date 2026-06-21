import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import HomeScreen from './screens/HomeScreen';
import BrowseScreen from './screens/BrowseScreen';
import BookmarksScreen from './screens/BookmarksScreen';
import SearchScreen from './screens/SearchScreen';
import ReadScreen from './screens/ReadScreen';
import { BibleBook, BIBLE_BOOKS } from './data/bibleStructure';
import { Verse } from './data/bibleText';

// 簡單導航狀態
type Screen = 'home' | 'browse' | 'bookmarks' | 'search' | 'read';

export interface AppNavState {
  screen: Screen;
  bookId?: string;
  chapter?: number;
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [readState, setReadState] = useState<{ bookId: string; chapter: number }>({
    bookId: 'john',
    chapter: 3,
  });

  function navigate(screen: Screen, bookId?: string, chapter?: number) {
    setCurrentScreen(screen);
    if (bookId) setReadState(prev => ({ ...prev, bookId, chapter: chapter || 1 }));
  }

  function renderScreen() {
    switch (currentScreen) {
      case 'home':
        return <HomeScreen onNavigate={navigate} />;
      case 'browse':
        return <BrowseScreen onNavigate={navigate} />;
      case 'bookmarks':
        return <BookmarksScreen onNavigate={navigate} />;
      case 'search':
        return <SearchScreen onNavigate={navigate} />;
      case 'read':
        return (
          <ReadScreen
            bookId={readState.bookId}
            chapter={readState.chapter}
            onNavigate={navigate}
            onChapterChange={(bookId, chapter) => setReadState({ bookId, chapter })}
          />
        );
      default:
        return <HomeScreen onNavigate={navigate} />;
    }
  }

  const tabs: { key: Screen; label: string }[] = [
    { key: 'home', label: '首頁' },
    { key: 'browse', label: '聖經' },
    { key: 'bookmarks', label: '書籤' },
    { key: 'search', label: '搜尋' },
  ];

  // 閱讀頁面全螢幕顯示，不顯示底部 Tab
  if (currentScreen === 'read') {
    return (
      <SafeAreaView style={styles.container}>
        {renderScreen()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>{renderScreen()}</View>
      <View style={styles.tabBar}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabItem}
            onPress={() => navigate(tab.key)}
          >
            <Text
              style={[
                styles.tabLabel,
                currentScreen === tab.key && styles.tabLabelActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  tabLabel: {
    fontSize: 12,
    color: '#999',
  },
  tabLabelActive: {
    color: '#c49a6c',
    fontWeight: '600',
  },
});

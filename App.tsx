import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, StatusBar, BackHandler } from 'react-native';
import HomeScreen from './screens/HomeScreen';
import BrowseScreen from './screens/BrowseScreen';
import BookmarksScreen from './screens/BookmarksScreen';
import SearchScreen from './screens/SearchScreen';
import ReadScreen from './screens/ReadScreen';
import { useAppInsets } from './utils/useAppInsets';
import { BibleVersion } from './data/bibleVersions';
import { getBibleVersion, saveBibleVersion } from './utils/storage';

type Screen = 'home' | 'browse' | 'bookmarks' | 'search' | 'read';

export interface AppNavState {
  screen: Screen;
  bookId?: string;
  chapter?: number;
}

export default function App() {
  const insets = useAppInsets();
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [readState, setReadState] = useState<{ bookId: string; chapter: number }>({
    bookId: 'john',
    chapter: 3,
  });
  const [bibleVersion, setBibleVersion] = useState<BibleVersion>('rcuv');

  useEffect(() => {
    getBibleVersion().then(setBibleVersion);
  }, []);

  // Android 實體返回鍵處理
  useEffect(() => {
    function handleBackPress() {
      if (currentScreen !== 'home') {
        setCurrentScreen('home');
        return true; // 攔截返回，回到首頁
      }
      return false; // 已在首頁，退出應用
    }
    const subscription = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => subscription.remove();
  }, [currentScreen]);

  function handleVersionChange(version: BibleVersion) {
    setBibleVersion(version);
    saveBibleVersion(version);
  }

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
        return <SearchScreen onNavigate={navigate} bibleVersion={bibleVersion} />;
      case 'read':
        return (
          <ReadScreen
            bookId={readState.bookId}
            chapter={readState.chapter}
            bottomInset={insets.bottom}
            bibleVersion={bibleVersion}
            onVersionChange={handleVersionChange}
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

  if (currentScreen === 'read') {
    return (
      <>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" translucent={Platform.OS === 'android'} />
        <View
          style={[
            styles.container,
            {
              paddingTop: insets.top,
              paddingLeft: insets.left,
              paddingRight: insets.right,
            },
          ]}
        >
          {renderScreen()}
        </View>
      </>
    );
  }

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" translucent={Platform.OS === 'android'} />
      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top,
            paddingLeft: insets.left,
            paddingRight: insets.right,
          },
        ]}
      >
        <View style={styles.content}>{renderScreen()}</View>
        <View style={[styles.tabBarSafe, { paddingBottom: Math.max(insets.bottom, 8) }]}>
          <View style={styles.tabBar}>
            {tabs.map(tab => (
              <TouchableOpacity
                key={tab.key}
                style={styles.tabItem}
                onPress={() => navigate(tab.key)}
                activeOpacity={0.7}
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
        </View>
      </View>
    </>
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
  tabBarSafe: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  tabBar: {
    flexDirection: 'row',
    minHeight: 52,
    alignItems: 'center',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    minHeight: 48,
  },
  tabLabel: {
    fontSize: 13,
    color: '#999',
  },
  tabLabelActive: {
    color: '#c49a6c',
    fontWeight: '600',
  },
});

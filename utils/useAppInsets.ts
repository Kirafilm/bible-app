import { Platform, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** 在 edge-to-edge Android 上確保頂部狀態列、鏡頭孔與底部導覽列不遮擋內容 */
export function useAppInsets() {
  const insets = useSafeAreaInsets();

  const statusBarHeight =
    Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 0;

  // 部分機型（挖孔、摺疊外屏）safe area 回傳 0，需保底間距
  const top = Math.max(insets.top, statusBarHeight, Platform.OS === 'android' ? 36 : 0);
  const bottom = Math.max(insets.bottom, Platform.OS === 'android' ? 48 : 0);

  return {
    top,
    bottom,
    left: insets.left,
    right: insets.right,
  };
}

import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useApp } from '../AppProvider';

export function ProgressBar({ progress, height = 8 }: { progress: number; height?: number }) {
  const { colors, comic, spider } = useApp();
  // In the Spider-Verse look, the bar fills from zero with a spring. In the classic look, it does not move.
  const fill = useSharedValue(spider ? 0 : progress);

  useEffect(() => {
    fill.value = spider ? withSpring(progress, { damping: 14 }) : progress;
  }, [fill, progress, spider]);

  const width = useAnimatedStyle(() => ({ width: `${Math.max(0, Math.round(fill.value * 100))}%` }));

  return (
    <View style={[styles.track, { height, borderRadius: height / 2, backgroundColor: colors.track }, comic.outline]}>
      <Animated.View style={[{ height: '100%', borderRadius: height / 2, backgroundColor: colors.accent }, width]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { overflow: 'hidden' },
});

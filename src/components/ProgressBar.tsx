import { StyleSheet, View } from 'react-native';
import { COLORS } from '../theme';

export function ProgressBar({ progress }: { progress: number }) {
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${Math.round(progress * 100)}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { height: 8, borderRadius: 4, backgroundColor: COLORS.track, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4, backgroundColor: COLORS.accent },
});

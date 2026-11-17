import { StyleSheet, View } from 'react-native';
import { useApp } from '../AppProvider';

export function ProgressBar({ progress, height = 8 }: { progress: number; height?: number }) {
  const { colors } = useApp();
  return (
    <View style={[styles.track, { height, borderRadius: height / 2, backgroundColor: colors.track }]}>
      <View
        style={{
          width: `${Math.round(progress * 100)}%`,
          height: '100%',
          borderRadius: height / 2,
          backgroundColor: colors.accent,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { overflow: 'hidden' },
});

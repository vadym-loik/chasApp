import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { CounterItem } from '../models/counter';
import { useApp } from '../AppProvider';
import { getCounterDetails, getCounterStats } from '../utils/counter';
import { ProgressBar } from './ProgressBar';

interface Props {
  item: CounterItem;
  onPress?: () => void;
}

export function CounterCard({ item, onPress }: Props) {
  const { colors, cardColor, t } = useApp();
  const stats = getCounterStats(item, t);
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityLabel={`${item.title}: ${stats.value} ${stats.label}`}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: cardColor(item.color), transform: [{ scale: pressed ? 0.98 : 1 }] },
      ]}
    >
      <View style={styles.row}>
        <Text style={styles.emoji}>{item.emoji}</Text>
        <View style={styles.titleBox}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={[styles.details, { color: colors.muted }]} numberOfLines={2}>
            {getCounterDetails(item, t)}
          </Text>
        </View>
        <View style={styles.valueBox}>
          <Text style={[styles.value, { color: colors.text }]}>{stats.value}</Text>
          <Text style={[styles.label, { color: colors.muted }]}>{stats.label}</Text>
        </View>
      </View>
      {stats.progress !== undefined && <ProgressBar progress={stats.progress} height={6} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 24, padding: 18, gap: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  emoji: { fontSize: 34 },
  titleBox: { flex: 1, gap: 2 },
  title: { fontSize: 17, fontWeight: '600' },
  details: { fontSize: 13 },
  valueBox: { alignItems: 'flex-end', maxWidth: '40%' },
  value: { fontSize: 30, fontWeight: '800', fontVariant: ['tabular-nums'] },
  label: { fontSize: 12, textAlign: 'right' },
});

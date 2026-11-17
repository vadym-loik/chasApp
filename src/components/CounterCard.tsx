import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COUNTER_TYPE_LABELS, type CounterItem } from '../models/counter';
import { COLORS } from '../theme';
import { getCounterStats } from '../utils/counter';
import { ProgressBar } from './ProgressBar';

interface Props {
  item: CounterItem;
  onPress?: () => void;
}

export function CounterCard({ item, onPress }: Props) {
  const stats = getCounterStats(item);
  return (
    <Pressable onPress={onPress} style={[styles.card, { backgroundColor: item.color }]}>
      <View style={styles.row}>
        <Text style={styles.emoji}>{item.emoji}</Text>
        <View style={styles.titleBox}>
          <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.subtitle}>{COUNTER_TYPE_LABELS[item.type]}</Text>
        </View>
        <View style={styles.valueBox}>
          <Text style={styles.value}>{stats.value}</Text>
          <Text style={styles.unit}>{stats.unit}</Text>
        </View>
      </View>
      {stats.progress !== undefined && <ProgressBar progress={stats.progress} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 20, padding: 16, gap: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  emoji: { fontSize: 32 },
  titleBox: { flex: 1 },
  title: { fontSize: 17, fontWeight: '600', color: COLORS.text },
  subtitle: { fontSize: 13, color: COLORS.muted, marginTop: 2 },
  valueBox: { alignItems: 'flex-end' },
  value: { fontSize: 28, fontWeight: '700', color: COLORS.text },
  unit: { fontSize: 12, color: COLORS.muted },
});

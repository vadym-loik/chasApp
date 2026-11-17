import { StyleSheet, Text, View } from 'react-native';
import { useApp } from '../AppProvider';
import { getYearProgress } from '../utils/counter';
import { ProgressRing } from './ProgressRing';

/** How much of the current year has passed, and how much is left. */
export function YearCard({ now }: { now: string }) {
  const { colors, t } = useApp();
  const year = getYearProgress(now);
  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <ProgressRing progress={year.progress} size={108} stroke={11}>
        <Text style={[styles.percent, { color: colors.text }]}>{t.formatPercent(year.progress * 100, 1)}</Text>
      </ProgressRing>
      <View style={styles.info}>
        <Text style={[styles.title, { color: colors.muted }]}>{t.yearTitle(year.year)}</Text>
        <Text style={[styles.value, { color: colors.text }]}>{year.daysLeft}</Text>
        <Text style={[styles.label, { color: colors.text }]}>{t.daysLeft(year.daysLeft)}</Text>
        <Text style={[styles.meta, { color: colors.muted }]}>
          {t.dayOfYear(year.day, year.total)}
          {'\n'}
          {t.weekendsLeft(year.weekendsLeft)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: 20, borderRadius: 24, padding: 20 },
  percent: { fontSize: 19, fontWeight: '800', fontVariant: ['tabular-nums'] },
  info: { flex: 1 },
  title: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 },
  value: { fontSize: 34, fontWeight: '800', marginTop: 2, fontVariant: ['tabular-nums'] },
  label: { fontSize: 14, fontWeight: '500' },
  meta: { fontSize: 13, marginTop: 6, lineHeight: 18 },
});

import { StyleSheet, Text, View } from 'react-native';
import { useApp } from '../AppProvider';
import { getYearProgress } from '../utils/counter';
import { Halftone } from './Halftone';
import { ProgressRing } from './ProgressRing';

/** How much of the current year has passed, and how much is left. */
export function YearCard({ now }: { now: string }) {
  const { colors, comic, spider, t } = useApp();
  const year = getYearProgress(now);
  // Two numbers side by side, so the text fills the card.
  const stats = [
    { value: year.daysLeft, label: t.daysLeft(year.daysLeft) },
    { value: year.weekendsLeft, label: t.weekendsLeft(year.weekendsLeft) },
  ];
  return (
    <View style={[styles.card, { backgroundColor: colors.surface }, comic.frame]}>
      {spider && <Halftone color={colors.accent} radius={RADIUS} />}
      <ProgressRing progress={year.progress} size={108} stroke={11}>
        <Text style={[styles.percent, { color: colors.text }, comic.heading]}>{t.formatPercent(year.progress * 100, 1)}</Text>
      </ProgressRing>
      <View style={styles.info}>
        <Text style={[styles.title, { color: colors.muted }]}>{t.yearTitle(year.year)}</Text>
        <View style={styles.stats}>
          {stats.map((s) => (
            <View key={s.label} style={styles.stat}>
              <Text style={[styles.value, { color: colors.text }, comic.heading]}>{s.value}</Text>
              <Text style={[styles.label, { color: colors.text }]}>{s.label}</Text>
            </View>
          ))}
        </View>
        <Text style={[styles.meta, { color: colors.muted }]}>{t.dayOfYear(year.day, year.total)}</Text>
      </View>
    </View>
  );
}

const RADIUS = 24;

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: 20, borderRadius: RADIUS, padding: 20 },
  percent: { fontSize: 19, fontWeight: '800', fontVariant: ['tabular-nums'] },
  info: { flex: 1 },
  title: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 },
  stats: { flexDirection: 'row', gap: 12, marginTop: 2 },
  stat: { flex: 1 },
  value: { fontSize: 34, fontWeight: '800', fontVariant: ['tabular-nums'] },
  label: { fontSize: 14, fontWeight: '500' },
  meta: { fontSize: 13, marginTop: 8 },
});

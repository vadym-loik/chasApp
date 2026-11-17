import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/Button';
import { Field } from '../components/Field';
import { ProgressBar } from '../components/ProgressBar';
import { COUNTER_TYPE_LABELS, type CounterItem } from '../models/counter';
import { deleteCounter, getCounter, updateCounter } from '../services/storage';
import { COLORS } from '../theme';
import { confirm } from '../utils/confirm';
import { getCounterStats, parseNumber, today } from '../utils/counter';

export default function DetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [item, setItem] = useState<CounterItem | null | undefined>(undefined);
  const [newValue, setNewValue] = useState('');

  const load = useCallback(() => getCounter(id).then((c) => setItem(c ?? null)), [id]);
  useEffect(() => {
    load();
  }, [load]);

  if (item === undefined) return null;
  if (item === null) {
    return <Text style={styles.missing}>Counter not found.</Text>;
  }

  const stats = getCounterStats(item);

  async function update(changes: Partial<CounterItem>) {
    await updateCounter(id, changes);
    await load();
  }

  function reset() {
    confirm('Reset counter?', 'The count starts again from today.', () => update({ startDate: today() }));
  }

  function saveValue() {
    const n = parseNumber(newValue);
    if (n === undefined) return;
    update({ currentValue: n });
    setNewValue('');
  }

  function remove() {
    confirm('Delete counter?', `"${item!.title}" will be deleted.`, async () => {
      await deleteCounter(id);
      router.back();
    });
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={[styles.hero, { backgroundColor: item.color }]}>
        <Text style={styles.emoji}>{item.emoji}</Text>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.value}>{stats.value}</Text>
        <Text style={styles.unit}>{stats.unit} · {COUNTER_TYPE_LABELS[item.type]}</Text>
        {stats.progress !== undefined && (
          <View style={styles.progress}>
            <ProgressBar progress={stats.progress} />
          </View>
        )}
        <Text style={styles.meta}>
          {item.type === 'days_left' && `Target date: ${item.targetDate}`}
          {item.type === 'days_passed' && `Since: ${item.startDate}`}
          {item.type === 'goal_progress' &&
            `${item.initialValue} → ${item.currentValue} → ${item.targetValue}`}
        </Text>
      </View>

      {item.type === 'days_passed' && <Button title="Reset to today" onPress={reset} />}
      {item.type === 'goal_progress' && (
        <>
          <Field
            label="Current value"
            value={newValue}
            onChangeText={setNewValue}
            keyboardType="decimal-pad"
            placeholder={String(item.currentValue ?? '')}
          />
          <Button title="Update value" onPress={saveValue} />
        </>
      )}
      <Button title="Delete" variant="danger" onPress={remove} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 16 },
  hero: { borderRadius: 24, padding: 24, alignItems: 'center', gap: 4 },
  emoji: { fontSize: 56 },
  title: { fontSize: 22, fontWeight: '700', color: COLORS.text },
  value: { fontSize: 72, fontWeight: '800', color: COLORS.text, marginTop: 8 },
  unit: { fontSize: 15, color: COLORS.muted },
  progress: { alignSelf: 'stretch', marginTop: 16 },
  meta: { fontSize: 14, color: COLORS.muted, marginTop: 12 },
  missing: { padding: 24, fontSize: 16, color: COLORS.muted, textAlign: 'center' },
});

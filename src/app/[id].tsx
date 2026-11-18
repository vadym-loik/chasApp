import { router, Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { Field } from '../components/Field';
import { HeaderButton } from '../components/HeaderButton';
import { ProgressBar } from '../components/ProgressBar';
import type { CounterItem } from '../models/counter';
import { getCounter, updateCounter } from '../services/storage';
import { useApp } from '../AppProvider';
import { confirm, confirmDelete } from '../utils/confirm';
import { getCounterBreakdown, getCounterDetails, getCounterStats, parseNumber, today } from '../utils/counter';

export default function DetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, cardColor, t } = useApp();
  const insets = useSafeAreaInsets();
  const [item, setItem] = useState<CounterItem | null | undefined>(undefined);
  const [newValue, setNewValue] = useState('');

  const load = useCallback(async () => {
    const c = await getCounter(id);
    setItem(c ?? null);
    setNewValue(c?.currentValue === undefined ? '' : String(c.currentValue));
  }, [id]);

  // Reload when the user comes back from the edit screen.
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  if (item === undefined) return null;
  if (item === null) {
    return <Text style={[styles.missing, { color: colors.muted }]}>{t.notFound}</Text>;
  }

  const stats = getCounterStats(item, t);
  const parsedValue = parseNumber(newValue);

  async function update(changes: Partial<CounterItem>) {
    await updateCounter(id, changes);
    await load();
  }

  function reset() {
    confirm(
      { title: t.startOverTitle, message: t.startOverMessage, action: t.startOver, cancel: t.cancel },
      () => update({ startDate: today() }),
    );
  }

  function remove() {
    confirmDelete(item!, t, () => router.back());
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <HeaderButton icon="edit" label={t.editCounter} onPress={() => router.push(`/edit?id=${id}`)} />
          ),
        }}
      />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
      >
        <View style={[styles.hero, { backgroundColor: cardColor(item.color) }]}>
          <Text style={styles.emoji}>{item.emoji}</Text>
          <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
          <Text style={[styles.type, { color: colors.muted }]}>{t.types[item.type].label}</Text>
          <Text style={[styles.value, { color: colors.text }]} adjustsFontSizeToFit numberOfLines={1}>
            {stats.value}
          </Text>
          <Text style={[styles.label, { color: colors.text }]}>{stats.label}</Text>
          {stats.progress !== undefined && (
            <View style={styles.progress}>
              <ProgressBar progress={stats.progress} height={10} />
            </View>
          )}
          <Text style={[styles.details, { color: colors.muted }]}>{getCounterDetails(item, t)}</Text>
          {getCounterBreakdown(item, t).map((line) => (
            <Text key={line} style={[styles.breakdown, { color: colors.text }]}>
              {line}
            </Text>
          ))}
        </View>

        {item.type === 'goal_progress' && (
          <View style={styles.updateRow}>
            <View style={styles.flex}>
              <Field
                label={t.currentValue}
                value={newValue}
                onChangeText={setNewValue}
                keyboardType="decimal-pad"
                selectTextOnFocus
              />
            </View>
            <View>
              <Button
                title={t.update}
                disabled={parsedValue === undefined || parsedValue === item.currentValue}
                onPress={() => update({ currentValue: parsedValue })}
              />
            </View>
          </View>
        )}
        {item.type === 'days_passed' && (
          <Button title={t.startOver} icon="reset" variant="secondary" onPress={reset} />
        )}
        <Button title={t.delete} icon="trash" variant="danger" onPress={remove} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 16, gap: 14 },
  hero: { borderRadius: 28, padding: 28, alignItems: 'center' },
  emoji: { fontSize: 64 },
  title: { fontSize: 24, fontWeight: '700', marginTop: 8, textAlign: 'center' },
  type: { fontSize: 14, marginTop: 4 },
  value: { fontSize: 88, fontWeight: '800', marginTop: 12, fontVariant: ['tabular-nums'] },
  label: { fontSize: 17, fontWeight: '500' },
  progress: { alignSelf: 'stretch', marginTop: 20 },
  details: { fontSize: 14, marginTop: 14, textAlign: 'center' },
  breakdown: { fontSize: 14, fontWeight: '500', marginTop: 6, textAlign: 'center' },
  updateRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  missing: { padding: 24, fontSize: 16, textAlign: 'center' },
});

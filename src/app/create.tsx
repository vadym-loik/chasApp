import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/Button';
import { Field } from '../components/Field';
import { COUNTER_TYPE_LABELS, type CounterItem, type CounterType } from '../models/counter';
import { addCounter } from '../services/storage';
import { COLORS, PASTEL_COLORS } from '../theme';
import { isValidDate, parseNumber, today } from '../utils/counter';

const TYPES = Object.keys(COUNTER_TYPE_LABELS) as CounterType[];

export default function CreateScreen() {
  const [type, setType] = useState<CounterType>('days_left');
  const [title, setTitle] = useState('');
  const [emoji, setEmoji] = useState('⭐');
  const [color, setColor] = useState(PASTEL_COLORS[0]);
  const [targetDate, setTargetDate] = useState('');
  const [startDate, setStartDate] = useState(today());
  const [initialValue, setInitialValue] = useState('');
  const [targetValue, setTargetValue] = useState('');
  const [error, setError] = useState('');

  function buildItem(): Omit<CounterItem, 'id'> | string {
    if (!title.trim()) return 'Enter a title.';
    const base = { title: title.trim(), emoji: emoji.trim() || '⭐', type, color };
    if (type === 'days_left') {
      if (!isValidDate(targetDate)) return 'Enter the target date as YYYY-MM-DD.';
      return { ...base, targetDate, startDate: today() };
    }
    if (type === 'days_passed') {
      if (!isValidDate(startDate)) return 'Enter the start date as YYYY-MM-DD.';
      return { ...base, startDate };
    }
    const initial = parseNumber(initialValue);
    const target = parseNumber(targetValue);
    if (initial === undefined || target === undefined) return 'Enter the start and target values.';
    return { ...base, initialValue: initial, currentValue: initial, targetValue: target };
  }

  async function save() {
    const item = buildItem();
    if (typeof item === 'string') {
      setError(item);
      return;
    }
    await addCounter(item);
    router.back();
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.segment}>
        {TYPES.map((t) => (
          <Pressable
            key={t}
            onPress={() => setType(t)}
            style={[styles.segmentItem, t === type && styles.segmentActive]}
          >
            <Text style={[styles.segmentText, t === type && styles.segmentTextActive]}>
              {COUNTER_TYPE_LABELS[t]}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.row}>
        <View style={styles.emojiField}>
          <Field label="Emoji" value={emoji} onChangeText={setEmoji} maxLength={4} />
        </View>
        <View style={styles.flex}>
          <Field label="Title" value={title} onChangeText={setTitle} placeholder="No sugar" />
        </View>
      </View>

      {type === 'days_left' && (
        <Field label="Target date" value={targetDate} onChangeText={setTargetDate} placeholder="YYYY-MM-DD" />
      )}
      {type === 'days_passed' && (
        <Field label="Start date" value={startDate} onChangeText={setStartDate} placeholder="YYYY-MM-DD" />
      )}
      {type === 'goal_progress' && (
        <View style={styles.row}>
          <View style={styles.flex}>
            <Field label="Start value" value={initialValue} onChangeText={setInitialValue} keyboardType="decimal-pad" placeholder="88" />
          </View>
          <View style={styles.flex}>
            <Field label="Target value" value={targetValue} onChangeText={setTargetValue} keyboardType="decimal-pad" placeholder="80" />
          </View>
        </View>
      )}

      <Text style={styles.label}>Color</Text>
      <View style={styles.colors}>
        {PASTEL_COLORS.map((c) => (
          <Pressable
            key={c}
            onPress={() => setColor(c)}
            style={[styles.swatch, { backgroundColor: c }, c === color && styles.swatchActive]}
          />
        ))}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button title="Save" onPress={save} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 16 },
  row: { flexDirection: 'row', gap: 12 },
  flex: { flex: 1 },
  emojiField: { width: 80 },
  segment: { flexDirection: 'row', backgroundColor: COLORS.track, borderRadius: 12, padding: 4 },
  segmentItem: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  segmentActive: { backgroundColor: COLORS.surface },
  segmentText: { fontSize: 13, color: COLORS.muted, fontWeight: '600' },
  segmentTextActive: { color: COLORS.text },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.muted },
  colors: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  swatch: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: 'transparent' },
  swatchActive: { borderColor: COLORS.text },
  error: { color: COLORS.danger, fontSize: 14 },
});

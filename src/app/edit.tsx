import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../AppProvider';
import { Button } from '../components/Button';
import { Chips } from '../components/Chips';
import { ColorSwatches } from '../components/ColorSwatches';
import { CounterCard } from '../components/CounterCard';
import { DateField } from '../components/DateField';
import { EmojiPicker } from '../components/EmojiPicker';
import { Field, Labeled } from '../components/Field';
import { OptionRow } from '../components/OptionRow';
import { Segmented } from '../components/Segmented';
import {
  COUNTER_TYPE_EMOJI, COUNTER_TYPE_KEYS, DEFAULT_REMINDER_TIME, REPEATS, type CounterItem, type CounterType, type Reminder,
  type Repeat,
} from '../models/counter';
import { remindersAvailable, requestReminderPermission } from '../services/reminders';
import { addCounter, getCounter, updateCounter } from '../services/storage';
import { CARD_COLOR_KEYS, cardColor, type CardColorKey } from '../theme/colors';
import { addDays, getReminderOptions, isFutureCustomReminder, parseNumber, today } from '../utils/counter';

/** Creates a counter, or edits one when the route has an `id` param. */
export default function EditScreen() {
  const { t } = useApp();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [item, setItem] = useState<CounterItem | null | undefined>(id ? undefined : null);

  useEffect(() => {
    if (id) getCounter(id).then((c) => setItem(c ?? null));
  }, [id]);

  return (
    <>
      <Stack.Screen options={{ title: id ? t.editCounter : t.newCounter }} />
      {item !== undefined && <CounterForm initial={item} />}
    </>
  );
}

const optionalText = (n?: number) => (n === undefined ? '' : String(n));

const QUICK_DATES = [
  { key: 'tomorrow', amount: 1, unit: 'day' },
  { key: 'week', amount: 1, unit: 'week' },
  { key: 'month', amount: 1, unit: 'month' },
  { key: 'year', amount: 1, unit: 'year' },
] as const;

function CounterForm({ initial }: { initial: CounterItem | null }) {
  const { colors, scheme, t } = useApp();
  const insets = useSafeAreaInsets();
  const [type, setType] = useState<CounterType>(initial?.type ?? 'days_left');
  const [title, setTitle] = useState(initial?.title ?? '');
  const [emoji, setEmoji] = useState(initial?.emoji ?? COUNTER_TYPE_EMOJI.days_left);
  const [color, setColor] = useState(initial?.color ?? CARD_COLOR_KEYS[0]);
  const [targetDate, setTargetDate] = useState(initial?.targetDate ?? addDays(today(), 1, 'month'));
  const [repeat, setRepeat] = useState<Repeat>(initial?.repeat ?? 'none');
  // A custom reminder that has passed is off: the user must choose a new date.
  const [reminder, setReminder] = useState<Reminder>(
    initial?.reminder === 'custom' && !isFutureCustomReminder(initial) ? 'none' : (initial?.reminder ?? 'none'),
  );
  const [reminderTime, setReminderTime] = useState(initial?.reminderTime ?? DEFAULT_REMINDER_TIME);
  const [reminderDate, setReminderDate] = useState(initial?.reminderDate ?? addDays(today(), 1));
  const [startDate, setStartDate] = useState(initial?.startDate ?? today());
  const [initialValue, setInitialValue] = useState(optionalText(initial?.initialValue));
  const [currentValue, setCurrentValue] = useState(optionalText(initial?.currentValue));
  const [targetValue, setTargetValue] = useState(optionalText(initial?.targetValue));
  const [error, setError] = useState('');
  // Blocks a second tap while the first save runs, so one tap makes one counter.
  const [saving, setSaving] = useState(false);

  function chooseType(next: CounterType) {
    // Change the emoji only if the user did not pick one.
    if (emoji === COUNTER_TYPE_EMOJI[type]) setEmoji(COUNTER_TYPE_EMOJI[next]);
    setType(next);
    keepValidReminder(next, repeat);
  }

  function chooseRepeat(next: Repeat) {
    setRepeat(next);
    keepValidReminder(type, next);
  }

  // Not all reminders work for all counters, for example no custom date for a repeating event.
  function keepValidReminder(nextType: CounterType, nextRepeat: Repeat) {
    if (!getReminderOptions(nextType, nextRepeat).includes(reminder)) setReminder('none');
  }

  async function chooseReminder(next: Reminder) {
    if (next !== 'none' && !(await requestReminderPermission(t))) {
      Alert.alert(t.reminder, t.notificationsOff);
      return;
    }
    setReminder(next);
  }

  function buildItem(): Omit<CounterItem, 'id'> | string {
    const base = {
      title: title.trim(),
      emoji,
      type,
      color,
      reminder,
      reminderTime: reminder === 'none' ? undefined : reminderTime,
      reminderDate: reminder === 'custom' ? reminderDate : undefined,
    };
    if (!base.title) return t.errorName;
    if (reminder === 'custom' && !isFutureCustomReminder(base)) return t.errorReminderPast;
    if (type === 'days_left') {
      // Progress starts on the day the counter was created.
      return { ...base, targetDate, repeat, startDate: initial?.startDate ?? today() };
    }
    if (type === 'days_passed') return { ...base, startDate };
    const start = parseNumber(initialValue);
    const target = parseNumber(targetValue);
    if (start === undefined || target === undefined) return t.errorValues;
    if (start === target) return t.errorSameValues;
    const current = initial ? parseNumber(currentValue) : start;
    if (current === undefined) return t.errorCurrent;
    return { ...base, initialValue: start, currentValue: current, targetValue: target };
  }

  const built = buildItem();
  const preview: CounterItem = {
    id: 'preview',
    title: title.trim() || t.types[type].placeholder,
    emoji,
    type,
    color,
    startDate,
    targetDate,
    repeat,
    initialValue: parseNumber(initialValue),
    currentValue: parseNumber(initial ? currentValue : initialValue),
    targetValue: parseNumber(targetValue),
  };

  async function save() {
    if (typeof built === 'string') {
      setError(built);
      return;
    }
    setSaving(true);
    try {
      if (initial) await updateCounter(initial.id, built);
      else await addCounter(built);
      router.back();
    } catch (e) {
      console.warn('Counter save failed', e);
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
      >
        <CounterCard item={preview} />

        {!initial && (
          <Labeled label={t.whatToCount}>
            {COUNTER_TYPE_KEYS.map((key) => (
              <OptionRow
                key={key}
                emoji={COUNTER_TYPE_EMOJI[key]}
                title={t.types[key].label}
                description={t.types[key].description}
                active={key === type}
                onPress={() => chooseType(key)}
              />
            ))}
          </Labeled>
        )}

        <Field
          label={t.name}
          value={title}
          onChangeText={(v) => {
            setTitle(v);
            setError('');
          }}
          placeholder={t.types[type].placeholder}
          maxLength={40}
          returnKeyType="done"
        />

        <Labeled label={t.icon}>
          <EmojiPicker selected={emoji} onSelect={setEmoji} />
        </Labeled>

        {type === 'days_left' && (
          <>
            <View style={styles.dateBlock}>
              <DateField label={t.eventDate} value={targetDate} onChange={setTargetDate} />
              <Chips
                options={QUICK_DATES.map((q) => {
                  const date = addDays(today(), q.amount, q.unit);
                  return { key: q.key, label: t.quickDates[q.key], active: date === targetDate, onPress: () => setTargetDate(date) };
                })}
              />
            </View>
            <Labeled label={t.repeat}>
              <Segmented
                options={REPEATS.map((key) => ({ key, label: t.repeats[key] }))}
                selected={repeat}
                onSelect={chooseRepeat}
              />
            </Labeled>
          </>
        )}
        {type === 'days_passed' && <DateField label={t.startDate} value={startDate} onChange={setStartDate} />}
        {type === 'goal_progress' && (
          <View style={styles.row}>
            <View style={styles.flex}>
              <Field label={t.startValue} value={initialValue} onChangeText={setInitialValue} keyboardType="decimal-pad" placeholder="88" />
            </View>
            {initial && (
              <View style={styles.flex}>
                <Field label={t.currentShort} value={currentValue} onChangeText={setCurrentValue} keyboardType="decimal-pad" />
              </View>
            )}
            <View style={styles.flex}>
              <Field label={t.targetValue} value={targetValue} onChangeText={setTargetValue} keyboardType="decimal-pad" placeholder="80" />
            </View>
          </View>
        )}

        {remindersAvailable && (
          <Labeled label={t.reminder}>
            <Chips
              options={getReminderOptions(type, repeat).map((key) => ({
                key,
                label: t.reminders[key],
                active: key === reminder,
                onPress: () => chooseReminder(key),
              }))}
            />
            {reminder !== 'none' && (
              <View style={styles.row}>
                {reminder === 'custom' && (
                  <View style={styles.flex}>
                    <DateField label={t.reminderDate} value={reminderDate} onChange={setReminderDate} />
                  </View>
                )}
                <View style={styles.flex}>
                  <DateField label={t.reminderTime} value={reminderTime} onChange={setReminderTime} mode="time" />
                </View>
              </View>
            )}
          </Labeled>
        )}

        <Labeled label={t.cardColor}>
          <ColorSwatches<CardColorKey>
            options={CARD_COLOR_KEYS.map((key) => ({ key, color: cardColor(key, scheme), label: t.cardColors[key] }))}
            selected={color as CardColorKey}
            onSelect={setColor}
          />
        </Labeled>

        {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}
        <Button title={initial ? t.save : t.create} icon="check" onPress={save} disabled={saving} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 16, gap: 22 },
  row: { flexDirection: 'row', gap: 10 },
  dateBlock: { gap: 10 },
  error: { fontSize: 14, textAlign: 'center' },
});

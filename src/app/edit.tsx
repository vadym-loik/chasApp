import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../AppProvider';
import { Button } from '../components/Button';
import { CardEditor } from '../components/CardEditor';
import { Chips } from '../components/Chips';
import { DateField } from '../components/DateField';
import { Field } from '../components/Field';
import { FormGroup, FormRow } from '../components/FormGroup';
import { Segmented } from '../components/Segmented';
import {
  COUNTER_TYPE_EMOJI, COUNTER_TYPE_KEYS, DEFAULT_REMINDER_TIME, REPEATS, type CounterItem, type CounterType, type NewCounter,
  type Reminder, type Repeat,
} from '../models/counter';
import { remindersAvailable, requestReminderPermission } from '../services/reminders';
import { addCounter, getCounter, updateCounter } from '../services/storage';
import { CARD_COLOR_KEYS } from '../theme/colors';
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
  const { colors, t } = useApp();
  const insets = useSafeAreaInsets();
  const countdown = initial?.type === 'days_left' ? initial : undefined;
  const since = initial?.type === 'days_passed' ? initial : undefined;
  const goal = initial?.type === 'goal_progress' ? initial : undefined;
  const [type, setType] = useState<CounterType>(initial?.type ?? 'days_left');
  const [title, setTitle] = useState(initial?.title ?? '');
  const [emoji, setEmoji] = useState(initial?.emoji ?? COUNTER_TYPE_EMOJI.days_left);
  const [color, setColor] = useState(initial?.color ?? CARD_COLOR_KEYS[0]);
  const [targetDate, setTargetDate] = useState(countdown?.targetDate ?? addDays(today(), 1, 'month'));
  const [repeat, setRepeat] = useState<Repeat>(countdown?.repeat ?? 'none');
  // A custom reminder that has passed is off: the user must choose a new date.
  const [reminder, setReminder] = useState<Reminder>(
    initial?.reminder === 'custom' && !isFutureCustomReminder(initial) ? 'none' : (initial?.reminder ?? 'none'),
  );
  const [reminderTime, setReminderTime] = useState(initial?.reminderTime ?? DEFAULT_REMINDER_TIME);
  const [reminderDate, setReminderDate] = useState(initial?.reminderDate ?? addDays(today(), 1));
  const [startDate, setStartDate] = useState(since?.startDate ?? today());
  const [initialValue, setInitialValue] = useState(optionalText(goal?.initialValue));
  const [currentValue, setCurrentValue] = useState(optionalText(goal?.currentValue));
  const [targetValue, setTargetValue] = useState(optionalText(goal?.targetValue));
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

  /** The counter from the form. A value that the user did not enter yet gets the start value. */
  function buildDraft(): NewCounter {
    const base = {
      title: title.trim(),
      emoji,
      color,
      reminder,
      reminderTime: reminder === 'none' ? undefined : reminderTime,
      reminderDate: reminder === 'custom' ? reminderDate : undefined,
    };
    switch (type) {
      case 'days_left':
        // Progress starts on the day the counter was created.
        return { ...base, type, targetDate, repeat, startDate: countdown?.startDate ?? today() };
      case 'days_passed':
        return { ...base, type, startDate };
      case 'goal_progress': {
        const start = parseNumber(initialValue) ?? 0;
        const current = initial ? parseNumber(currentValue) : start;
        return { ...base, type, initialValue: start, currentValue: current ?? start, targetValue: parseNumber(targetValue) ?? start };
      }
    }
  }

  /** The error text for the form, or '' if the user can save it. */
  function validate(item: NewCounter): string {
    if (!item.title) return t.errorName;
    if (item.reminder === 'custom' && !isFutureCustomReminder(item)) return t.errorReminderPast;
    if (item.type !== 'goal_progress') return '';
    if (parseNumber(initialValue) === undefined || parseNumber(targetValue) === undefined) return t.errorValues;
    if (item.initialValue === item.targetValue) return t.errorSameValues;
    if (initial && parseNumber(currentValue) === undefined) return t.errorCurrent;
    return '';
  }

  const draft = buildDraft();
  // The card shows the name as the user types it, with spaces.
  const preview: CounterItem = { ...draft, id: 'preview', title };

  async function save() {
    const problem = validate(draft);
    if (problem) {
      setError(problem);
      return;
    }
    setSaving(true);
    try {
      if (initial) await updateCounter({ ...draft, id: initial.id });
      else await addCounter(draft);
      router.back();
    } catch (e) {
      console.warn('Counter save failed', e);
      setError(t.errorSave);
      setSaving(false);
    }
  }

  const reminderRow = remindersAvailable && (
    <FormRow icon="bell" label={t.reminder}>
      <Chips
        options={getReminderOptions(type, repeat).map((key) => ({
          key,
          label: t.reminders[key],
          active: key === reminder,
          onPress: () => chooseReminder(key),
        }))}
      />
      {reminder !== 'none' && (
        <View style={styles.pills}>
          {reminder === 'custom' && <DateField label={t.reminderDate} value={reminderDate} onChange={setReminderDate} />}
          <DateField label={t.reminderTime} value={reminderTime} onChange={setReminderTime} mode="time" />
        </View>
      )}
    </FormRow>
  );

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
      >
        {!initial && (
          <View style={styles.typeBox}>
            <Segmented
              options={COUNTER_TYPE_KEYS.map((key) => ({ key, label: t.types[key].label }))}
              selected={type}
              onSelect={chooseType}
            />
            <Text style={[styles.hint, { color: colors.muted }]}>{t.types[type].description}</Text>
          </View>
        )}

        <CardEditor
          item={preview}
          placeholder={t.types[type].placeholder}
          onChangeTitle={(v) => {
            setTitle(v);
            setError('');
          }}
          onChangeEmoji={setEmoji}
          onChangeColor={setColor}
        />

        {type === 'days_left' && (
          <FormGroup>
            <FormRow
              icon="calendar"
              label={t.eventDate}
              action={<DateField label={t.eventDate} value={targetDate} onChange={setTargetDate} />}
            >
              <Chips
                options={QUICK_DATES.map((q) => {
                  const date = addDays(today(), q.amount, q.unit);
                  return { key: q.key, label: t.quickDates[q.key], active: date === targetDate, onPress: () => setTargetDate(date) };
                })}
              />
            </FormRow>
            <FormRow icon="repeat" label={t.repeat}>
              <Segmented
                options={REPEATS.map((key) => ({ key, label: t.repeats[key] }))}
                selected={repeat}
                onSelect={chooseRepeat}
              />
            </FormRow>
            {reminderRow}
          </FormGroup>
        )}
        {type === 'days_passed' && (
          <FormGroup>
            <FormRow
              icon="calendar"
              label={t.startDate}
              action={<DateField label={t.startDate} value={startDate} onChange={setStartDate} />}
            />
            {reminderRow}
          </FormGroup>
        )}
        {type === 'goal_progress' && (
          <>
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
            <FormGroup>{reminderRow}</FormGroup>
          </>
        )}

        {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}
        <Button title={initial ? t.save : t.create} icon="check" onPress={save} disabled={saving} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 16, gap: 20 },
  row: { flexDirection: 'row', gap: 10 },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeBox: { gap: 8 },
  hint: { fontSize: 13, textAlign: 'center' },
  error: { fontSize: 14, textAlign: 'center' },
});

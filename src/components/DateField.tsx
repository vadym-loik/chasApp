import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import { Platform, Pressable, StyleSheet, Text } from 'react-native';
import { useApp } from '../AppProvider';
import { DATE_FORMAT, TIME_FORMAT } from '../utils/counter';
import { pillStyle } from './Field';
import { Icon } from './Icon';

export interface DateFieldProps {
  label: string; // for screen readers
  value: string; // YYYY-MM-DD, or HH:mm in the time mode
  onChange: (value: string) => void;
  mode?: 'date' | 'time';
}

/** A small date or time button. Android opens the system dialog. iOS shows its compact picker. */
export function DateField({ label, value, onChange, mode = 'date' }: DateFieldProps) {
  const { colors, scheme, t } = useApp();
  const isTime = mode === 'time';
  const date = dayjs(isTime ? `2000-01-01T${value}` : value).toDate();
  const pick = (d: Date) => onChange(dayjs(d).format(isTime ? TIME_FORMAT : DATE_FORMAT));

  if (Platform.OS === 'ios') {
    return (
      <DateTimePicker
        value={date}
        mode={mode}
        display="compact"
        locale={t.pickerLocale}
        accentColor={colors.accent}
        themeVariant={scheme}
        accessibilityLabel={label}
        onValueChange={(_, d) => pick(d)}
      />
    );
  }

  return (
    <Pressable
      onPress={() => DateTimePickerAndroid.open({ value: date, mode, onValueChange: (_, d) => pick(d) })}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.pill, { backgroundColor: colors.track, opacity: pressed ? 0.7 : 1 }]}
    >
      <Icon name={isTime ? 'clock' : 'calendar'} size={16} color={colors.accent} />
      <Text style={[styles.text, { color: colors.text }]}>{isTime ? t.formatTime(value) : t.formatDate(value)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: { ...pillStyle, flexDirection: 'row', alignItems: 'center', gap: 8 },
  text: { fontSize: 15, fontWeight: '600' },
});

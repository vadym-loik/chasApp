import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text } from 'react-native';
import { useApp } from '../AppProvider';
import { DATE_FORMAT, TIME_FORMAT } from '../utils/counter';
import { inputStyle, Labeled } from './Field';
import { Icon } from './Icon';

export interface DateFieldProps {
  label: string;
  value: string; // YYYY-MM-DD, or HH:mm in the time mode
  onChange: (value: string) => void;
  mode?: 'date' | 'time';
}

// Android opens the system date or time dialog. iOS shows a picker under the field.
export function DateField({ label, value, onChange, mode = 'date' }: DateFieldProps) {
  const { colors, scheme, t } = useApp();
  const [open, setOpen] = useState(false);
  const isTime = mode === 'time';
  const date = dayjs(isTime ? `2000-01-01T${value}` : value).toDate();
  const pick = (d: Date) => onChange(dayjs(d).format(isTime ? TIME_FORMAT : DATE_FORMAT));

  function press() {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({ value: date, mode, onValueChange: (_, d) => pick(d) });
    } else {
      setOpen((o) => !o);
    }
  }

  return (
    <Labeled label={label}>
      <Pressable
        onPress={press}
        accessibilityRole="button"
        style={[styles.field, { backgroundColor: colors.surface }]}
      >
        <Icon name={isTime ? 'clock' : 'calendar'} size={20} color={colors.accent} />
        <Text style={[styles.text, { color: colors.text }]}>{isTime ? t.formatTime(value) : t.formatDate(value)}</Text>
      </Pressable>
      {open && Platform.OS === 'ios' && (
        <DateTimePicker
          value={date}
          mode={mode}
          display={isTime ? 'spinner' : 'inline'}
          locale={t.pickerLocale}
          accentColor={colors.accent}
          themeVariant={scheme}
          onValueChange={(_, d) => pick(d)}
        />
      )}
    </Labeled>
  );
}

const styles = StyleSheet.create({
  field: { ...inputStyle, flexDirection: 'row', alignItems: 'center', gap: 10 },
  text: { fontSize: 16 },
});

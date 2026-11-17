import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text } from 'react-native';
import { useApp } from '../AppProvider';
import { DATE_FORMAT } from '../utils/counter';
import { inputStyle, Labeled } from './Field';
import { Icon } from './Icon';

export interface DateFieldProps {
  label: string;
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
}

// Android opens the system date dialog. iOS shows an inline calendar under the field.
export function DateField({ label, value, onChange }: DateFieldProps) {
  const { colors, scheme, t } = useApp();
  const [open, setOpen] = useState(false);
  const date = dayjs(value).toDate();
  const pick = (d: Date) => onChange(dayjs(d).format(DATE_FORMAT));

  function press() {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({ value: date, mode: 'date', onValueChange: (_, d) => pick(d) });
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
        <Icon name="calendar" size={20} color={colors.accent} />
        <Text style={[styles.text, { color: colors.text }]}>{t.formatDate(value)}</Text>
      </Pressable>
      {open && Platform.OS === 'ios' && (
        <DateTimePicker
          value={date}
          mode="date"
          display="inline"
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

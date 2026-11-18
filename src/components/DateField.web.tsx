import { useApp } from '../AppProvider';
import { isValidDate, isValidTime } from '../utils/counter';
import type { DateFieldProps } from './DateField';
import { inputStyle, Labeled } from './Field';

// The native picker does not support web, so use the browser date or time input.
export function DateField({ label, value, onChange, mode = 'date' }: DateFieldProps) {
  const isValid = mode === 'time' ? isValidTime : isValidDate;
  const { colors, scheme } = useApp();
  return (
    <Labeled label={label}>
      <input
        type={mode}
        value={value}
        onChange={(e) => isValid(e.target.value) && onChange(e.target.value)}
        style={{
          borderRadius: inputStyle.borderRadius,
          padding: `${inputStyle.paddingVertical}px ${inputStyle.paddingHorizontal}px`,
          fontSize: inputStyle.fontSize,
          border: 'none',
          fontFamily: 'inherit',
          backgroundColor: colors.surface,
          color: colors.text,
          colorScheme: scheme,
        }}
      />
    </Labeled>
  );
}

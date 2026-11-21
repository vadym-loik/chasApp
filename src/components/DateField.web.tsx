import { useApp } from '../AppProvider';
import { isValidDate, isValidTime } from '../utils/counter';
import type { DateFieldProps } from './DateField';
import { pillStyle } from './Field';

// The native picker does not support web, so use the browser date or time input.
export function DateField({ label, value, onChange, mode = 'date' }: DateFieldProps) {
  const isValid = mode === 'time' ? isValidTime : isValidDate;
  const { colors, scheme } = useApp();
  return (
    <input
      type={mode}
      aria-label={label}
      value={value}
      onChange={(e) => isValid(e.target.value) && onChange(e.target.value)}
      style={{
        borderRadius: pillStyle.borderRadius,
        padding: `${pillStyle.paddingVertical}px ${pillStyle.paddingHorizontal}px`,
        fontSize: 15,
        fontWeight: 600,
        border: 'none',
        fontFamily: 'inherit',
        backgroundColor: colors.track,
        color: colors.text,
        colorScheme: scheme,
      }}
    />
  );
}

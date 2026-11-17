import { useApp } from '../AppProvider';
import { isValidDate } from '../utils/counter';
import type { DateFieldProps } from './DateField';
import { inputStyle, Labeled } from './Field';

// The native date picker does not support web, so use the browser date input.
export function DateField({ label, value, onChange }: DateFieldProps) {
  const { colors, scheme } = useApp();
  return (
    <Labeled label={label}>
      <input
        type="date"
        value={value}
        onChange={(e) => isValidDate(e.target.value) && onChange(e.target.value)}
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

import type { ReactNode } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { useApp } from '../AppProvider';

/** A label above any form control. */
export function Labeled({ label, children }: { label: string; children: ReactNode }) {
  const { colors } = useApp();
  return (
    <View style={styles.box}>
      <Text style={[styles.label, { color: colors.muted }]}>{label}</Text>
      {children}
    </View>
  );
}

export function Field({ label, style, ...input }: { label: string } & TextInputProps) {
  const { colors } = useApp();
  return (
    <Labeled label={label}>
      <TextInput
        placeholderTextColor={colors.muted}
        selectionColor={colors.accent}
        style={[styles.input, { backgroundColor: colors.surface, color: colors.text }, style]}
        {...input}
      />
    </Labeled>
  );
}

const inputStyle = { borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16 };
/** A small button inside a form row, for example a date. */
export const pillStyle = { borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 };

const styles = StyleSheet.create({
  box: { gap: 8 },
  label: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  input: inputStyle,
});

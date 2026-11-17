import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { COLORS } from '../theme';

export function Field({ label, ...input }: { label: string } & TextInputProps) {
  return (
    <View style={styles.box}>
      <Text style={styles.label}>{label}</Text>
      <TextInput placeholderTextColor={COLORS.muted} style={styles.input} {...input} />
    </View>
  );
}

const styles = StyleSheet.create({
  box: { gap: 6 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.muted },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.text,
  },
});

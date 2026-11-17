import { Pressable, StyleSheet, Text } from 'react-native';
import { COLORS } from '../theme';

interface Props {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}

export function Button({ title, onPress, variant = 'primary' }: Props) {
  const primary = variant === 'primary';
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        primary ? styles.primary : styles.secondary,
        pressed && { opacity: 0.7 },
      ]}
    >
      <Text style={[styles.text, primary && { color: COLORS.surface }, variant === 'danger' && { color: COLORS.danger }]}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  primary: { backgroundColor: COLORS.accent },
  secondary: { backgroundColor: COLORS.surface },
  text: { fontSize: 16, fontWeight: '600', color: COLORS.text },
});

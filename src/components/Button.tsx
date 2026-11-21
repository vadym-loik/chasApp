import { Pressable, StyleSheet, Text } from 'react-native';
import { useApp } from '../AppProvider';
import { Icon, type IconName } from './Icon';

interface Props {
  title: string;
  onPress: () => void;
  icon?: IconName;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
}

export function Button({ title, onPress, icon, variant = 'primary', disabled }: Props) {
  const { colors, comic, spider } = useApp();
  const background = variant === 'primary' ? colors.accent : colors.surface;
  const foreground = variant === 'primary' ? '#FFFFFF' : variant === 'danger' ? colors.danger : colors.text;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: background, opacity: disabled ? 0.4 : pressed && !spider ? 0.75 : 1 },
        comic.frame,
        // In the Spider-Verse look, a pressed button moves onto its shadow, like a pressed comic panel.
        spider && pressed && styles.pressedComic,
      ]}
    >
      {icon && <Icon name={icon} size={20} color={foreground} />}
      <Text style={[styles.text, { color: foreground }, comic.heading]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    gap: 8,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { fontSize: 16, fontWeight: '600' },
  pressedComic: { transform: [{ translateX: 3 }, { translateY: 3 }], boxShadow: 'none' },
});

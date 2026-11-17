import { Pressable } from 'react-native';
import { useApp } from '../AppProvider';
import { Icon, type IconName } from './Icon';

export function HeaderButton({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  const { colors } = useApp();
  return (
    <Pressable onPress={onPress} hitSlop={12} accessibilityRole="button" accessibilityLabel={label}>
      <Icon name={icon} size={22} color={colors.accent} />
    </Pressable>
  );
}

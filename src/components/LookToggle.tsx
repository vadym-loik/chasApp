import { Pressable, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useApp } from '../AppProvider';
import { Icon } from './Icon';

/** A small round button that switches between the classic look and the Spider-Verse look. */
export function LookToggle() {
  const { colors, comic, spider, setSettings, t } = useApp();
  const turn = useSharedValue(0);
  const spin = useAnimatedStyle(() => ({ transform: [{ rotate: `${turn.value}deg` }] }));

  function toggle() {
    turn.value = withSpring(turn.value + 360, { damping: 12 });
    setSettings({ look: spider ? 'classic' : 'spider' });
  }

  return (
    <Pressable
      onPress={toggle}
      hitSlop={8}
      accessibilityRole="switch"
      accessibilityLabel={t.spiderLook}
      accessibilityState={{ checked: spider }}
      style={[styles.button, { backgroundColor: spider ? colors.accent : colors.surface }, comic.frame]}
    >
      <Animated.View style={spin}>
        <Icon name="spider" size={22} color={spider ? '#FFFFFF' : colors.accent} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
});

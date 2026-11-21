import { useEffect } from 'react';
import { StyleSheet, Text, View, type TextProps } from 'react-native';
import Animated, {
  useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming,
} from 'react-native-reanimated';
import { GLITCH } from '../theme/spider';

const STEP = { duration: 50 };

/** A short shake of the color layers. */
function jitter() {
  return withSequence(withTiming(6, STEP), withTiming(-4, STEP), withTiming(3, STEP), withTiming(0, STEP));
}

/**
 * Text with the Spider-Verse glitch: a magenta copy and a cyan copy sit behind the text, a little to the side.
 * The copies shake when the text shows, and again every few seconds.
 * The system setting "reduce motion" stops the shake (Reanimated follows it by default).
 */
export function GlitchText({ style, children, ...props }: TextProps) {
  const shift = useSharedValue(0);

  useEffect(() => {
    shift.value = withSequence(jitter(), withRepeat(withDelay(3500, jitter()), -1));
  }, [shift]);

  const magenta = useAnimatedStyle(() => ({ transform: [{ translateX: -2 - shift.value }] }));
  const cyan = useAnimatedStyle(() => ({ transform: [{ translateX: 2 + shift.value }, { translateY: shift.value / 3 }] }));

  return (
    <View>
      {/* The copies are only decoration, so screen readers skip them. */}
      <Animated.Text {...props} aria-hidden style={[style, styles.layer, { color: GLITCH.magenta }, magenta]}>
        {children}
      </Animated.Text>
      <Animated.Text {...props} aria-hidden style={[style, styles.layer, { color: GLITCH.cyan }, cyan]}>
        {children}
      </Animated.Text>
      <Text {...props} style={style}>
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  layer: { position: 'absolute', top: 0, left: 0, right: 0 },
});

import { useEffect, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { useApp } from '../AppProvider';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface Props {
  progress: number; // 0..1
  size: number;
  stroke: number;
  children?: ReactNode; // content in the center
}

/** A ring that fills clockwise from the top, like the app logo. */
export function ProgressRing({ progress, size, stroke, children }: Props) {
  const { colors, spider } = useApp();
  const radius = (size - stroke) / 2;
  const length = 2 * Math.PI * radius;
  const center = size / 2;
  // In the Spider-Verse look, the ring fills from zero. In the classic look, it does not move.
  const fill = useSharedValue(spider ? 0 : progress);

  useEffect(() => {
    fill.value = spider ? withTiming(progress, { duration: 900, easing: Easing.out(Easing.cubic) }) : progress;
  }, [fill, progress, spider]);

  const ring = useAnimatedProps(() => ({ strokeDashoffset: length * (1 - fill.value) }));

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle cx={center} cy={center} r={radius} stroke={colors.track} strokeWidth={stroke} fill="none" />
        <AnimatedCircle
          cx={center}
          cy={center}
          r={radius}
          stroke={colors.accent}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${length} ${length}`}
          animatedProps={ring}
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>
      <View style={styles.center}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, alignItems: 'center', justifyContent: 'center' },
});

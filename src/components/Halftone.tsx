import { useId, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, Pattern, Rect } from 'react-native-svg';

interface Props {
  color: string;
  /** The corner radius of the parent, so the dots stay inside the rounded corners. */
  radius?: number;
  opacity?: number;
}

/** A comic halftone dot pattern that fills the parent view. Put it first in the parent. */
export function Halftone({ color, radius = 0, opacity = 0.18 }: Props) {
  // Each pattern needs its own id. React ids can have characters that SVG urls do not accept.
  const id = `dots${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  // On Android, an Svg with a size of 100% stops at 300×150 inside some parents. So measure the real size.
  const [size, setSize] = useState({ width: 0, height: 0 });

  return (
    <View
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
      onLayout={(e) => setSize({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })}
    >
      {size.width > 0 && (
        <Svg width={size.width} height={size.height}>
          <Defs>
            <Pattern id={id} width={9} height={9} patternUnits="userSpaceOnUse">
              <Circle cx={4.5} cy={4.5} r={1.7} fill={color} />
            </Pattern>
          </Defs>
          <Rect width={size.width} height={size.height} rx={radius} fill={`url(#${id})`} opacity={opacity} />
        </Svg>
      )}
    </View>
  );
}

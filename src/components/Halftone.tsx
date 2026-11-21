import { useId } from 'react';
import { StyleSheet } from 'react-native';
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
  return (
    <Svg width="100%" height="100%" style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <Pattern id={id} width={9} height={9} patternUnits="userSpaceOnUse">
          <Circle cx={4.5} cy={4.5} r={1.7} fill={color} />
        </Pattern>
      </Defs>
      <Rect width="100%" height="100%" rx={radius} fill={`url(#${id})`} opacity={opacity} />
    </Svg>
  );
}


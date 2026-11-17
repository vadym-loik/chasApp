import { Pressable, StyleSheet, View } from 'react-native';
import { useApp } from '../AppProvider';
import { Icon } from './Icon';

interface Props<K extends string> {
  options: { key: K; color: string; label: string }[];
  selected: K;
  onSelect: (key: K) => void;
}

export function ColorSwatches<K extends string>({ options, selected, onSelect }: Props<K>) {
  const { colors } = useApp();
  return (
    <View style={styles.row}>
      {options.map((o) => {
        const active = o.key === selected;
        return (
          <Pressable
            key={o.key}
            onPress={() => onSelect(o.key)}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
            accessibilityLabel={o.label}
            hitSlop={4}
            style={[styles.ring, { borderColor: active ? colors.text : 'transparent' }]}
          >
            <View style={[styles.swatch, { backgroundColor: o.color }]}>
              {active && <Icon name="check" size={20} color={colors.text} />}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  ring: { borderWidth: 2, borderRadius: 26, padding: 3 },
  swatch: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
});

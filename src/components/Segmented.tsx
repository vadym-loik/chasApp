import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useApp } from '../AppProvider';

interface Props<K extends string> {
  options: { key: K; label: string }[];
  selected: K;
  onSelect: (key: K) => void;
}

export function Segmented<K extends string>({ options, selected, onSelect }: Props<K>) {
  const { colors, comic } = useApp();
  return (
    <View style={[styles.box, { backgroundColor: colors.track }, comic.outline]}>
      {options.map((o) => {
        const active = o.key === selected;
        return (
          <Pressable
            key={o.key}
            onPress={() => onSelect(o.key)}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
            style={[styles.item, active && { backgroundColor: colors.surface }]}
          >
            <Text style={[styles.text, { color: active ? colors.text : colors.muted }, active && comic.heading]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { flexDirection: 'row', borderRadius: 14, padding: 4 },
  item: { flex: 1, paddingVertical: 10, borderRadius: 11, alignItems: 'center' },
  text: { fontSize: 14, fontWeight: '600' },
});

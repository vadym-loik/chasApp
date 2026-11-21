import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useApp } from '../AppProvider';

interface Props {
  options: { key: string; label: string; active: boolean; onPress: () => void }[];
}

/** Small round buttons for quick choices. */
export function Chips({ options }: Props) {
  const { colors, comic } = useApp();
  return (
    <View style={styles.row}>
      {options.map((o) => (
        <Pressable
          key={o.key}
          onPress={o.onPress}
          accessibilityRole="button"
          accessibilityState={{ selected: o.active }}
          style={[styles.chip, { backgroundColor: o.active ? colors.accent : colors.track }, comic.outline]}
        >
          <Text style={[styles.text, { color: o.active ? '#FFFFFF' : colors.text }]}>{o.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 8 },
  text: { fontSize: 14, fontWeight: '600' },
});

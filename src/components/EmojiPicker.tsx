import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { useApp } from '../AppProvider';

const EMOJIS = [
  '⭐', '🎯', '✈️', '🏖️', '🎂', '🎄', '💍', '🎓', '🏃', '💪', '🧘', '🚭',
  '🍬', '🍷', '📚', '💼', '💰', '🏠', '❤️', '👶', '🐶', '🌱', '🎮', '🎵',
];

export function EmojiPicker({ selected, onSelect }: { selected: string; onSelect: (e: string) => void }) {
  const { colors } = useApp();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {EMOJIS.map((e) => (
        <Pressable
          key={e}
          onPress={() => onSelect(e)}
          accessibilityRole="radio"
          accessibilityState={{ selected: e === selected }}
          style={[
            styles.item,
            { backgroundColor: colors.surface, borderColor: e === selected ? colors.accent : 'transparent' },
          ]}
        >
          <Text style={styles.emoji}>{e}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: 8 },
  item: { width: 52, height: 52, borderRadius: 16, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 26 },
});

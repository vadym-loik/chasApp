import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useApp } from '../AppProvider';
import { Icon } from './Icon';

interface Props {
  emoji: string;
  title: string;
  description?: string;
  active: boolean;
  onPress: () => void;
}

/** One choice in a list of options, like a radio button. */
export function OptionRow({ emoji, title, description, active, onPress }: Props) {
  const { colors } = useApp();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected: active }}
      style={[styles.option, { backgroundColor: colors.surface, borderColor: active ? colors.accent : 'transparent' }]}
    >
      <Text style={styles.emoji}>{emoji}</Text>
      <View style={styles.text}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        {description ? <Text style={[styles.description, { color: colors.muted }]}>{description}</Text> : null}
      </View>
      {active && <Icon name="check" size={22} color={colors.accent} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  option: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: 16, borderWidth: 2 },
  emoji: { fontSize: 24 },
  text: { flex: 1 },
  title: { fontSize: 16, fontWeight: '600' },
  description: { fontSize: 13, marginTop: 2 },
});

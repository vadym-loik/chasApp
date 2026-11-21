import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useApp } from '../AppProvider';
import type { CounterItem } from '../models/counter';
import { CARD_COLOR_KEYS, type CardColorKey } from '../theme/colors';
import { getCounterDetails, getCounterStats } from '../utils/counter';
import { ColorSwatches } from './ColorSwatches';
import { EmojiPicker } from './EmojiPicker';
import { ProgressBar } from './ProgressBar';

interface Props {
  item: CounterItem;
  placeholder: string;
  onChangeTitle: (title: string) => void;
  onChangeEmoji: (emoji: string) => void;
  onChangeColor: (color: string) => void;
}

/**
 * The counter card as the user will see it, but the name is a text field and the icon is a button.
 * The icon list opens under the card. The card colors are always under the card.
 */
export function CardEditor({ item, placeholder, onChangeTitle, onChangeEmoji, onChangeColor }: Props) {
  const { colors, cardColor, comic, t } = useApp();
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const stats = getCounterStats(item, t);
  return (
    <View style={styles.box}>
      <View style={[styles.card, { backgroundColor: cardColor(item.color) }, comic.frame]}>
        <View style={styles.row}>
          <Pressable
            onPress={() => setEmojiOpen((open) => !open)}
            accessibilityRole="button"
            accessibilityLabel={t.icon}
            accessibilityState={{ expanded: emojiOpen }}
            style={[styles.emojiButton, { backgroundColor: colors.track, borderColor: emojiOpen ? colors.accent : 'transparent' }]}
          >
            <Text style={styles.emoji}>{item.emoji}</Text>
          </Pressable>
          <View style={styles.titleBox}>
            <TextInput
              value={item.title}
              onChangeText={onChangeTitle}
              placeholder={placeholder}
              placeholderTextColor={colors.muted}
              selectionColor={colors.accent}
              accessibilityLabel={t.name}
              maxLength={40}
              returnKeyType="done"
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              style={[styles.title, { color: colors.text, borderColor: focused ? colors.accent : colors.track }, comic.heading]}
            />
            <Text style={[styles.details, { color: colors.muted }]} numberOfLines={2}>
              {getCounterDetails(item, t)}
            </Text>
          </View>
          <View style={styles.valueBox}>
            <Text style={[styles.value, { color: colors.text }, comic.heading]}>{stats.value}</Text>
            <Text style={[styles.label, { color: colors.muted }]}>{stats.label}</Text>
          </View>
        </View>
        {stats.progress !== undefined && <ProgressBar progress={stats.progress} height={6} />}
      </View>

      {emojiOpen && <EmojiPicker selected={item.emoji} onSelect={onChangeEmoji} />}

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <ColorSwatches<CardColorKey>
          options={CARD_COLOR_KEYS.map((key) => ({ key, color: cardColor(key), label: t.cardColors[key] }))}
          selected={item.color as CardColorKey}
          onSelect={onChangeColor}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { gap: 12 },
  card: { borderRadius: 24, padding: 18, gap: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  emojiButton: { width: 56, height: 56, borderRadius: 18, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 30 },
  titleBox: { flex: 1, gap: 4 },
  title: { fontSize: 17, fontWeight: '600', paddingVertical: 4, paddingHorizontal: 0, borderBottomWidth: 2 },
  details: { fontSize: 13 },
  valueBox: { alignItems: 'flex-end', maxWidth: '35%' },
  value: { fontSize: 30, fontWeight: '800', fontVariant: ['tabular-nums'] },
  label: { fontSize: 12, textAlign: 'right' },
});

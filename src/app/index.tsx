import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { Image, Pressable, SectionList, StyleSheet, Text, View } from 'react-native';
import Animated, { BounceIn, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../AppProvider';
import { Button } from '../components/Button';
import { GlitchText } from '../components/GlitchText';
import { Halftone } from '../components/Halftone';
import { Icon } from '../components/Icon';
import { LookToggle } from '../components/LookToggle';
import { SwipeableCounterCard } from '../components/SwipeableCounterCard';
import { YearCard } from '../components/YearCard';
import { useReload } from '../hooks/useReload';
import type { CounterItem } from '../models/counter';
import { getCounters } from '../services/storage';
import { groupCounters, today } from '../utils/counter';

const openCreate = () => router.push('/edit');

export default function HomeScreen() {
  const { colors, comic, spider, t } = useApp();
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<CounterItem[] | null>(null);
  const [now, setNow] = useState(today());

  const load = useCallback(() => {
    setNow(today());
    getCounters().then(setItems);
  }, []);

  // Reload on focus and on resume, so new counters and a new day show up.
  useReload(load);

  return (
    <View style={styles.screen}>
      {spider && <Halftone color={colors.text} opacity={0.07} />}
      <SectionList
        sections={items ? groupCounters(items, now) : []}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={[styles.list, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 96 }]}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <View style={styles.flex}>
                <Text style={[styles.date, { color: colors.muted }]}>{t.formatLongDay(now)}</Text>
                {spider ? (
                  <GlitchText style={[styles.appTitle, { color: colors.text }, comic.heading]}>Chas</GlitchText>
                ) : (
                  <Text style={[styles.appTitle, { color: colors.text }]}>Chas</Text>
                )}
              </View>
              <LookToggle />
              <Pressable
                onPress={() => router.push('/settings')}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={t.settings}
                style={[styles.iconButton, { backgroundColor: colors.surface }, comic.frame]}
              >
                <Icon name="settings" size={20} color={colors.accent} />
              </Pressable>
            </View>
            <YearCard now={now} />
          </View>
        }
        renderSectionHeader={({ section }) => (
          <Text style={[styles.sectionTitle, { color: colors.muted }, spider && [styles.caption, comic.outline]]}>
            {t.sections[section.key]} · {section.data.length}
          </Text>
        )}
        renderItem={({ item, index }) => (
          // In the Spider-Verse look, the cards pop in one after another.
          <Animated.View style={styles.item} entering={spider ? ZoomIn.springify().delay(index * 70) : undefined}>
            <SwipeableCounterCard item={item} onDeleted={load} />
          </Animated.View>
        )}
        ListEmptyComponent={items ? <EmptyState /> : undefined}
      />
      {/* The status bar is see-through, so this bar keeps the list from scrolling under the clock. */}
      <View style={[styles.statusBar, { height: insets.top, backgroundColor: colors.background }]} />
      {items && items.length > 0 && (
        // The key makes the button bounce in again when the user turns on the Spider-Verse look.
        <Animated.View
          key={spider ? 'spider' : 'classic'}
          entering={spider ? BounceIn.delay(300) : undefined}
          style={[styles.fabBox, { bottom: insets.bottom + 20 }]}
        >
          <Pressable
            onPress={openCreate}
            accessibilityRole="button"
            accessibilityLabel={t.newCounter}
            style={({ pressed }) => [
              styles.fab,
              { backgroundColor: colors.accent, opacity: pressed ? 0.85 : 1 },
              comic.frame,
            ]}
          >
            <Icon name="plus" size={28} color="#FFFFFF" />
          </Pressable>
        </Animated.View>
      )}
    </View>
  );
}

function EmptyState() {
  const { colors, t } = useApp();
  return (
    <View style={styles.empty}>
      <Image source={require('../../assets/icon.png')} style={styles.logo} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>{t.emptyTitle}</Text>
      <Text style={[styles.emptyText, { color: colors.muted }]}>{t.emptyText}</Text>
      <View style={styles.emptyButton}>
        <Button title={t.createCounter} icon="plus" onPress={openCreate} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  flex: { flex: 1 },
  list: { paddingHorizontal: 16 },
  header: { gap: 20, marginBottom: 4 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  date: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8 },
  appTitle: { fontSize: 34, fontWeight: '800', marginTop: 2 },
  iconButton: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 24,
    marginBottom: 10,
  },
  // A comic caption box: yellow, tilted a little.
  caption: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFD600',
    color: '#111111',
    fontStyle: 'italic',
    fontWeight: '900',
    paddingHorizontal: 10,
    paddingVertical: 4,
    transform: [{ rotate: '-2deg' }],
  },
  item: { marginBottom: 12 },
  statusBar: { position: 'absolute', top: 0, left: 0, right: 0 },
  fabBox: { position: 'absolute', right: 20 },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  empty: { alignItems: 'center', marginTop: 32, paddingHorizontal: 16, gap: 12 },
  logo: { width: 72, height: 72, borderRadius: 18, marginBottom: 4 },
  emptyTitle: { fontSize: 22, fontWeight: '700' },
  emptyText: { fontSize: 15, lineHeight: 22, textAlign: 'center' },
  emptyButton: { alignSelf: 'stretch', marginTop: 12 },
});

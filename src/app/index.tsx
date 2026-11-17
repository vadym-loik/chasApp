import { router, Stack, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { CounterCard } from '../components/CounterCard';
import { HeaderButton } from '../components/HeaderButton';
import { Icon } from '../components/Icon';
import type { CounterItem } from '../models/counter';
import { getCounters } from '../services/storage';
import { useApp } from '../AppProvider';

const openCreate = () => router.push('/edit');

export default function HomeScreen() {
  const { colors, t } = useApp();
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<CounterItem[] | null>(null);

  useFocusEffect(
    useCallback(() => {
      getCounters().then(setItems);
    }, []),
  );

  return (
    <View style={styles.screen}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <HeaderButton icon="settings" label={t.settings} onPress={() => router.push('/settings')} />
          ),
        }}
      />
      <FlatList
        data={items ?? []}
        keyExtractor={(item) => item.id}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 96 }]}
        renderItem={({ item }) => <CounterCard item={item} onPress={() => router.push(`/${item.id}`)} />}
        ListEmptyComponent={items ? <EmptyState /> : undefined}
      />
      {items && items.length > 0 && (
        <Pressable
          onPress={openCreate}
          accessibilityRole="button"
          accessibilityLabel={t.newCounter}
          style={({ pressed }) => [
            styles.fab,
            { backgroundColor: colors.accent, bottom: insets.bottom + 20, opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <Icon name="plus" size={28} color="#FFFFFF" />
        </Pressable>
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
      <Text style={[styles.emptyText, { color: colors.muted }]}>
        {t.emptyText}
      </Text>
      <View style={styles.emptyButton}>
        <Button title={t.createCounter} icon="plus" onPress={openCreate} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  list: { padding: 16, gap: 12 },
  fab: {
    position: 'absolute',
    right: 20,
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
  empty: { alignItems: 'center', marginTop: 48, paddingHorizontal: 24, gap: 12 },
  logo: { width: 96, height: 96, borderRadius: 24, marginBottom: 8 },
  emptyTitle: { fontSize: 22, fontWeight: '700' },
  emptyText: { fontSize: 15, lineHeight: 22, textAlign: 'center' },
  emptyButton: { alignSelf: 'stretch', marginTop: 12 },
});

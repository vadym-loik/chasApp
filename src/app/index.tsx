import { Link, router, Stack, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/Button';
import { CounterCard } from '../components/CounterCard';
import type { CounterItem } from '../models/counter';
import { getCounters } from '../services/storage';
import { COLORS } from '../theme';

export default function HomeScreen() {
  const [items, setItems] = useState<CounterItem[]>([]);

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
            <Link href="/settings" asChild>
              <Pressable hitSlop={12}>
                <Text style={styles.headerIcon}>⚙️</Text>
              </Pressable>
            </Link>
          ),
        }}
      />
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <CounterCard item={item} onPress={() => router.push(`/${item.id}`)} />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🌱</Text>
            <Text style={styles.emptyText}>No counters yet. Create your first one.</Text>
          </View>
        }
      />
      <View style={styles.footer}>
        <Button title="+ New counter" onPress={() => router.push('/create')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  list: { padding: 16, gap: 12 },
  headerIcon: { fontSize: 22 },
  empty: { alignItems: 'center', marginTop: 80, gap: 12 },
  emptyEmoji: { fontSize: 48 },
  emptyText: { fontSize: 16, color: COLORS.muted },
  footer: { padding: 16, paddingBottom: 32 },
});

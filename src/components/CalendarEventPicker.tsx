import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../AppProvider';
import { getUpcomingEvents } from '../services/calendar';
import type { CalendarEventOption } from '../utils/calendar';

interface Props {
  onSelect: (event: CalendarEventOption) => void;
  onClose: () => void;
}

/** A full screen list of the next calendar events. It loads the events when it opens. */
export function CalendarEventPicker({ onSelect, onClose }: Props) {
  const { colors, t } = useApp();
  const insets = useSafeAreaInsets();
  const [events, setEvents] = useState<CalendarEventOption[]>();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    getUpcomingEvents()
      .then((list) => active && setEvents(list))
      .catch((error: unknown) => {
        console.warn('Calendar read failed', error);
        if (active) setFailed(true);
      });
    return () => {
      active = false;
    };
  }, []);

  let message = '';
  if (failed) message = t.calendarFailed;
  else if (events?.length === 0) message = t.calendarEmpty;

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>{t.calendarTitle}</Text>
          <Pressable onPress={onClose} accessibilityRole="button" hitSlop={8}>
            <Text style={[styles.cancel, { color: colors.accent }]}>{t.cancel}</Text>
          </Pressable>
        </View>
        {!events && !failed && <ActivityIndicator style={styles.message} color={colors.accent} />}
        {message ? <Text style={[styles.message, { color: colors.muted }]}>{message}</Text> : null}
        <FlatList
          data={events}
          keyExtractor={(e) => e.id}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 16 }]}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => onSelect(item)}
              accessibilityRole="button"
              style={({ pressed }) => [styles.row, { backgroundColor: colors.surface, opacity: pressed ? 0.7 : 1 }]}
            >
              <Text style={[styles.name, { color: colors.text }]} numberOfLines={2}>{item.title}</Text>
              <Text style={[styles.date, { color: colors.muted }]}>
                {t.formatDate(item.date)}
                {item.repeat !== 'none' ? ` · ${t.repeats[item.repeat]}` : ''}
              </Text>
            </Pressable>
          )}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
  title: { flex: 1, fontSize: 20, fontWeight: '700' },
  cancel: { fontSize: 16, fontWeight: '600' },
  message: { padding: 24, fontSize: 15, textAlign: 'center' },
  list: { paddingHorizontal: 16, gap: 8 },
  row: { borderRadius: 16, padding: 14, gap: 2 },
  name: { fontSize: 16, fontWeight: '600' },
  date: { fontSize: 13 },
});

import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { WidgetConfigurationScreenProps } from 'react-native-android-widget';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppProvider, useApp } from '../AppProvider';
import { Button } from '../components/Button';
import { OptionRow } from '../components/OptionRow';
import type { CounterItem } from '../models/counter';
import { getCounters, getWidgetCounterId, setWidgetCounterId } from '../services/storage';
import { getCounterStats, statsText } from '../utils/counter';
import { renderWidget } from './render';

/** Android opens this screen when the user adds or reconfigures the counter widget. */
export function WidgetConfigScreen(props: WidgetConfigurationScreenProps) {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <ChooseCounter {...props} />
      </AppProvider>
    </SafeAreaProvider>
  );
}

function ChooseCounter({ widgetInfo, renderWidget: draw, setResult }: WidgetConfigurationScreenProps) {
  const { colors, scheme, t } = useApp();
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<CounterItem[] | null>(null);
  const [selected, setSelected] = useState<string>();

  useEffect(() => {
    getCounters().then(setItems);
    getWidgetCounterId(widgetInfo.widgetId).then(setSelected);
  }, [widgetInfo.widgetId]);

  async function choose(id: string) {
    await setWidgetCounterId(widgetInfo.widgetId, id);
    draw(await renderWidget(widgetInfo));
    setResult('ok');
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top + 16 }]}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Text style={[styles.title, { color: colors.text }]}>{t.widgetChooseCounter}</Text>
      <ScrollView contentContainerStyle={styles.list}>
        {items?.length === 0 && <Text style={[styles.empty, { color: colors.muted }]}>{t.widgetNoCounters}</Text>}
        {items?.map((item) => (
          <OptionRow
            key={item.id}
            emoji={item.emoji}
            title={item.title}
            description={statsText(getCounterStats(item, t))}
            active={item.id === selected}
            onPress={() => choose(item.id)}
          />
        ))}
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Button title={t.cancel} variant="secondary" onPress={() => setResult('cancel')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  title: { fontSize: 22, fontWeight: '700', paddingHorizontal: 16, marginBottom: 12 },
  list: { padding: 16, gap: 10 },
  empty: { fontSize: 15, lineHeight: 22, textAlign: 'center', marginTop: 24 },
  footer: { paddingHorizontal: 16 },
});

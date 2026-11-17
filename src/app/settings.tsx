import Constants from 'expo-constants';
import { Image, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useApp } from '../AppProvider';
import { Button } from '../components/Button';
import { ColorSwatches } from '../components/ColorSwatches';
import { Labeled } from '../components/Field';
import { OptionRow } from '../components/OptionRow';
import { Segmented } from '../components/Segmented';
import { LANGUAGES } from '../i18n/strings';
import type { ThemeMode } from '../models/settings';
import { ACCENT_KEYS, ACCENTS } from '../theme/colors';
import { pinWidget, WIDGET_NAMES, widgetsAvailable } from '../widgets';

const DONATE_URL = 'https://www.buymeacoffee.com/';
const MODES: ThemeMode[] = ['system', 'light', 'dark'];

export default function SettingsScreen() {
  const { colors, settings, setSettings, t } = useApp();
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.about}>
        <Image source={require('../../assets/icon.png')} style={styles.logo} />
        <Text style={[styles.appName, { color: colors.text }]}>Chas</Text>
        <Text style={[styles.muted, { color: colors.muted }]}>
          {t.version(Constants.expoConfig?.version ?? '')}
        </Text>
      </View>

      <Labeled label={t.language}>
        <OptionRow
          emoji="🌐"
          title={t.systemLanguage}
          active={settings.language === 'system'}
          onPress={() => setSettings({ language: 'system' })}
        />
        {LANGUAGES.map((l) => (
          <OptionRow
            key={l.key}
            emoji={l.flag}
            title={l.label}
            active={settings.language === l.key}
            onPress={() => setSettings({ language: l.key })}
          />
        ))}
      </Labeled>

      <Labeled label={t.theme}>
        <Segmented
          options={MODES.map((key) => ({ key, label: t.themeModes[key] }))}
          selected={settings.mode}
          onSelect={(mode) => setSettings({ mode })}
        />
      </Labeled>

      <Labeled label={`${t.accent} · ${t.accents[settings.accent]}`}>
        <ColorSwatches
          options={ACCENT_KEYS.map((key) => ({ key, color: ACCENTS[key], label: t.accents[key] }))}
          selected={settings.accent}
          onSelect={(accent) => setSettings({ accent })}
        />
      </Labeled>

      {widgetsAvailable && (
        <Labeled label={t.widgets}>
          <Text style={[styles.cardText, { color: colors.muted }]}>{t.widgetsHint}</Text>
          <Button title={t.addYearWidget} icon="plus" variant="secondary" onPress={() => pinWidget(WIDGET_NAMES.year)} />
          <Button title={t.addCounterWidget} icon="plus" variant="secondary" onPress={() => pinWidget(WIDGET_NAMES.counter)} />
        </Labeled>
      )}

      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>{t.supportTitle}</Text>
        <Text style={[styles.cardText, { color: colors.muted }]}>{t.supportText}</Text>
        <Button title="Buy Me a Coffee" onPress={() => Linking.openURL(DONATE_URL)} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 28 },
  about: { alignItems: 'center', gap: 4, marginTop: 8 },
  logo: { width: 80, height: 80, borderRadius: 20, marginBottom: 8 },
  appName: { fontSize: 24, fontWeight: '800' },
  muted: { fontSize: 13 },
  card: { borderRadius: 20, padding: 20, gap: 12 },
  cardTitle: { fontSize: 17, fontWeight: '700' },
  cardText: { fontSize: 15, lineHeight: 21 },
});

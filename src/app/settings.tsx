import Constants from 'expo-constants';
import { Alert, Image, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../AppProvider';
import { Button } from '../components/Button';
import { Chips } from '../components/Chips';
import { ColorSwatches } from '../components/ColorSwatches';
import { Labeled } from '../components/Field';
import { ActionRow, FormGroup, FormRow } from '../components/FormGroup';
import { Segmented } from '../components/Segmented';
import { LANGUAGES } from '../i18n/strings';
import { THEME_MODES } from '../models/settings';
import { backupAvailable, exportBackup, pickBackup } from '../services/backup';
import { importCounters } from '../services/storage';
import { ACCENT_KEYS, ACCENTS } from '../theme/colors';
import { confirm } from '../utils/confirm';
import { pinWidget, WIDGET_NAMES, widgetsAvailable } from '../widgets';

const DONATE_URL = 'https://buymeacoffee.com/vadymloik';

export default function SettingsScreen() {
  const { colors, settings, setSettings, t } = useApp();
  const insets = useSafeAreaInsets();

  async function exportCounters() {
    try {
      await exportBackup(t.exportBackup);
    } catch (error) {
      console.warn('Backup export failed', error);
      Alert.alert(t.backup, t.exportFailed);
    }
  }

  async function importFromFile() {
    let items;
    try {
      items = await pickBackup();
    } catch (error) {
      console.warn('Backup import failed', error);
      Alert.alert(t.backup, t.importInvalid);
      return;
    }
    if (!items) return;
    const count = items.length;
    confirm(
      { title: t.importTitle(count), message: t.importMessage, action: t.importAction, cancel: t.cancel },
      async () => {
        try {
          await importCounters(items);
          Alert.alert(t.backup, t.importDone(count));
        } catch (error) {
          console.warn('Backup import failed', error);
          Alert.alert(t.backup, t.importFailed);
        }
      },
    );
  }

  const languages = [
    { key: 'system', label: `🌐 ${t.systemLanguage}` } as const,
    ...LANGUAGES.map((l) => ({ key: l.key, label: `${l.flag} ${l.label}` })),
  ];

  return (
    <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 16 }]}>
      <Labeled label={t.appearance}>
        <FormGroup>
          <FormRow icon="moon" label={t.theme}>
            <Segmented
              options={THEME_MODES.map((key) => ({ key, label: t.themeModes[key] }))}
              selected={settings.mode}
              onSelect={(mode) => setSettings({ mode })}
            />
          </FormRow>
          <FormRow icon="droplet" label={`${t.accent} · ${t.accents[settings.accent]}`}>
            <ColorSwatches
              options={ACCENT_KEYS.map((key) => ({ key, color: ACCENTS[key], label: t.accents[key] }))}
              selected={settings.accent}
              onSelect={(accent) => setSettings({ accent })}
            />
          </FormRow>
          <FormRow icon="globe" label={t.language}>
            <Chips
              options={languages.map((l) => ({
                key: l.key,
                label: l.label,
                active: settings.language === l.key,
                onPress: () => setSettings({ language: l.key }),
              }))}
            />
          </FormRow>
        </FormGroup>
      </Labeled>

      {widgetsAvailable && (
        <Labeled label={t.widgets}>
          <FormGroup>
            <ActionRow icon="grid" label={t.addYearWidget} onPress={() => pinWidget(WIDGET_NAMES.year)} />
            <ActionRow icon="grid" label={t.addCounterWidget} onPress={() => pinWidget(WIDGET_NAMES.counter)} />
          </FormGroup>
          <Text style={[styles.hint, { color: colors.muted }]}>{t.widgetsHint}</Text>
        </Labeled>
      )}

      {backupAvailable && (
        <Labeled label={t.backup}>
          <FormGroup>
            <ActionRow icon="upload" label={t.exportBackup} onPress={exportCounters} />
            <ActionRow icon="download" label={t.importBackup} onPress={importFromFile} />
          </FormGroup>
          <Text style={[styles.hint, { color: colors.muted }]}>{t.backupHint}</Text>
        </Labeled>
      )}

      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>{t.supportTitle}</Text>
        <Text style={[styles.cardText, { color: colors.muted }]}>{t.supportText}</Text>
        <Button title="Buy Me a Coffee" onPress={() => Linking.openURL(DONATE_URL)} />
      </View>

      <View style={styles.about}>
        <Image source={require('../../assets/icon.png')} style={styles.logo} />
        <Text style={[styles.hint, { color: colors.muted }]}>
          Chas · {t.version(Constants.expoConfig?.version ?? '')}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 24 },
  hint: { fontSize: 13, lineHeight: 18, paddingHorizontal: 4 },
  about: { alignItems: 'center', gap: 8, paddingBottom: 8 },
  logo: { width: 40, height: 40, borderRadius: 10 },
  card: { borderRadius: 20, padding: 20, gap: 12 },
  cardTitle: { fontSize: 17, fontWeight: '700' },
  cardText: { fontSize: 15, lineHeight: 21 },
});

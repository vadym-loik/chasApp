import Constants from 'expo-constants';
import { Linking, StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/Button';
import { COLORS, DONATE_URL } from '../theme';

export default function SettingsScreen() {
  return (
    <View style={styles.content}>
      <View style={styles.card}>
        <Text style={styles.title}>☕ Support the app</Text>
        <Text style={styles.text}>
          chasApp is free, with no ads and no subscriptions. If you like it, you can buy me a coffee.
        </Text>
        <Button title="Buy Me a Coffee" onPress={() => Linking.openURL(DONATE_URL)} />
      </View>
      <Text style={styles.version}>Version {Constants.expoConfig?.version}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 16 },
  card: { backgroundColor: '#FFE8C7', borderRadius: 20, padding: 20, gap: 12 },
  title: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  text: { fontSize: 15, color: COLORS.text, lineHeight: 21 },
  version: { textAlign: 'center', color: COLORS.muted, fontSize: 13 },
});

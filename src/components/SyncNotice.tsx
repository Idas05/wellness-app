import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useApp } from '../lib/store';
import { colors } from './Screen';

/** A small reminder, when signed out, that nothing here reaches the other device. */
export function SyncNotice() {
  const { userEmail, setAuthOpen } = useApp();
  if (userEmail) return null;
  return (
    <View style={styles.row}>
      <Text style={styles.text}>Not signed in, so this only saves on this device.</Text>
      <Pressable onPress={() => setAuthOpen(true)} hitSlop={8} accessibilityRole="button">
        <Text style={styles.link}>Sign in</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: colors.line, borderRadius: 12, paddingVertical: 9, paddingHorizontal: 12, marginBottom: 12 },
  text: { flex: 1, fontSize: 13, color: colors.muted },
  link: { fontSize: 13, fontWeight: '700', color: colors.link },
});

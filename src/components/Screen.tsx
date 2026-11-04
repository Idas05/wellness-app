import type { ReactNode } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
  /** Rendered outside the scroll area, e.g. a floating button. */
  overlay?: ReactNode;
};

/** A tab page: safe-area top, big title, scrolls, and leaves room for the tab bar. */
export function Screen({ title, subtitle, children, refreshing, onRefresh, overlay }: Props) {
  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} /> : undefined}
      >
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        {children}
        <View style={{ height: 140 }} />
      </ScrollView>
      {overlay}
    </SafeAreaView>
  );
}

export const colors = {
  bg: '#FAF7F2',
  card: '#FFFFFF',
  ink: '#2B2724',
  muted: '#6B645C',
  line: '#ECE6DD',
};

export const card = StyleSheet.create({
  box: { backgroundColor: colors.card, borderRadius: 18, padding: 16, marginBottom: 14 },
  heading: { fontSize: 13, fontWeight: '700', color: colors.muted, textTransform: 'uppercase', marginBottom: 10 },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { padding: 16, paddingTop: 8, width: '100%', maxWidth: 640, alignSelf: 'center' },
  title: { fontSize: 32, fontWeight: '800', color: colors.ink },
  subtitle: { fontSize: 15, color: colors.muted, marginBottom: 14 },
});

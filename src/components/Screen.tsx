import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
  /** Rendered outside the scroll area, e.g. a floating button. */
  overlay?: ReactNode;
  /** Stays pinned under the title while the page scrolls. */
  pinned?: ReactNode;
};

/** A tab page: safe-area top, big title, scrolls, and leaves room for the tab bar. */
export function Screen({ title, subtitle, children, refreshing, onRefresh, overlay, pinned }: Props) {
  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {pinned ? (
          <View style={styles.pinned}>
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            {pinned}
          </View>
        ) : null}
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          refreshControl={onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} /> : undefined}
        >
          {pinned ? null : (
            <>
              <Text style={styles.title}>{title}</Text>
              {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            </>
          )}
          {children}
          <View style={{ height: 140 }} />
        </ScrollView>
      </KeyboardAvoidingView>
      {overlay}
    </SafeAreaView>
  );
}

export const colors = {
  bg: '#05070D',
  card: '#0E1422',
  field: '#151D30',
  ink: '#EEF2FF',
  muted: '#8C98B3',
  line: '#1F2A40',
  accent: '#3B82F6',
  link: '#60A5FA',
};

export const card = StyleSheet.create({
  box: { backgroundColor: colors.card, borderRadius: 18, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: colors.line },
  heading: { fontSize: 12, fontWeight: '700', color: colors.link, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  pinned: { paddingHorizontal: 16, paddingTop: 8, width: '100%', maxWidth: 640, alignSelf: 'center' },
  container: { padding: 16, paddingTop: 8, width: '100%', maxWidth: 640, alignSelf: 'center' },
  title: { fontSize: 32, fontWeight: '800', color: colors.ink, letterSpacing: -0.5 },
  subtitle: { fontSize: 15, color: colors.muted, marginBottom: 14 },
});

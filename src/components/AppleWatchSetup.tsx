import * as Clipboard from 'expo-clipboard';
import { useEffect, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { card, colors } from './Screen';
import { getOrCreateToken } from '../lib/sleep';
import { useApp } from '../lib/store';
import { supabase } from '../lib/supabase';

const ENDPOINT = `${process.env.EXPO_PUBLIC_SUPABASE_URL ?? ''}/rest/v1/rpc/ingest_sleep`;
const KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';
const GUIDE = 'https://github.com/Idas05/wellness-app/blob/main/docs/apple-watch-sleep.md';

/** The Apple Watch card: shows the values the iPhone Shortcut needs. Starts folded once sleep data arrives. */
export function AppleWatchSetup() {
  const { userEmail, setAuthOpen, refreshSleep, sleep } = useApp();
  const [open, setOpen] = useState(false);
  const folded = sleep.length > 0 && !open;
  const [token, setToken] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    setToken(null);
    setTokenError(null);
    if (!userEmail) return;
    getOrCreateToken()
      .then(setToken)
      .catch((e) =>
        setTokenError(
          /sleep_tokens/.test(String(e?.message))
            ? 'Sleep storage isn’t set up yet. Run supabase/sleep.sql in Supabase once.'
            : String(e?.message ?? e),
        ),
      );
  }, [userEmail]);

  const copy = async (label: string, value: string) => {
    await Clipboard.setStringAsync(value);
    setCopied(label);
    setTimeout(() => setCopied((c) => (c === label ? null : c)), 2000);
  };

  return (
    <>
      <View style={card.box}>
        <Text style={card.heading}>⌚ Apple Watch sleep</Text>
        {!userEmail ? (
          <>
            <Text style={styles.body}>Sign in first, then come back here to connect your Apple Watch.</Text>
            <Pressable style={styles.button} onPress={() => setAuthOpen(true)}>
              <Text style={styles.buttonText}>Sign in</Text>
            </Pressable>
          </>
        ) : tokenError ? (
          <Text style={[styles.body, { color: '#8A2B20' }]}>{tokenError}</Text>
        ) : folded ? (
          <>
            <Text style={styles.body}>Connected. {sleep.length} night(s) received.</Text>
            <Pressable onPress={() => setOpen(true)}>
              <Text style={[styles.small, styles.link]}>Show setup details ›</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Text style={styles.body}>
              A free iPhone Shortcut sends last night’s sleep from the Health app here each morning. Build it once with
              these three values (tap to copy):
            </Text>
            <CopyRow label="Your code" value={token ?? 'Loading…'} copied={copied} onCopy={copy} disabled={!token} />
            <CopyRow label="Web address" value={ENDPOINT} copied={copied} onCopy={copy} />
            <CopyRow label="Key" value={KEY} copied={copied} onCopy={copy} />
            <Text style={styles.small}>Keep your code private, like a password.</Text>
            <Pressable onPress={() => Linking.openURL(GUIDE)}>
              <Text style={[styles.small, styles.link]}>Open the step-by-step Shortcut guide ›</Text>
            </Pressable>
            <Text style={styles.small}>
              {sleep.length > 0 ? `${sleep.length} night(s) received so far.` : 'No nights received yet.'}
            </Text>
            <Pressable style={[styles.button, styles.buttonLight]} onPress={refreshSleep}>
              <Text style={[styles.buttonText, { color: colors.ink }]}>Check for new sleep data</Text>
            </Pressable>
          </>
        )}
      </View>
    </>
  );
}

function CopyRow({
  label,
  value,
  copied,
  onCopy,
  disabled,
}: {
  label: string;
  value: string;
  copied: string | null;
  onCopy: (label: string, value: string) => void;
  disabled?: boolean;
}) {
  return (
    <Pressable style={styles.copyRow} onPress={() => onCopy(label, value)} disabled={disabled}>
      <View style={{ flex: 1 }}>
        <Text style={styles.copyLabel}>{label}</Text>
        <Text style={styles.copyValue} numberOfLines={1} ellipsizeMode="middle">
          {value}
        </Text>
      </View>
      <Text style={styles.copyAction}>{copied === label ? 'Copied ✓' : 'Copy'}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  body: { fontSize: 15, color: colors.ink, lineHeight: 21 },
  small: { fontSize: 13, color: colors.muted, marginTop: 10 },
  button: { marginTop: 14, backgroundColor: colors.ink, borderRadius: 14, padding: 14, alignItems: 'center' },
  buttonLight: { backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.line },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  copyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg,
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
    gap: 10,
  },
  copyLabel: { fontSize: 12, fontWeight: '700', color: colors.muted, textTransform: 'uppercase' },
  copyValue: { fontSize: 14, color: colors.ink, marginTop: 2 },
  link: { color: '#2B6CB0', fontWeight: '700' },
  copyAction: { fontSize: 14, fontWeight: '700', color: '#2B6CB0' },
});

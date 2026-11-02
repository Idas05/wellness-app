import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { supabase } from '../lib/supabase';

type Props = { visible: boolean; onClose: () => void };

export function AuthSheet({ visible, onClose }: Props) {
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const submit = async () => {
    if (!supabase) return;
    setBusy(true);
    setMessage(null);
    const creds = { email: email.trim(), password };
    const { data, error } =
      mode === 'signIn' ? await supabase.auth.signInWithPassword(creds) : await supabase.auth.signUp(creds);
    setBusy(false);
    if (error) return setMessage(error.message);
    if (!data.session) {
      setMode('signIn');
      return setMessage('Check your email and tap the confirmation link, then sign in here.');
    }
    setPassword('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.sheet}>
          <Text style={styles.heading}>{mode === 'signIn' ? 'Sign in' : 'Create account'}</Text>
          <Text style={styles.sub}>Sign in on your phone and the website to keep reminders in sync.</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor="#9A948C"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            style={styles.input}
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password (6+ characters)"
            placeholderTextColor="#9A948C"
            secureTextEntry
            autoComplete={mode === 'signIn' ? 'current-password' : 'new-password'}
            style={styles.input}
          />
          {message && <Text style={styles.message}>{message}</Text>}
          <Pressable
            onPress={submit}
            disabled={busy || !email || password.length < 6}
            style={[styles.primary, (busy || !email || password.length < 6) && { opacity: 0.4 }]}
          >
            {busy ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryText}>{mode === 'signIn' ? 'Sign in' : 'Create account'}</Text>
            )}
          </Pressable>
          <Pressable
            onPress={() => {
              setMode(mode === 'signIn' ? 'signUp' : 'signIn');
              setMessage(null);
            }}
            style={styles.secondary}
          >
            <Text style={styles.secondaryText}>
              {mode === 'signIn' ? 'New here? Create an account' : 'Have an account? Sign in'}
            </Text>
          </Pressable>
          <Pressable onPress={onClose} style={styles.secondary}>
            <Text style={styles.secondaryText}>Not now</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end', alignItems: 'center' },
  sheet: {
    backgroundColor: '#FAF7F2',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 36,
    width: '100%',
    maxWidth: 560,
  },
  heading: { fontSize: 22, fontWeight: '700', color: '#2B2724' },
  sub: { fontSize: 14, color: '#6B645C', marginTop: 4, marginBottom: 16 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DDD6CC',
    padding: 12,
    fontSize: 16,
    color: '#2B2724',
    marginBottom: 10,
  },
  message: { color: '#8A2B20', fontSize: 14, marginBottom: 6 },
  primary: { marginTop: 8, backgroundColor: '#2B2724', borderRadius: 14, padding: 16, alignItems: 'center' },
  primaryText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  secondary: { marginTop: 8, padding: 10, alignItems: 'center' },
  secondaryText: { fontSize: 15, color: '#6B645C', fontWeight: '600' },
});

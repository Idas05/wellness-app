import { router, useLocalSearchParams } from 'expo-router';
import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FormCheckView } from '../components/FormCheckView';
import type { FormCheckMessage } from '../components/FormCheckView.types';

export default function CheckFormScreen() {
  const { exercise } = useLocalSearchParams<{ exercise?: string }>();
  const onMessage = useCallback((m: FormCheckMessage) => {
    if (m.type === 'close') router.canGoBack() ? router.back() : router.navigate('/workout');
  }, []);

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <View style={styles.fill}>
        <FormCheckView exercise={exercise || 'Exercise'} onMessage={onMessage} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FAF7F2' },
  fill: { flex: 1 },
});

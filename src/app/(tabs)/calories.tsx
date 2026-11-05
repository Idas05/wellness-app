import { StyleSheet, Text, View } from 'react-native';
import { card, colors, Screen } from '../../components/Screen';

export default function CaloriesScreen() {
  return (
    <Screen title="Cal Counter" subtitle="Track what you eat each day">
      <View style={[card.box, { alignItems: 'center', paddingVertical: 32 }]}>
        <Text style={styles.emoji}>🍽️</Text>
        <Text style={styles.title}>Coming soon</Text>
        <Text style={styles.body}>Your calorie counter will live here.</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  emoji: { fontSize: 40, marginBottom: 8 },
  title: { fontSize: 20, fontWeight: '700', color: colors.ink },
  body: { fontSize: 15, color: colors.muted, marginTop: 4, textAlign: 'center' },
});

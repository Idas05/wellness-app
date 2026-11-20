import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import type { Macros } from '../lib/macros';
import { colors } from './Screen';

export const MACRO_COLORS = { protein: '#60A5FA', carbs: '#22D3EE', fat: '#A78BFA' } as const;
export const MACRO_LABELS = { protein: 'Protein', carbs: 'Carbs', fat: 'Fat' } as const;
const ORDER = ['protein', 'carbs', 'fat'] as const;

const grams = (n: number) => (n > 0 && n < 1 ? '<1' : String(Math.round(n)));

/** "● 31 g protein  ● 0 g carbs  ● 4 g fat" for a food. */
export function MacroLine({ macros, style }: { macros: Macros; style?: ViewStyle }) {
  return (
    <View style={[styles.row, style]}>
      {ORDER.map((k) => (
        <View key={k} style={styles.item}>
          <View style={[styles.dot, { backgroundColor: MACRO_COLORS[k] }]} />
          <Text style={styles.text}>
            <Text style={styles.num}>{grams(macros[k])} g</Text> {MACRO_LABELS[k].toLowerCase()}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  text: { fontSize: 13, color: colors.muted },
  num: { fontWeight: '700', color: colors.ink },
});

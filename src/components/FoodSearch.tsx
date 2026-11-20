import { useEffect, useState, type ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { displayName, searchCommon, searchOnline, type FoodItem } from '../lib/foods';
import { card, colors } from './Screen';

/** A search bar with results from the built-in list and Open Food Facts. */
export function FoodSearch({
  onPick,
  whenEmpty,
  autoFocus,
}: {
  onPick: (f: FoodItem) => void;
  /** Shown while the search bar is empty, e.g. recent foods. */
  whenEmpty?: ReactNode;
  autoFocus?: boolean;
}) {
  const [query, setQuery] = useState('');
  const [online, setOnline] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const common = searchCommon(query);
  const q = query.trim();

  // Wait until typing pauses before asking the online database.
  useEffect(() => {
    setOnline([]);
    setError(null);
    if (q.length < 2) {
      setLoading(false);
      return;
    }
    const ctrl = new AbortController();
    setLoading(true);
    const t = setTimeout(() => {
      searchOnline(q, ctrl.signal)
        .then((r) => setOnline(r))
        .catch((e) => {
          if (e?.name !== 'AbortError') setError('Couldn’t reach the food database. Check your connection.');
        })
        .finally(() => !ctrl.signal.aborted && setLoading(false));
    }, 450);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

  return (
    <View>
      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>⌕</Text>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search for a food"
          placeholderTextColor="#5B6680"
          style={styles.searchInput}
          autoFocus={autoFocus}
          autoCorrect={false}
          returnKeyType="search"
          accessibilityLabel="Search for a food"
        />
        {query ? (
          <Pressable onPress={() => setQuery('')} hitSlop={10} accessibilityLabel="Clear search">
            <Text style={styles.clear}>✕</Text>
          </Pressable>
        ) : null}
      </View>

      {!q ? whenEmpty : null}

      {q ? (
        <>
          {common.length ? (
            <View style={card.box}>
              <Text style={card.heading}>Common foods</Text>
              {common.map((f, i) => (
                <FoodRow key={f.id} food={f} first={i === 0} onPress={() => onPick(f)} />
              ))}
            </View>
          ) : null}

          <View style={card.box}>
            <Text style={card.heading}>From the food database</Text>
            {loading ? (
              <View style={styles.status}>
                <ActivityIndicator color={colors.ink} />
                <Text style={styles.muted}>Searching…</Text>
              </View>
            ) : error ? (
              <Text style={styles.muted}>{error}</Text>
            ) : online.length ? (
              online.map((f, i) => <FoodRow key={f.id + i} food={f} first={i === 0} onPress={() => onPick(f)} />)
            ) : q.length >= 2 ? (
              <Text style={styles.muted}>No matches. Try a different spelling, or use Quick add.</Text>
            ) : (
              <Text style={styles.muted}>Keep typing…</Text>
            )}
          </View>
        </>
      ) : null}
    </View>
  );
}

export function FoodRow({ food, first, onPress, right }: { food: FoodItem; first?: boolean; onPress: () => void; right?: ReactNode }) {
  const s = food.servings[0];
  return (
    <Pressable onPress={onPress} style={[styles.row, first && { borderTopWidth: 0 }]} accessibilityRole="button" accessibilityLabel={`Pick ${displayName(food)}`}>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={styles.name} numberOfLines={2}>
          {food.name}
        </Text>
        <Text style={styles.sub} numberOfLines={1}>
          {[food.brand, s?.label].filter(Boolean).join(', ')}
        </Text>
      </View>
      {right ?? <Text style={styles.cal}>{s ? Math.round(s.cal) : '–'} cal</Text>}
      <Text style={styles.plus}>＋</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#151D30',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  searchIcon: { fontSize: 20, color: colors.muted },
  searchInput: { flex: 1, minWidth: 0, paddingVertical: 14, fontSize: 16, color: colors.ink },
  clear: { fontSize: 15, color: colors.muted, padding: 4 },
  status: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  muted: { fontSize: 14, color: colors.muted },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, borderTopWidth: 1, borderTopColor: colors.line },
  name: { fontSize: 16, fontWeight: '600', color: colors.ink },
  sub: { fontSize: 13, color: colors.muted, marginTop: 2 },
  cal: { fontSize: 15, fontWeight: '700', color: colors.ink },
  plus: { fontSize: 18, color: '#60A5FA', fontWeight: '700' },
});

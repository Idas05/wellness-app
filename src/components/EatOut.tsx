import { useEffect, useMemo, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import type { DietPrefs } from '../lib/mealPrep';
import { pickRestaurantMeals, PLACE_SITES, PLACES, type RestaurantMeal } from '../lib/restaurants';
import { MacroLine } from './MacroLine';
import { card, colors } from './Screen';

/** Meals shown per restaurant before "Show more". */
const PER_PLACE = 2;

/** Restaurant meals that fit the calories (and protein) you have left today. */
export function EatOut({
  prefs,
  calLeft,
  proteinLeft,
  breakfast,
  mealLabel,
  onLog,
}: {
  prefs: DietPrefs;
  calLeft: number;
  /** null when there's no calorie plan yet to set a protein target. */
  proteinLeft: number | null;
  breakfast: boolean;
  mealLabel: string;
  onLog: (m: RestaurantMeal) => Promise<void>;
}) {
  const [place, setPlace] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string[]>([]);
  const [logged, setLogged] = useState<string[]>([]);
  const picks = useMemo(() => pickRestaurantMeals(calLeft, prefs, breakfast, place, proteinLeft), [calLeft, prefs, breakfast, place, proteinLeft]);
  const places = useMemo(() => PLACES.filter((p) => pickRestaurantMeals(Infinity, prefs, breakfast, p).length), [prefs, breakfast]);
  useEffect(() => setExpanded([]), [breakfast]);
  // One section per restaurant, in the order of each one's best meal.
  const sections = useMemo(() => {
    const out: { place: string; meals: RestaurantMeal[] }[] = [];
    for (const { meal } of picks) {
      const sec = out.find((x) => x.place === meal.place);
      if (sec) sec.meals.push(meal);
      else out.push({ place: meal.place, meals: [meal] });
    }
    return out;
  }, [picks]);
  const over = picks.length > 0 && !picks[0].fits;

  return (
    <>
      <View style={card.box}>
        <Text style={card.heading}>Left for today</Text>
        <View style={styles.leftRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.big}>{Math.max(0, calLeft).toLocaleString()}</Text>
            <Text style={styles.muted}>calories</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.big}>{proteinLeft == null ? '–' : `${Math.max(0, Math.round(proteinLeft))} g`}</Text>
            <Text style={styles.muted}>protein</Text>
          </View>
        </View>
        <Text style={[styles.body, { marginTop: 10 }]}>
          {over
            ? "You're at your calories for today, so these are the lightest options."
            : 'Meals that fit what you have left, with the ones that do the most for your protein first.'}
        </Text>
        {prefs.allergies.length ? <Text style={styles.warn}>Allergies aren't checked for restaurant food. Ask the restaurant before you order.</Text> : null}
      </View>

      <View style={styles.places}>
        {[null, ...places].map((p) => (
          <Pressable key={p ?? 'all'} onPress={() => setPlace(p)} style={[styles.place, place === p && styles.placeOn]} accessibilityRole="radio" accessibilityState={{ selected: place === p }}>
            <Text style={[styles.placeText, place === p && { color: '#fff' }]}>{p ?? 'All'}</Text>
          </Pressable>
        ))}
      </View>

      {picks.length === 0 ? (
        <View style={card.box}>
          <Text style={styles.body}>Nothing here matches your diet{place ? ` at ${place}` : ''}. Try another restaurant.</Text>
        </View>
      ) : (
        sections.map((sec) => {
          const open = place !== null || expanded.includes(sec.place);
          const shown = open ? sec.meals : sec.meals.slice(0, PER_PLACE);
          return (
            <View key={sec.place} style={styles.section}>
              <View style={styles.sectionHead}>
                <Text style={styles.sectionTitle}>{sec.place}</Text>
                {PLACE_SITES[sec.place] ? (
                  <Pressable onPress={() => Linking.openURL(PLACE_SITES[sec.place])} accessibilityRole="link" hitSlop={8}>
                    <Text style={styles.siteLink}>Check nutrition ›</Text>
                  </Pressable>
                ) : null}
              </View>
              {shown.map((m) => {
                const done = logged.includes(m.id);
                return (
                  <View key={m.id} style={[card.box, { marginBottom: 10 }]}>
                    <Text style={styles.name}>{m.name}</Text>
                    {m.order ? <Text style={styles.order}>{m.order}</Text> : null}
                    <View style={styles.calRow}>
                      <Text style={styles.cal}>{m.cal.toLocaleString()} cal</Text>
                      {proteinLeft != null && proteinLeft > 0 ? (
                        <Text style={styles.share}>covers {Math.min(100, Math.round((m.protein / proteinLeft) * 100))}% of your protein left</Text>
                      ) : null}
                    </View>
                    <MacroLine macros={m} style={{ marginTop: 6 }} />
                    <Pressable
                      onPress={async () => {
                        await onLog(m);
                        setLogged((l) => [...l, m.id]);
                      }}
                      disabled={done}
                      style={[styles.button, done && { opacity: 0.6 }]}
                      accessibilityRole="button"
                      accessibilityLabel={`Log ${m.name} to ${mealLabel}`}
                    >
                      <Text style={styles.buttonText}>{done ? 'Logged ✓' : `Log to ${mealLabel}`}</Text>
                    </Pressable>
                  </View>
                );
              })}
              {sec.meals.length > shown.length ? (
                <Pressable onPress={() => setExpanded((e) => [...e, sec.place])} style={styles.more} accessibilityRole="button">
                  <Text style={styles.moreText}>
                    Show {sec.meals.length - shown.length} more from {sec.place}
                  </Text>
                </Pressable>
              ) : null}
            </View>
          );
        })
      )}

      <Text style={[styles.muted, { textAlign: 'center', marginTop: 6 }]}>
        Numbers are estimates based on each chain's published nutrition info, and menus change. Tap "Check nutrition" for the exact
        numbers before you count on them.
      </Text>
    </>
  );
}

const styles = StyleSheet.create({
  leftRow: { flexDirection: 'row', gap: 12 },
  big: { fontSize: 30, fontWeight: '800', color: colors.ink },
  body: { fontSize: 15, color: colors.ink, lineHeight: 21 },
  muted: { fontSize: 13, color: colors.muted },
  warn: { fontSize: 13, color: '#FCD34D', marginTop: 8 },
  places: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  place: { paddingVertical: 7, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card },
  placeOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  placeText: { fontSize: 13, fontWeight: '600', color: colors.ink },
  section: { marginBottom: 8 },
  sectionHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8, paddingHorizontal: 2 },
  siteLink: { fontSize: 13, fontWeight: '700', color: colors.link },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: colors.link },
  name: { fontSize: 17, fontWeight: '800', color: colors.ink },
  order: { fontSize: 13, color: colors.muted, marginTop: 3 },
  calRow: { flexDirection: 'row', alignItems: 'baseline', gap: 10, marginTop: 10, flexWrap: 'wrap' },
  cal: { fontSize: 16, fontWeight: '800', color: colors.ink },
  share: { fontSize: 13, color: '#34D399', fontWeight: '600' },
  button: { marginTop: 14, backgroundColor: colors.accent, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  buttonText: { fontSize: 15, fontWeight: '700', color: '#fff' },
  more: { borderRadius: 12, borderWidth: 1, borderColor: colors.line, paddingVertical: 11, alignItems: 'center', marginBottom: 6 },
  moreText: { fontSize: 15, fontWeight: '700', color: colors.ink },
});

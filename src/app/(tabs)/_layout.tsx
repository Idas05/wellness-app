import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs, type BottomTabBarProps } from 'expo-router/js-tabs';
import { LayoutAnimation, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type IconName = keyof typeof Ionicons.glyphMap;

const TABS: Record<string, { label: string; icon: IconName; iconActive: IconName }> = {
  index: { label: 'Reminders', icon: 'notifications-outline', iconActive: 'notifications' },
  sleep: { label: 'Sleep', icon: 'moon-outline', iconActive: 'moon' },
  calories: { label: 'Cal Counter', icon: 'restaurant-outline', iconActive: 'restaurant' },
  workout: { label: 'Workout', icon: 'barbell-outline', iconActive: 'barbell' },
  'meal-prep': { label: 'Meal Prep', icon: 'nutrition-outline', iconActive: 'nutrition' },
  'fitness-track': { label: 'Fitness Track', icon: 'pulse-outline', iconActive: 'pulse' },
};

const BAR_MAX = 480;
const BAR_SIDE = 10; // gap to the screen edge on each side
const BAR_INSET = 2 + 8; // border + padding, both sides

/**
 * Every tab gets an exact width instead of flex sizing. On iPhone, flex sizing kept stale widths after
 * switching tabs (old tabs stayed wide, later ones got squashed and the pill slid off the edge).
 */
function tabWidths(screenWidth: number, count: number) {
  const inner = Math.min(BAR_MAX, screenWidth - BAR_SIDE * 2) - BAR_INSET;
  const idle = Math.max(30, Math.min(56, Math.floor((inner * 0.52) / Math.max(count - 1, 1))));
  return { idle, active: inner - idle * (count - 1) };
}

function PillTabBar({ state, emitter, navigateToTab }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const count = state.routes.filter((r) => TABS[r.name]).length;
  const widths = tabWidths(screenWidth, count);
  return (
    <View pointerEvents="box-none" style={[styles.wrap, { bottom: Math.max(insets.bottom, 12) }]}>
      <View style={styles.bar}>
        {state.routes.map((route, i) => {
          const tab = TABS[route.name];
          if (!tab) return null;
          const focused = state.index === i;
          const onPress = () => {
            const event = emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) {
              LayoutAnimation.configureNext(LayoutAnimation.create(220, 'easeInEaseOut', 'scaleXY'));
              navigateToTab(route.key);
            }
          };
          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={tab.label}
              style={[styles.item, { width: focused ? widths.active : widths.idle }, focused && styles.itemActive]}
            >
              <Ionicons name={focused ? tab.iconActive : tab.icon} size={focused ? 20 : 23} color={focused ? '#fff' : '#8C98B3'} />
              {/* Only the open tab shows its name, which keeps the bar clean and leaves room for more tabs. */}
              {focused ? (
                <Text style={styles.label} numberOfLines={1}>
                  {tab.label}
                </Text>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <PillTabBar {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: '#05070D' } }}
    >
      <Tabs.Screen name="index" options={{ title: 'Reminders' }} />
      <Tabs.Screen name="sleep" options={{ title: 'Sleep' }} />
      <Tabs.Screen name="calories" options={{ title: 'Cal Counter' }} />
      <Tabs.Screen name="workout" options={{ title: 'Workout' }} />
      <Tabs.Screen name="meal-prep" options={{ title: 'Meal Prep' }} />
      <Tabs.Screen name="fitness-track" options={{ title: 'Fitness Track' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 10, right: 10, alignItems: 'center' },
  bar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(14,20,34,0.92)',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#24314D',
    padding: 4,
    width: '100%',
    maxWidth: 480,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  item: { alignItems: 'center', justifyContent: 'center', height: 48, borderRadius: 999, overflow: 'hidden' },
  itemActive: { flexDirection: 'row', gap: 6, paddingHorizontal: 10, backgroundColor: '#3B82F6' },
  label: { flexShrink: 1, color: '#fff', fontSize: 13, fontWeight: '700' },
});

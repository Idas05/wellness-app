import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { lookupBarcode, type ScannedFood } from '../lib/foodLookup';
import { colors } from './Screen';

type Props = {
  visible: boolean;
  onClose: () => void;
  onAdd: (name: string, calories: number) => void;
};

type State =
  | { step: 'scan' }
  | { step: 'loading'; barcode: string }
  | { step: 'found'; food: ScannedFood }
  | { step: 'missing'; barcode: string }
  | { step: 'error'; message: string };

// The camera only scans on the phone; the website lets you type the number under the barcode.
const canUseCamera = Platform.OS !== 'web';

export function BarcodeScanner({ visible, onClose, onAdd }: Props) {
  const [state, setState] = useState<State>({ step: 'scan' });
  const [typed, setTyped] = useState('');
  const busy = useRef(false);

  useEffect(() => {
    if (visible) {
      setState({ step: 'scan' });
      setTyped('');
      busy.current = false;
    }
  }, [visible]);

  const look = async (barcode: string) => {
    if (busy.current) return;
    busy.current = true;
    setState({ step: 'loading', barcode });
    try {
      const food = await lookupBarcode(barcode);
      setState(food ? { step: 'found', food } : { step: 'missing', barcode });
    } catch (e) {
      setState({ step: 'error', message: e instanceof Error ? e.message : 'Something went wrong.' });
    }
  };

  const again = () => {
    busy.current = false;
    setTyped('');
    setState({ step: 'scan' });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.backdrop} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.sheet}>
          <Text style={styles.heading}>Scan a barcode</Text>

          {state.step === 'scan' && (
            <>
              {canUseCamera && <Camera onScanned={(r) => look(r.data)} />}
              <Text style={styles.label}>{canUseCamera ? 'Or type the number under the barcode' : 'Type the number under the barcode'}</Text>
              <View style={styles.row}>
                <TextInput
                  value={typed}
                  onChangeText={(t) => setTyped(t.replace(/\D/g, ''))}
                  placeholder="e.g. 012345678905"
                  placeholderTextColor="#9A948C"
                  keyboardType="number-pad"
                  style={[styles.input, { flex: 1 }]}
                  onSubmitEditing={() => typed.length >= 8 && look(typed)}
                />
                <Pressable
                  onPress={() => look(typed)}
                  disabled={typed.length < 8}
                  style={[styles.smallButton, typed.length < 8 && { opacity: 0.4 }]}
                >
                  <Text style={styles.buttonText}>Look up</Text>
                </Pressable>
              </View>
            </>
          )}

          {state.step === 'loading' && (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={colors.ink} />
              <Text style={styles.muted}>Looking up {state.barcode}…</Text>
            </View>
          )}

          {state.step === 'found' && <FoundFood food={state.food} onAdd={onAdd} onAgain={again} />}

          {state.step === 'missing' && (
            <View style={styles.center}>
              <Text style={styles.title}>Not found</Text>
              <Text style={[styles.muted, { textAlign: 'center' }]}>
                Barcode {state.barcode} isn't in the food database yet. Scan again, or close this and type the food in
                yourself.
              </Text>
              <Pressable onPress={again} style={styles.button}>
                <Text style={styles.buttonText}>Scan again</Text>
              </Pressable>
            </View>
          )}

          {state.step === 'error' && (
            <View style={styles.center}>
              <Text style={styles.title}>Couldn't look it up</Text>
              <Text style={[styles.muted, { textAlign: 'center' }]}>{state.message} Check your internet connection.</Text>
              <Pressable onPress={again} style={styles.button}>
                <Text style={styles.buttonText}>Try again</Text>
              </Pressable>
            </View>
          )}

          <Pressable onPress={onClose} style={styles.secondary}>
            <Text style={styles.secondaryText}>Close</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function Camera({ onScanned }: { onScanned: (r: BarcodeScanningResult) => void }) {
  const [permission, requestPermission] = useCameraPermissions();
  if (!permission) return <View style={styles.camera} />;
  if (!permission.granted) {
    return (
      <View style={[styles.camera, styles.center]}>
        <Text style={[styles.muted, { color: '#fff', textAlign: 'center' }]}>
          {permission.canAskAgain
            ? 'Allow the camera to scan barcodes.'
            : 'Camera access is off. Turn it on in Settings › Expo Go › Camera.'}
        </Text>
        {permission.canAskAgain && (
          <Pressable onPress={requestPermission} style={[styles.button, { backgroundColor: '#fff' }]}>
            <Text style={[styles.buttonText, { color: colors.ink }]}>Allow camera</Text>
          </Pressable>
        )}
      </View>
    );
  }
  return (
    <View style={styles.camera}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e'] }}
        onBarcodeScanned={onScanned}
      />
      <View pointerEvents="none" style={styles.frame} />
    </View>
  );
}

function FoundFood({
  food,
  onAdd,
  onAgain,
}: {
  food: ScannedFood;
  onAdd: (name: string, calories: number) => void;
  onAgain: () => void;
}) {
  const byServing = food.perServing !== null;
  const [servings, setServings] = useState(1);
  const [grams, setGrams] = useState('100');
  const g = parseFloat(grams) || 0;
  const calories = byServing ? Math.round(food.perServing! * servings) : Math.round(((food.per100g ?? 0) * g) / 100);

  return (
    <View>
      <Text style={styles.title}>{food.name}</Text>
      <Text style={styles.muted}>
        {byServing ? `${food.perServing} cal per ${food.servingLabel}` : `${food.per100g} cal per 100 g`}
      </Text>

      {byServing ? (
        <View style={styles.stepper}>
          <Pressable onPress={() => setServings((s) => Math.max(0.5, s - 0.5))} style={styles.stepBtn} accessibilityLabel="Fewer servings">
            <Text style={styles.stepText}>−</Text>
          </Pressable>
          <Text style={styles.amount}>
            {servings} serving{servings === 1 ? '' : 's'}
          </Text>
          <Pressable onPress={() => setServings((s) => Math.min(20, s + 0.5))} style={styles.stepBtn} accessibilityLabel="More servings">
            <Text style={styles.stepText}>+</Text>
          </Pressable>
        </View>
      ) : (
        <View style={[styles.row, { marginTop: 16, alignItems: 'center' }]}>
          <TextInput
            value={grams}
            onChangeText={(t) => setGrams(t.replace(/[^0-9.]/g, ''))}
            keyboardType="decimal-pad"
            style={[styles.input, { flex: 1 }]}
          />
          <Text style={styles.unit}>grams</Text>
        </View>
      )}

      <Pressable onPress={() => onAdd(food.name, calories)} disabled={calories <= 0} style={[styles.button, calories <= 0 && { opacity: 0.4 }]}>
        <Text style={styles.buttonText}>Add {calories} cal</Text>
      </Pressable>
      <Pressable onPress={onAgain} style={styles.secondary}>
        <Text style={styles.secondaryText}>Scan something else</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end', alignItems: 'center' },
  sheet: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 36,
    width: '100%',
    maxWidth: 560,
  },
  heading: { fontSize: 22, fontWeight: '700', color: colors.ink, marginBottom: 12 },
  title: { fontSize: 20, fontWeight: '700', color: colors.ink, marginBottom: 4 },
  label: { fontSize: 13, fontWeight: '700', color: colors.muted, textTransform: 'uppercase', marginTop: 14, marginBottom: 6 },
  muted: { fontSize: 14, color: colors.muted, marginTop: 6 },
  camera: { height: 260, borderRadius: 16, overflow: 'hidden', backgroundColor: '#000' },
  frame: {
    position: 'absolute',
    left: '12%',
    right: '12%',
    top: '30%',
    bottom: '30%',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.85)',
    borderRadius: 12,
  },
  center: { alignItems: 'center', justifyContent: 'center', paddingVertical: 20, gap: 4 },
  row: { flexDirection: 'row', gap: 10 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 12,
    fontSize: 16,
    color: colors.ink,
    minWidth: 0,
  },
  unit: { fontSize: 15, color: colors.muted, fontWeight: '600' },
  button: { marginTop: 16, backgroundColor: colors.ink, borderRadius: 14, padding: 14, paddingHorizontal: 24, alignItems: 'center', alignSelf: 'stretch' },
  smallButton: { backgroundColor: colors.ink, borderRadius: 12, paddingHorizontal: 16, justifyContent: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  secondary: { marginTop: 8, padding: 10, alignItems: 'center' },
  secondaryText: { fontSize: 15, color: colors.muted, fontWeight: '600' },
  stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', borderRadius: 14, padding: 8, marginTop: 16 },
  stepBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  stepText: { fontSize: 24, fontWeight: '700', color: colors.ink },
  amount: { fontSize: 18, fontWeight: '700', color: colors.ink },
});

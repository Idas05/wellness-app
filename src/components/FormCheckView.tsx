import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import type { FormCheckMessage } from './FormCheckView.types';

// The form checker runs as a web page (camera + free on-device pose tracker), so the
// phone app shows the published page in a WebView with camera access allowed.
const PAGE = 'https://idas05.github.io/wellness-app/form-check/';

export function FormCheckView({ exercise, onMessage }: { exercise: string; onMessage: (m: FormCheckMessage) => void }) {
  return (
    <WebView
      source={{ uri: `${PAGE}?exercise=${encodeURIComponent(exercise)}` }}
      style={styles.web}
      originWhitelist={['*']}
      javaScriptEnabled
      allowsInlineMediaPlayback
      mediaPlaybackRequiresUserAction={false}
      mediaCapturePermissionGrantType="grant"
      onMessage={(e) => {
        try {
          const data = JSON.parse(e.nativeEvent.data);
          if (data?.source === 'form-check') onMessage(data);
        } catch {}
      }}
    />
  );
}

const styles = StyleSheet.create({ web: { flex: 1, backgroundColor: '#05070D' } });

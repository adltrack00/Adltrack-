// Delivery for Android and iPhone: the same app as the website (one login per person, live data), in a native
// shell with the camera for doorstep photos, the phone's back button and pull-to-refresh.
// Set the address of your Render service in app.json > expo.extra.appUrl.
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, BackHandler, Linking, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import Constants from "expo-constants";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

const APP_URL = ((Constants.expoConfig && Constants.expoConfig.extra && Constants.expoConfig.extra.appUrl) || "https://delivery.onrender.com").replace(/\/$/, "");
const HOST = APP_URL.replace(/^https?:\/\//, "").split("/")[0];

export default function App() {
  const web = useRef(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [failed, setFailed] = useState(false);
  const [key, setKey] = useState(0);

  // Android back button goes back inside the app before leaving it.
  useEffect(() => {
    if (Platform.OS !== "android") return undefined;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (canGoBack && web.current) { web.current.goBack(); return true; }
      return false;
    });
    return () => sub.remove();
  }, [canGoBack]);

  // Links to other sites (WhatsApp, maps, phone calls) open in their own apps.
  const onLink = useCallback((req) => {
    const url = req.url || "";
    if (url.startsWith(APP_URL) || url.startsWith("about:") || url.startsWith("data:") || url.startsWith("blob:")) return true;
    if (/^https?:\/\//.test(url) && url.replace(/^https?:\/\//, "").split("/")[0] === HOST) return true;
    Linking.openURL(url).catch(() => {});
    return false;
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
        <StatusBar style="light" backgroundColor="#05061a" />
        {failed ? (
          <View style={styles.center}>
            <Text style={styles.title}>No connection</Text>
            <Text style={styles.sub}>Delivery couldn't reach the server. Check your data or Wi-Fi.</Text>
            <Pressable style={styles.btn} onPress={() => { setFailed(false); setKey((k) => k + 1); }}>
              <Text style={styles.btnText}>Try again</Text>
            </Pressable>
          </View>
        ) : (
          <WebView
            key={key}
            ref={web}
            source={{ uri: `${APP_URL}/app` }}
            style={styles.web}
            originWhitelist={["*"]}
            sharedCookiesEnabled
            thirdPartyCookiesEnabled
            domStorageEnabled
            javaScriptEnabled
            allowFileAccess
            allowsBackForwardNavigationGestures
            pullToRefreshEnabled
            mediaCapturePermissionGrantType="grant"
            allowsInlineMediaPlayback
            setSupportMultipleWindows={false}
            startInLoadingState
            renderLoading={() => <View style={styles.center}><ActivityIndicator color="#6b8bff" size="large" /></View>}
            onNavigationStateChange={(s) => setCanGoBack(s.canGoBack)}
            onShouldStartLoadWithRequest={onLink}
            onError={() => setFailed(true)}
            onHttpError={(e) => { if (e.nativeEvent.statusCode >= 500 && e.nativeEvent.url.startsWith(APP_URL) && !e.nativeEvent.url.includes("/api/")) setFailed(true); }}
            applicationNameForUserAgent="DeliveryApp/1.0"
          />
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#05061a" },
  web: { flex: 1, backgroundColor: "#05061a" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, backgroundColor: "#05061a" },
  title: { color: "#fff", fontSize: 26, fontWeight: "800" },
  sub: { color: "rgba(255,255,255,0.6)", fontSize: 16, textAlign: "center", marginTop: 8 },
  btn: { marginTop: 24, backgroundColor: "#fff", borderRadius: 999, paddingHorizontal: 32, paddingVertical: 16 },
  btnText: { color: "#000", fontSize: 17, fontWeight: "700" },
});

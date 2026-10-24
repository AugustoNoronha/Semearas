import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { AuthProvider, useAuth } from '../context/AuthContext';

function Navigation() {
  const { session, loading, restoreError, retry, discard } = useAuth();
  if (loading || restoreError) return <View style={styles.loading}>
    <Text style={styles.brand}>SEMEARAS</Text>
    {loading ? <ActivityIndicator color="#244D3D" accessibilityLabel="Verificando sessão" /> : <>
      <Text style={styles.message}>{restoreError}</Text>
      <Pressable onPress={retry} accessibilityRole="button" style={styles.button}><Text>Tentar novamente</Text></Pressable>
      <Pressable onPress={() => { void discard(); }} accessibilityRole="button" style={styles.button}><Text>Voltar ao login</Text></Pressable>
    </>}
  </View>;
  return <Stack screenOptions={{ headerShown: false, animation: 'fade', contentStyle: { backgroundColor: '#FAF9F6' } }}>
    <Stack.Screen name="index" />
    <Stack.Protected guard={!session}>
      <Stack.Screen name="cadastro" />
    </Stack.Protected>
    <Stack.Protected guard={!!session}>
      <Stack.Screen name="meus-cadastros" />
      <Stack.Screen name="cadastros/novo" />
      <Stack.Screen name="cadastros/[id]" />
      <Stack.Screen name="conta" />
    </Stack.Protected>
  </Stack>;
}

export default function RootLayout() {
  return <SafeAreaProvider>
    <StatusBar style="dark" />
    <AuthProvider><Navigation /></AuthProvider>
  </SafeAreaProvider>;
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 24, backgroundColor: '#FAF9F6' },
  brand: { color: '#244D3D', fontSize: 24, fontWeight: '700', letterSpacing: 3 },
  message: { maxWidth: 420, textAlign: 'center', lineHeight: 22, color: '#344D3D' },
  button: { padding: 16, backgroundColor: '#E5EADD', borderRadius: 8 },
});

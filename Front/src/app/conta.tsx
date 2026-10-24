import Head from 'expo-router/head';
import { Link } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { formatCpf } from '../utils/validation';

export default function Account() {
  const { session, refresh, logout } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (!session) return null;
  const { user } = session;
  async function action(callback: () => Promise<void>) {
    if (busy) return;
    setBusy(true); setError(null);
    try { await callback(); }
    catch (error) { setError(error instanceof Error ? error.message : 'Não foi possível concluir. Tente novamente.'); }
    finally { setBusy(false); }
  }
  return <SafeAreaView style={s.safe}>
    <Head><title>Minha conta | SEMEARAS</title></Head>
    <ScrollView contentContainerStyle={s.scroll}>
      <View style={s.card}>
        <Text style={s.brand}>SEMEARAS</Text>
        <Link dismissTo href="/meus-cadastros" style={{ color: '#244D3D', marginTop: 24, paddingVertical: 8 }}>← Meus cadastros</Link>
        <Text style={s.eyebrow}>SEU ESPAÇO</Text>
        <Text accessibilityRole="header" style={s.title}>Olá, {user.name.split(' ')[0]}.</Text>
        <Text style={s.subtitle}>Que bom ter você por aqui. Sua conta está pronta para um novo começo.</Text>
        <View style={s.details}>
          <Text style={s.label}>Nome</Text><Text style={s.value}>{user.name}</Text>
          <Text style={s.label}>E-mail</Text><Text style={s.value}>{user.email}</Text>
          <Text style={s.label}>CPF</Text><Text style={s.value}>{formatCpf(user.cpf)}</Text>
          <Text style={s.label}>Tipo de usuário</Text><Text style={s.value}>{user.role}</Text>
        </View>
        {error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}
        {busy && <ActivityIndicator color="#244D3D" accessibilityLabel="Aguarde" />}
        <Pressable disabled={busy} accessibilityRole="button" onPress={() => { void action(refresh); }} style={[s.secondary, busy && s.disabled]}><Text style={s.secondaryText}>Recarregar meus dados</Text></Pressable>
        <Pressable disabled={busy} accessibilityRole="button" onPress={() => { void action(logout); }} style={[s.primary, busy && s.disabled]}><Text style={s.primaryText}>Sair da conta</Text></Pressable>
      </View>
    </ScrollView>
  </SafeAreaView>;
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FAF9F6' }, scroll: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  card: { width: '100%', maxWidth: 520, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E0E5D9', borderRadius: 16, padding: 28 },
  brand: { color: '#244D3D', fontSize: 21, fontWeight: '700', letterSpacing: 3 },
  eyebrow: { marginTop: 40, fontSize: 10, letterSpacing: 2, color: '#6A825C', fontWeight: '700' },
  title: { color: '#244D3D', fontSize: 30, marginTop: 12, fontWeight: '600' },
  subtitle: { color: '#71786D', lineHeight: 23, marginTop: 12 },
  details: { marginVertical: 28 }, label: { fontSize: 12, color: '#71786D', marginBottom: 5 }, value: { color: '#244D3D', fontSize: 16, marginBottom: 18 },
  error: { color: '#A23728', lineHeight: 22, marginBottom: 18 },
  primary: { backgroundColor: '#244D3D', minHeight: 50, padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 12 },
  primaryText: { color: '#FFF', fontWeight: '600' }, secondary: { borderWidth: 1, borderColor: '#CAD7BF', minHeight: 50, padding: 16, borderRadius: 8, alignItems: 'center' },
  secondaryText: { color: '#244D3D', fontWeight: '600' }, disabled: { opacity: 0.6 },
});
